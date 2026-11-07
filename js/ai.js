export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

function chatCodeBlock(code, language) {
  return `<div class="chat-code"><button class="code-copy" type="button" data-action="copy-code">Kopieer</button><pre><code data-lang="${escapeHtml(language)}">${escapeHtml(code)}</code></pre></div>`;
}

function renderTextBlocks(value) {
  const lines = value.split(/\r?\n/);
  let html = "";
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p class="md-line">${inlineMarkdown(paragraph.join(" "))}</p>`;
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    html += `<${list.type} class="md-list">${list.items
      .map((item) => `<li>${inlineMarkdown(item)}</li>`)
      .join("")}</${list.type}>`;
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      html += `<div class="md-h">${inlineMarkdown(heading[1])}</div>`;
      continue;
    }

    const unordered = trimmed.match(/^[-*•]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(unordered[1]);
      continue;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return html;
}

export function renderMarkdown(value) {
  const source = String(value || "");
  const pattern = /```([^\n`]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source))) {
    parts.push({ type: "text", value: source.slice(lastIndex, match.index) });
    parts.push({
      type: "code",
      language: match[1].trim() || "python",
      value: match[2].replace(/\n$/, "")
    });
    lastIndex = pattern.lastIndex;
  }

  parts.push({ type: "text", value: source.slice(lastIndex) });

  return parts
    .map((part) =>
      part.type === "code"
        ? chatCodeBlock(part.value, part.language)
        : renderTextBlocks(part.value)
    )
    .join("");
}

function normalizeConfig(data) {
  return {
    hasServerKey: Boolean(data.hasServerKey),
    model: String(data.model || ""),
    accessCodeRequired: Boolean(data.accessCodeRequired),
    donateUrl: String(data.donateUrl || ""),
    donateLabel: String(data.donateLabel || ""),
    donateNote: String(data.donateNote || ""),
    donateIban: String(data.donateIban || ""),
    donateName: String(data.donateName || ""),
    donateBank: String(data.donateBank || "")
  };
}

const EMPTY_CONFIG = {
  hasServerKey: false,
  model: "",
  accessCodeRequired: false,
  donateUrl: "",
  donateLabel: "",
  donateNote: "",
  donateIban: "",
  donateName: "",
  donateBank: ""
};

export async function fetchConfig() {
  // Eerst de Node-server (lokaal/Render). Die kent ook de online AI-coach.
  try {
    const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("config");
    return normalizeConfig(await response.json());
  } catch {
    // GitHub Pages heeft geen server: gebruik de statische config voor donaties.
    try {
      const response = await fetch("site-config.json", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("config");
      return normalizeConfig(await response.json());
    } catch {
      return { ...EMPTY_CONFIG };
    }
  }
}

export function isAIConfigured(settings, serverConfig) {
  const hasKey = Boolean(serverConfig?.hasServerKey || settings?.apiKey);
  const hasAccess = !serverConfig?.accessCodeRequired || Boolean(settings?.accessCode);
  return hasKey && hasAccess;
}

export async function streamChat({ messages, context, settings, mode = "chat", onDelta, signal }) {
  const payload = {
    messages: messages.map(({ role, content }) => ({ role, content })),
    context,
    mode
  };

  if (settings?.apiKey) payload.apiKey = settings.apiKey;
  if (settings?.model) payload.model = settings.model;
  if (settings?.baseUrl) payload.baseUrl = settings.baseUrl;
  if (settings?.accessCode) payload.accessCode = settings.accessCode;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      // Geen JSON-foutmelding beschikbaar.
    }
    const error = new Error(data?.message || data?.error || `AI-fout (${response.status})`);
    error.status = response.status;
    error.code = data?.error;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/event-stream")) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        onDelta?.(content);
        return content;
      }
    } catch {
      // Val terug op platte tekst.
    }
    if (text) onDelta?.(text);
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).replace(/\r$/, "").trim();
      buffer = buffer.slice(newline + 1);
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta?.(delta);
        }
      } catch {
        // Onvolledige of onbekende SSE-regel overslaan.
      }
    }
  }

  return full;
}

function capitalize(value) {
  const text = String(value || "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function guessCategory(topic) {
  const text = String(topic || "").toLowerCase();
  if (/(game|spel|raad|puzzel|kaart|doolhof|snake|tetris)/.test(text)) return "Games";
  if (/(website|web|api|flask|fastapi|html|server)/.test(text)) return "Web";
  if (/(gui|venster|tkinter|desktop|app)/.test(text)) return "GUI";
  if (/(data|analyse|machine|learning|ai|model|voorspel|ml)/.test(text)) return "Data & AI";
  if (/(automat|script|backup|planning|herhaal|watcher)/.test(text)) return "Automatisering";
  if (/(beveilig|wachtwoord|encrypt|hash|security|scanner)/.test(text)) return "Security";
  if (/(reken|wiskunde|natuurkunde|sterren|dna|simulatie|statistiek)/.test(text)) return "Wetenschap";
  if (/(kunst|teken|muziek|gedicht|kleur|foto|pixel)/.test(text)) return "Kunst & Creatief";
  if (/(leren|oefen|quiz|school|taal|rekenen|flashcard)/.test(text)) return "Onderwijs";
  return "Handige tools";
}

export function offlineReply({ text, context }) {
  const question = String(text || "").toLowerCase();

  if (context?.step) {
    const { idea, step } = context;
    const number = step.index + 1;
    return `## ${idea.title} — stap ${number}

**${step.title}**

${step.text}

Zo ziet de code van deze stap eruit:

\`\`\`python
${step.code || "# Deze stap heeft geen codevoorbeeld."}
\`\`\`

### Zo test je het
1. Voer precies deze code uit.
2. Kijk of de uitvoer overeenkomt met wat je verwacht.
3. Krijg je een foutmelding? Plak de hele melding hier, dan help ik je verder.

*Ik werk nu als offline coach. Stel je OpenAI-sleutel in voor uitgebreidere antwoorden.*`;
  }

  if (/(fout|error|traceback|werkt niet|crash|bug)/.test(question)) {
    return `## Samen debuggen

Een foutmelding is meestal een aanwijzing, geen ramp. Loop dit rijtje af:

1. **Lees de laatste regel** van de traceback. Daar staat het type fout en vaak de oorzaak.
2. **Kijk naar het regelnummer** boven de fout. Daar ging het mis.
3. **Print tussenresultaten** met \`print()\` vlak voor de fout.
4. **Isoleer het probleem** in een klein bestand met alleen die paar regels.
5. **Plak hier de volledige foutmelding en je code**, dan wijs ik de waarschijnlijke oorzaak aan.

\`\`\`python
# Handig bij twijfel:
print(type(mijn_waarde), repr(mijn_waarde))
\`\`\`

*Offline coach: voor een gericht antwoord op jouw code heb je een AI-sleutel nodig.*`;
  }

  if (/(geen idee|welk project|bedenk|idee|begin)/.test(question)) {
    return `## Een project kiezen

Beantwoord eerst deze drie vragen voor jezelf:

1. **Hoeveel tijd heb je?** Een korte tool van 30 minuten of een project van een paar uur?
2. **Wat wil je leren?** Bestanden, een website, een GUI, data of spelletjes?
3. **Wat gebruik je al?** Als je net begint, kies een project met alleen \`print\`, \`input\` en \`if\`.

Daarna kun je op de homepage filteren op **niveau** en **tijdsduur**. Wil je iets heel specifieks? Gebruik dan **AI-idee maken** en beschrijf je onderwerp in één zin.

*Offline coach: met een AI-sleutel kan ik een compleet project op maat voor je bedenken.*`;
  }

  return `## Zo pak ik dit aan

Ik werk nu als **offline coach**. Dit is een algemene aanpak die bij bijna elk Python-project werkt:

1. **Schrijf op wat het programma moet doen.** Eén zin is genoeg.
2. **Maak de kleinste werkende versie.** Eerst alleen de kern, nog geen mooie vormgeving.
3. **Test na elke wijziging.** Voer je script uit en kijk of de uitvoer klopt.
4. **Bouw daarna pas uit.** Voeg één functie tegelijk toe.
5. **Bewaar een werkende versie.** Dan kun je altijd terug.

\`\`\`python
# Begin altijd met een minimale versie:
def main():
    print("Hallo EasyCodey!")

if __name__ == "__main__":
    main()
\`\`\`

Wil je hulp bij jouw specifieke idee of foutmelding? Stel je OpenAI-sleutel in via de instellingen, dan kan ik gericht meekijken.`;
}

export function buildProjectRequest({ topic, level, time, category }) {
  return `Maak een compleet Python-projectidee.

Onderwerp: ${topic || "een verrassend beginnersproject"}
Niveau: ${level || "Beginner"}
Beschikbare tijd: ${time || "45 min"}
Categorie: ${category || "laat de AI kiezen"}

Antwoord met ALLEEN geldige JSON, zonder markdown of uitleg eromheen. Gebruik exact deze structuur:
{
  "title": "korte pakkende titel",
  "emoji": "één emoji",
  "category": "Games|Web|GUI|Data & AI|Handige tools|Automatisering|Security|Wetenschap|Kunst & Creatief|Onderwijs",
  "level": "Beginner|Gemiddeld|Gevorderd",
  "time": "bijv. 45 min",
  "summary": "één zin",
  "description": "twee of drie zinnen uitleg",
  "learn": ["vaardigheid1", "vaardigheid2", "vaardigheid3"],
  "steps": [
    {
      "title": "titel van de stap",
      "text": "uitleg in 1-3 zinnen",
      "code": "werkende Python-code als tekst met \\n voor nieuwe regels"
    }
  ],
  "tips": ["tip 1", "tip 2"]
}

Regels:
- Nederlands.
- Minimaal 3 en maximaal 5 stappen.
- Elke stap bevat echte, uitvoerbare Python-code.
- Geen externe API-sleutels of betaalde diensten vereisen.
- Houd het project haalbaar binnen de opgegeven tijd.`;
}

export function offlineGenerateIdea({ topic, level, time, category }) {
  const cleanTopic = String(topic || "").trim() || "mijn eigen project";
  const title = `${capitalize(cleanTopic)} in Python`;
  const chosenCategory = category || guessCategory(cleanTopic);
  const finalLevel = ["Beginner", "Gemiddeld", "Gevorderd"].includes(level) ? level : "Beginner";

  return {
    title,
    emoji: "🧪",
    category: chosenCategory,
    level: finalLevel,
    time: time || "45 min",
    summary: `Een klein, werkend Python-project rond "${cleanTopic}".`,
    description: `Je bouwt stap voor stap een programma rond "${cleanTopic}". Je begint met een eenvoudige gegevensstructuur, voegt daarna invoer en acties toe en sluit af met opslag en foutafhandeling.`,
    learn: ["functies", "lijsten", "while", "json"],
    steps: [
      {
        title: "Zet je gegevens klaar",
        text: `Bedenk welke gegevens het project nodig heeft. We bewaren alles in een lijst met dictionaries, zodat je het later makkelijk kunt uitbreiden.`,
        code: `# Project: ${cleanTopic}
items = []

def toon_items():
    if not items:
        print("Nog niets opgeslagen.")
        return

    for nummer, item in enumerate(items, start=1):
        print(f"{nummer}. {item['naam']}")`
      },
      {
        title: "Voeg een actie toe",
        text: "Een functie houdt de code overzichtelijk. Deze functie voegt een nieuw item toe en controleert meteen of de invoer niet leeg is.",
        code: `def voeg_toe(naam):
    naam = naam.strip()
    if not naam:
        print("Naam mag niet leeg zijn.")
        return

    items.append({"naam": naam, "klaar": False})
    print(f"Toegevoegd: {naam}")`
      },
      {
        title: "Bouw een eenvoudig menu",
        text: "Met een while-loop blijft het programma draaien. De gebruiker kiest een nummer en jij roept de juiste functie aan.",
        code: `while True:
    print("\\n1. Tonen  2. Toevoegen  3. Stoppen")
    keuze = input("Keuze: ").strip()

    if keuze == "1":
        toon_items()
    elif keuze == "2":
        voeg_toe(input("Naam: "))
    elif keuze == "3":
        break
    else:
        print("Kies 1, 2 of 3.")`
      },
      {
        title: "Bewaar je gegevens",
        text: "Met json sla je de lijst op in een bestand. Bij een volgend bezoek kun je de gegevens weer inladen.",
        code: `import json

with open("data.json", "w", encoding="utf-8") as bestand:
    json.dump(items, bestand, ensure_ascii=False, indent=2)

print("Opgeslagen in data.json")`
      }
    ],
    tips: [
      "Test eerst met twee of drie items voordat je verder uitbreidt.",
      "Voeg try/except toe rond json.load() voor het geval het bestand nog niet bestaat.",
      "Maak de menutekst pas mooi als de kern werkt."
    ],
    next: []
  };
}

export function parseGeneratedIdea(raw) {
  let text = String(raw || "").trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("De AI gaf geen JSON terug.");

  const parsed = JSON.parse(text.slice(start, end + 1));
  if (!parsed || typeof parsed.title !== "string") throw new Error("Titel ontbreekt.");

  const steps = Array.isArray(parsed.steps)
    ? parsed.steps
        .filter((step) => step && typeof step.title === "string")
        .map((step) => ({
          title: step.title,
          text: String(step.text || step.uitleg || ""),
          code: String(step.code || step.voorbeeld_code || "")
        }))
    : [];

  if (steps.length < 3) throw new Error("De AI gaf te weinig stappen terug.");

  return {
    title: parsed.title.trim(),
    emoji: String(parsed.emoji || "🧪").slice(0, 8),
    category: parsed.category,
    level: parsed.level,
    time: String(parsed.time || "45 min"),
    summary: String(parsed.summary || ""),
    description: String(parsed.description || parsed.summary || ""),
    learn: Array.isArray(parsed.learn) ? parsed.learn.filter((item) => typeof item === "string") : [],
    steps,
    tips: Array.isArray(parsed.tips) ? parsed.tips.filter((item) => typeof item === "string") : [],
    next: []
  };
}

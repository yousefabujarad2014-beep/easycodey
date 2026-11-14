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

const FREE_ENDPOINT = "https://text.pollinations.ai/openai";
const FREE_MODEL = "openai";

const CHAT_SYSTEM_PROMPT = `Je bent EasyCoach, de Nederlandstalige AI-coach van EasyCodey.
EasyCodey is een leerwebsite waar kinderen en beginners Python leren met 161 projecten.

Je doel: de gebruiker echt verder helpen, zoals een goede leraar. Duidelijk, vriendelijk en concreet.

WERKWIJZE: EERST BEGRIJPEN, DAN DOEN
1. Lees de vraag aandachtig. Bepaal wat de gebruiker wil bereiken, wat hij al heeft en waar hij vastloopt.
2. Begin je antwoord met één korte zin waarin je laat zien wat je begrijpt: "Je wilt ..., en je zit vast bij ...". Twijfel je? Zeg wat je denkt en vraag: "Klopt dat?"
3. Ontbreekt belangrijke informatie (doel, code, foutmelding of niveau)? Stel maximaal 2 korte vragen en stop daar. Geef dan nog geen volledige oplossing.
4. Is de vraag duidelijk genoeg? Bevestig dat in één zin en geef daarna pas de oplossing: korte stappen, code en hoe de gebruiker het test.
5. Bij een nieuwe vraag nooit meteen een lap code of een volledig project dumpen. Eerst begrip, dan de kleinste bruikbare oplossing.
6. Zegt de gebruiker "ik bedoelde iets anders" of verbetert hij zijn vraag? Zeg kort dat je het opnieuw bekijkt en vraag: "Wat bedoelde je dan precies?" Geef nog geen nieuwe oplossing voordat je dat weet.

ANTWOORDSTIJL
- Antwoord altijd in het Nederlands, ook in code en commentaar.
- Geen inleiding zoals "Goede vraag". Begin met je begrip van de vraag.
- Gebruik korte alinea's. Maximaal 5 opsommingen.
- Houd het antwoord kort: liever ongeveer 150 woorden en één codeblok dan een lange uitleg.
- Gebruik een kopje (##) alleen als het antwoord langer is dan ongeveer 6 regels.
- Gebruik nooit tabellen.
- Houd code kort en uitvoerbaar. Zet code altijd in een blok met drie backticks en het woord python.
- Leg moeilijke woorden meteen uit tussen haakjes.
- Sluit af met één concrete volgende stap of één korte vraag.
- Als de gebruiker een foutmelding plakt: zeg eerst in één zin wat je denkt dat er gebeurt, noem dan de oorzaak, wijs de regel aan en geef de oplossing.
- Verzin nooit bibliotheken of functies. Gebruik de Python-standaardbibliotheek, tenzij de gebruiker iets anders vraagt.
- Bij een eigen idee: maak het kleiner en haalbaarder voordat je code geeft.
- Blijf bij programmeren, leren en EasyCodey. Bij andere onderwerpen zeg je vriendelijk dat je daar niet mee helpt.
- Geef geen lange theorie. De gebruiker wil iets maken dat werkt.`;

const GENERATE_SYSTEM_PROMPT = `Je bent EasyCoach, de Nederlandstalige projectgenerator van EasyCodey.
Maak een compleet, haalbaar Python-projectidee voor een lerende gebruiker.

Antwoord met ALLEEN geldige JSON, zonder markdown, uitleg of code fences. Gebruik exact deze structuur:
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
      "code": "werkende Python-code met \\n voor nieuwe regels"
    }
  ],
  "tips": ["tip 1", "tip 2"]
}

Regels:
- Nederlands.
- Minimaal 3 en maximaal 5 stappen.
- Elke stap bevat echte, uitvoerbare Python-code.
- Geen betaalde diensten of verplichte API-sleutels.
- Geen externe bestanden die de gebruiker niet heeft.
- Houd het project haalbaar binnen de opgegeven tijd.`;

function contextToPrompt(context) {
  if (!context || typeof context !== "object") return "";

  const lines = ["", "", "Context van de gebruiker:"];
  if (context.idea) {
    lines.push(
      `- Project: "${context.idea.title}" (${context.idea.category}, niveau ${context.idea.level}).`
    );
    if (context.idea.summary) lines.push(`- Samenvatting: ${context.idea.summary}`);
  }
  if (context.step) {
    lines.push(
      `- Huidige stap ${context.step.index + 1} van ${context.step.total}: "${context.step.title}".`
    );
    if (context.step.text) lines.push(`- Uitleg van de stap: ${context.step.text}`);
    if (context.step.code) {
      lines.push(
        `- Code van de stap:\n\`\`\`python\n${String(context.step.code).slice(0, 1600)}\n\`\`\``
      );
    }
  }
  return lines.join("\n");
}

function buildMessages(messages, context, mode = "chat") {
  const history = (Array.isArray(messages) ? messages : [])
    .filter(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim()
    )
    .slice(-20)
    .map(({ role, content }) => ({ role, content }));

  const system =
    mode === "generate"
      ? GENERATE_SYSTEM_PROMPT
      : CHAT_SYSTEM_PROMPT + contextToPrompt(context);

  return [{ role: "system", content: system }, ...history];
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

export function aiMode(settings, serverConfig) {
  if (settings && settings.useOnlineAI === false) return "offline";
  if (serverConfig?.hasServerKey) return "server";
  if (settings?.apiKey) return "own";
  return "free";
}

export function isAIConfigured(settings, serverConfig) {
  const mode = aiMode(settings, serverConfig);
  if (mode === "offline") return false;
  if (mode === "server" && serverConfig?.accessCodeRequired && !settings?.accessCode) {
    return false;
  }
  return true;
}

export function aiModeLabel(mode) {
  if (mode === "server") return "AI-coach online";
  if (mode === "own") return "AI-coach met jouw sleutel";
  if (mode === "free") return "AI-coach gratis online";
  return "offline coach";
}

async function readCompletion(response, onDelta) {
  if (!response.ok) {
    let data = null;
    let text = "";
    try {
      text = await response.text();
      data = JSON.parse(text);
    } catch {
      // Geen JSON-foutmelding beschikbaar.
    }
    const raw = data?.message || data?.error?.message || data?.error || text;
    const error = new Error(
      typeof raw === "string" && raw.trim()
        ? raw.trim().slice(0, 300)
        : `AI-fout (${response.status})`
    );
    error.status = response.status;
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

async function requestWithRetry(url, options) {
  // De gratis dienst is soms even druk of heeft een korte storing. We proberen
  // het automatisch opnieuw met een kleine pauze. Alleen vóór er iets van het
  // antwoord binnen is, dus de bezoeker ziet nooit dubbele tekst.
  const waits = [0, 900, 2400];
  let response = null;
  let lastError = null;

  for (let attempt = 0; attempt < waits.length; attempt += 1) {
    if (waits[attempt]) {
      await new Promise((resolve) => setTimeout(resolve, waits[attempt]));
    }
    if (options.signal?.aborted) break;
    try {
      response = await fetch(url, options);
    } catch (error) {
      lastError = error;
      continue;
    }
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === waits.length - 1) return response;
  }

  if (lastError) throw lastError;
  if (response) return response;
  throw new Error("De AI is niet bereikbaar.");
}

async function requestServerChat({ messages, context, settings, mode, onDelta, signal }) {
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

  return readCompletion(response, onDelta);
}

async function requestDirectChat({ plan, messages, context, settings, mode, onDelta, signal }) {
  const baseUrl = String(settings?.baseUrl || "").trim().replace(/\/+$/, "");
  const url = plan === "own" && baseUrl ? `${baseUrl}/chat/completions` : FREE_ENDPOINT;
  const headers = { "Content-Type": "application/json" };

  if (plan === "own") {
    headers.Authorization = `Bearer ${settings.apiKey}`;
  }

  const body = {
    model: plan === "own" ? settings.model || "gpt-4o-mini" : FREE_MODEL,
    messages: buildMessages(messages, context, mode),
    temperature: mode === "generate" ? 0.7 : 0.6,
    max_tokens: mode === "generate" ? 1800 : 1000,
    stream: true
  };

  if (plan === "free") body.reasoning_effort = "low";

  const response = await requestWithRetry(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal
  });

  return readCompletion(response, onDelta);
}

export async function streamChat({
  messages,
  context,
  settings,
  serverConfig,
  mode = "chat",
  onDelta,
  signal
}) {
  const plan = aiMode(settings, serverConfig);

  if (plan === "offline") {
    const error = new Error("De online AI-coach staat uit.");
    error.code = "offline";
    throw error;
  }

  if (plan === "server") {
    return requestServerChat({ messages, context, settings, mode, onDelta, signal });
  }

  return requestDirectChat({ plan, messages, context, settings, mode, onDelta, signal });
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

const GLOSSARY = [
  {
    match: /(f-?string|format string)/,
    title: "Een f-string",
    text: "Een f-string is een tekst waarin je variabelen tussen accolades zet. Python vult ze meteen in. Zet een **f** voor de aanhalingstekens.",
    code: `naam = "Yousef"\nleeftijd = 11\nprint(f"Hallo {naam}, je bent {leeftijd} jaar.")`
  },
  {
    match: /(lijst|list)/,
    title: "Een lijst",
    text: "Een lijst bewaart meerdere waarden in volgorde. Je maakt er een met vierkante haken. De eerste plek is **0**, niet 1.",
    code: `kleuren = ["rood", "groen", "blauw"]\nprint(kleuren[0])      # rood\nkleuren.append("geel")  # toevoegen\nprint(len(kleuren))     # 4`
  },
  {
    match: /(dictionary|dict\b)/,
    title: "Een dictionary",
    text: "Een dictionary bewaart paren van sleutel en waarde. Je zoekt op met de sleutel, niet met een nummer.",
    code: `leerling = {"naam": "Yousef", "niveau": "Beginner"}\nprint(leerling["naam"])\nleerling["niveau"] = "Gemiddeld"`
  },
  {
    match: /(functie|def\b)/,
    title: "Een functie",
    text: "Een functie is een blokje code met een naam. Je schrijft het één keer en kunt het daarna steeds opnieuw gebruiken.",
    code: `def begroet(naam):\n    return f"Hallo {naam}!"\n\nprint(begroet("Yousef"))`
  },
  {
    match: /(for-?loop|for\b|loop)/,
    title: "Een for-loop",
    text: "Een for-loop herhaalt code voor elk item in een lijst of reeks. Zo hoef je niet steeds hetzelfde te typen.",
    code: `for kleur in ["rood", "groen", "blauw"]:\n    print(kleur)\n\nfor getal in range(1, 4):\n    print(getal)`
  },
  {
    match: /(while\b)/,
    title: "Een while-loop",
    text: "Een while-loop blijft herhalen zolang de voorwaarde waar is. Zorg dat de voorwaarde ooit onwaar wordt, anders blijft het programma hangen.",
    code: `teller = 0\nwhile teller < 3:\n    print(teller)\n    teller += 1`
  },
  {
    match: /(if\b|else\b|conditie|voorwaarde)/,
    title: "Een if-conditie",
    text: "Met if kies je wat er gebeurt. De code achter if moet waar of onwaar zijn. Vergeet de dubbele punt niet.",
    code: `cijfer = 14\nif cijfer >= 10:\n    print("Geslaagd")\nelse:\n    print("Nog even oefenen")`
  },
  {
    match: /(variabele|variable)/,
    title: "Een variabele",
    text: "Een variabele is een naam voor een waarde. Je maakt hem met een =-teken. Daarna kun je de waarde gebruiken of veranderen.",
    code: `naam = "Yousef"\npunten = 10\npunten = punten + 5`
  },
  {
    match: /(string|tekst)/,
    title: "Een string",
    text: "Een string is tekst tussen aanhalingstekens. Je kunt stukken tekst aan elkaar plakken met + of met een f-string.",
    code: `voornaam = "Yousef"\nachternaam = "Abujarad"\nprint(voornaam + " " + achternaam)`
  },
  {
    match: /(input\b)/,
    title: "input()",
    text: "Met input() vraag je iets aan de gebruiker. Het antwoord is altijd tekst. Wil je een getal, zet er dan int() of float() omheen.",
    code: `naam = input("Hoe heet je? ")\nleeftijd = int(input("Hoe oud ben je? "))\nprint(f"Hallo {naam}, je bent {leeftijd}.")`
  },
  {
    match: /(print\b)/,
    title: "print()",
    text: "Met print() laat je iets zien in de uitvoer. Je kunt meerdere dingen met een komma scheiden.",
    code: `print("Hallo")\nprint("Ik ben", 11, "jaar")`
  },
  {
    match: /(import|module|bibliotheek)/,
    title: "Importeren",
    text: "Met import gebruik je code die al in Python zit of die je hebt geïnstalleerd. Zet imports altijd bovenaan je bestand.",
    code: `import random\n\nprint(random.randint(1, 6))`
  },
  {
    match: /(try|except|fout afvangen)/,
    title: "try en except",
    text: "Met try en except vang je een fout op, zodat je programma niet stopt. Zet alleen de code die kan mislukken in het try-blok.",
    code: `try:\n    getal = int(input("Getal: "))\n    print(10 / getal)\nexcept ValueError:\n    print("Dat is geen getal.")\nexcept ZeroDivisionError:\n    print("Delen door nul kan niet.")`
  },
  {
    match: /(klasse|class\b|object)/,
    title: "Een klasse",
    text: "Een klasse is een soort mal voor objecten. Je maakt er een object mee en dat object heeft eigenschappen en functies.",
    code: `class Hond:\n    def __init__(self, naam):\n        self.naam = naam\n\n    def blaf(self):\n        print(f"{self.naam} zegt woef!")\n\nhond = Hond("Max")\nhond.blaf()`
  }
];

const ERROR_HELP = [
  {
    match: /nameerror/i,
    title: "NameError",
    text: "Python kent een naam niet. Meestal is de variabele nog niet gemaakt, staat er een typfout, of gebruik je hem vóór de regel waarin je hem maakt.",
    code: `# Fout:\nprint(kleur)\n\n# Goed:\nkleur = "rood"\nprint(kleur)`
  },
  {
    match: /syntaxerror/i,
    title: "SyntaxError",
    text: "Er staat iets in de code dat Python niet kan lezen. Kijk naar de regel die genoemd wordt en naar de regel erboven. Meestal ontbreekt een dubbele punt, haakje of aanhalingsteken.",
    code: `# Fout: dubbele punt ontbreekt\nif 5 > 3\n    print("ja")\n\n# Goed:\nif 5 > 3:\n    print("ja")`
  },
  {
    match: /indentationerror/i,
    title: "IndentationError",
    text: "De inspringing klopt niet. Gebruik altijd 4 spaties per niveau en meng geen tabs met spaties. Regels die bij een if, for of def horen, moeten inspringen.",
    code: `for i in range(3):\n    print(i)   # 4 spaties inspringen`
  },
  {
    match: /typeerror/i,
    title: "TypeError",
    text: "Je gebruikt een waarde van het verkeerde soort. Bijvoorbeeld tekst en een getal optellen. Maak ze eerst hetzelfde type met str() of int().",
    code: `leeftijd = "11"\nprint("Ik ben " + leeftijd)   # tekst + tekst\nprint(int(leeftijd) + 1)      # getal + getal`
  },
  {
    match: /valueerror/i,
    title: "ValueError",
    text: "Het soort waarde klopt, maar de inhoud niet. Bijvoorbeeld int(\"abc\"). Controleer wat de gebruiker invult of vang de fout op.",
    code: `tekst = "abc"\ntry:\n    getal = int(tekst)\nexcept ValueError:\n    print("Dat is geen getal.")`
  },
  {
    match: /modulenotfounderror|importerror/i,
    title: "ModuleNotFoundError",
    text: "Python vindt een module niet. Controleer de spelling en of je de module hebt geïnstalleerd met pip. Gebruik bij voorkeur de standaardbibliotheek.",
    code: `# In de terminal:\n# pip install requests\n\nimport requests   # daarna werkt dit`
  },
  {
    match: /indexerror/i,
    title: "IndexError",
    text: "Je vraagt een plek in een lijst die niet bestaat. Een lijst met 3 items heeft de plekken 0, 1 en 2.",
    code: `kleuren = ["rood", "groen", "blauw"]\nprint(kleuren[2])   # blauw\nprint(len(kleuren)) # 3`
  },
  {
    match: /keyerror/i,
    title: "KeyError",
    text: "Je zoekt een sleutel op die niet in de dictionary staat. Controleer de spelling of gebruik .get() met een standaardwaarde.",
    code: `leerling = {"naam": "Yousef"}\nprint(leerling.get("niveau", "onbekend"))`
  },
  {
    match: /attributeerror/i,
    title: "AttributeError",
    text: "Je gebruikt een functie die niet bij dat type hoort. Bijvoorbeeld .append() op een tekst in plaats van op een lijst.",
    code: `lijst = []\nlijst.append("item")   # werkt\n# "tekst".append("x")  # geeft AttributeError`
  },
  {
    match: /zerodivisionerror/i,
    title: "ZeroDivisionError",
    text: "Je deelt door nul. Dat kan niet. Controleer de deler voordat je deelt.",
    code: `getal = 0\nif getal != 0:\n    print(10 / getal)\nelse:\n    print("Delen door nul kan niet.")`
  },
  {
    match: /filenotfounderror/i,
    title: "FileNotFoundError",
    text: "Het bestand staat niet op de plek die je opgeeft. Controleer de naam, de map en of je het bestand eerst hebt gemaakt.",
    code: `import os\n\nprint(os.getcwd())      # waar zoekt Python?\nprint(os.listdir("."))  # wat staat er?`
  }
];

function offlineNote() {
  return "\n\n*Dit is de offline coach. Zet de online AI-coach aan in de instellingen voor een antwoord op maat.*";
}

function offlineStepReply({ idea, step }) {
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
3. Werkt het niet? Kijk naar de **laatste regel** van de foutmelding en plak die hier.

**Volgende stap:** leg me uit wat je ziet, dan help ik je verder.${offlineNote()}`;
}

function offlineErrorReply(question) {
  const found = ERROR_HELP.find((item) => item.match.test(question));
  if (found) {
    return `## ${found.title}

${found.text}

\`\`\`python
${found.code}
\`\`\`

### Zo vind je de oorzaak
1. Kijk naar het **regelnummer** in de foutmelding.
2. Kijk één regel daarboven: daar begint het meestal.
3. Plak hier je code en de volledige foutmelding. Dan wijs ik de fout aan.${offlineNote()}`;
  }

  return `## Samen debuggen

Een foutmelding is een aanwijzing, geen ramp. Doe dit in deze volgorde:

1. **Lees de laatste regel.** Daar staat het soort fout, bijvoorbeeld NameError of TypeError.
2. **Kijk naar het regelnummer** erboven. Daar ging het mis.
3. **Print tussenresultaten** met \`print()\` vlak voor die regel.
4. **Maak het klein.** Haal code weg tot de fout verdwijnt, dan weet je waar het zit.

\`\`\`python
# Handig om te zien wat een waarde echt is:
print(type(mijn_waarde), repr(mijn_waarde))
\`\`\`

**Volgende stap:** plak je code en de volledige foutmelding hier.${offlineNote()}`;
}

function offlineConceptReply(question) {
  const found = GLOSSARY.find((item) => item.match.test(question));
  if (!found) return null;
  return `## ${found.title}

${found.text}

\`\`\`python
${found.code}
\`\`\`

**Volgende stap:** probeer dit voorbeeld uit en verander één regel. Wat gebeurt er?${offlineNote()}`;
}

export function offlineReply({ text, context }) {
  const question = String(text || "").toLowerCase();

  if (context?.step) {
    return offlineStepReply(context);
  }

  if (/(fout|error|traceback|werkt niet|crash|bug|nameerror|syntaxerror|typeerror|valueerror|indexerror|keyerror)/.test(question)) {
    return offlineErrorReply(question);
  }

  if (/(wat is|wat doet|wat betekent|leg uit|hoe werkt|uitleg)/.test(question)) {
    const concept = offlineConceptReply(question);
    if (concept) return concept;
  }

  if (/(geen idee|welk project|bedenk|idee|begin|start)/.test(question)) {
    return `## Een project kiezen

Beantwoord eerst deze drie vragen voor jezelf:

1. **Hoeveel tijd heb je?** Een korte tool van 30 minuten of een project van een paar uur?
2. **Wat wil je leren?** Bestanden, een website, een scherm met knoppen, data of spelletjes?
3. **Wat kun je al?** Net begonnen? Kies een project met alleen \`print\`, \`input\` en \`if\`.

Daarna kun je op de homepage filteren op **niveau** en **tijdsduur**. Wil je iets heel specifieks? Gebruik **AI-idee maken** en beschrijf je onderwerp in één zin.

**Volgende stap:** noem je interesse en hoeveel tijd je hebt, dan kies ik mee.${offlineNote()}`;
  }

  if (/(simpeler|makkelijker|korter|begrijp het niet|snap het niet)/.test(question)) {
    return `## In gewone taal

Programmeren is stapjes geven aan de computer. Doe het zo:

1. **Zeg wat het programma moet doen.** Eén zin is genoeg.
2. **Maak de kleinste versie die werkt.** Nog geen mooie knoppen of extra's.
3. **Test meteen.** Klopt de uitvoer? Ga dan pas verder.
4. **Voeg één ding tegelijk toe.** Dan weet je waar een fout vandaan komt.

\`\`\`python
# De kleinste start:
print("Hallo EasyCodey!")
\`\`\`

**Volgende stap:** vertel me in één zin wat je wilt maken.${offlineNote()}`;
  }

  return `## Zo help ik je het beste

Ik kan je snel en gericht helpen. Geef me één van deze drie dingen:

1. **Je doel:** "Ik wil een raadspel maken."
2. **Je code:** plak de regels waar je mee bezig bent.
3. **Je foutmelding:** plak de hele tekst, inclusief het regelnummer.

\`\`\`python
# Begin altijd met een kleine versie:
def main():
    print("Hallo EasyCodey!")

if __name__ == "__main__":
    main()
\`\`\`

**Volgende stap:** stuur je vraag, code of foutmelding. Dan ga ik meteen mee kijken.${offlineNote()}`;
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

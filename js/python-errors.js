/* Zet een Engelse Python-foutmelding om in een korte uitleg in eenvoudig
   Nederlands. De originele foutmelding blijft bewaard, zodat gevorderde
   gebruikers altijd de technische details kunnen zien. */

function clean(value) {
  return String(value ?? "").replace(/\r\n/g, "\n");
}

function lastErrorLine(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const match = lines[index].match(/^([A-Za-z_][\w.]*(?:Error|Exception|Interrupt)):\s*(.*)$/);
    if (match) return { type: match[1], message: match[2].trim(), raw: lines[index] };
  }
  return { type: "", message: "", raw: lines[lines.length - 1] || "" };
}

function findLine(text, type) {
  const fileLine = text.match(/File\s+"[^"]*",\s+line\s+(\d+)/);
  if (fileLine) return Number(fileLine[1]);
  if (type === "SyntaxError" || type === "IndentationError" || type === "TabError") {
    const plain = text.match(/\bline\s+(\d+)\b/);
    if (plain) return Number(plain[1]);
  }
  return 0;
}

function findCaret(text, lineNumber) {
  if (!lineNumber) return 0;
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*\^+\s*$/.test(lines[index])) continue;
    const before = lines[index - 1] || "";
    if (before.trim()) return Math.max(0, lines[index].indexOf("^"));
  }
  return 0;
}

function valueName(value) {
  return String(value || "").replace(/^['"]|['"]$/g, "");
}

function quote(value) {
  return `“${valueName(value)}”`;
}

function explain(error, code) {
  const text = clean(error?.message || error || "");
  const { type, message } = lastErrorLine(text);
  const line = findLine(text, type);
  const codeLines = clean(code).split("\n");
  const codeLine = line > 0 ? codeLines[line - 1] || "" : "";
  const caret = findCaret(text, line);
  const result = {
    type,
    title: "Er ging iets mis",
    hint: "Lees de laatste regel van de foutmelding. Daar staat meestal wat Python niet begrijpt.",
    tip: "Kijk naar de regel die genoemd wordt en naar de regel erboven. Test daarna opnieuw.",
    line,
    codeLine,
    caret,
    original: text.trim(),
    message
  };

  const set = (title, hint, tip) => {
    result.title = title;
    result.hint = hint;
    result.tip = tip;
    return result;
  };

  if (type === "NameError" || type === "UnboundLocalError") {
    const name = message.match(/name '([^']+)' is not defined/);
    if (type === "UnboundLocalError") {
      return set(
        "Naam nog geen waarde (UnboundLocalError)",
        "Je gebruikt een variabele in een functie voordat je hem daar een waarde geeft.",
        "Maak de variabele eerst aan, bijvoorbeeld met `= 0`, of geef hem als argument mee aan de functie."
      );
    }
    return set(
      `Naam niet gevonden (NameError)${name ? `: ${quote(name[1])}` : ""}`,
      name
        ? `Python kent de naam ${quote(name[1])} nog niet. Meestal staat er een typfout, of je gebruikt de variabele vóór de regel waarin je hem maakt.`
        : "Python kent een naam in je code nog niet. Meestal staat er een typfout, of je gebruikt de variabele te vroeg.",
      "Controleer de spelling en zet de regel waarin je de variabele maakt boven de regel waar je hem gebruikt."
    );
  }

  if (type === "SyntaxError" || type === "TabError") {
    if (/expected ':'/i.test(message)) {
      return set(
        "Dubbele punt vergeten (SyntaxError)",
        "Aan het einde van een if-, for-, while- of def-regel hoort een dubbele punt (:).",
        "Zet een : achter de regel en zet de code eronder 4 spaties naar rechts."
      );
    }
    if (/was never closed|unexpected EOF|unterminated|unclosed/i.test(message)) {
      return set(
        "Haakje of aanhalingsteken vergeten (SyntaxError)",
        "Er ontbreekt een haakje ) of ] of een aanhalingsteken \" of '. Python vindt het einde van de regel of het bestand te vroeg.",
        "Tel de haakjes en aanhalingstekens op de genoemde regel. Elk haakje dat opengaat, moet ook weer dicht."
      );
    }
    if (/invalid syntax/i.test(message)) {
      return set(
        "De regel is geen geldige Python (SyntaxError)",
        "Er staat een teken of woord dat Python op deze plek niet verwacht. Kijk naar de regel zelf en naar de regel erboven.",
        "Controleer dubbele punten, komma's, haakjes en aanhalingstekens. Let ook op een Nederlandse komma in plaats van een punt."
      );
    }
    if (/cannot assign to|assignment/i.test(message)) {
      return set(
        "Niet aan deze naam toewijzen (SyntaxError)",
        "Links van het =-teken moet een naam staan, bijvoorbeeld `cijfer = 10`. Je kunt geen getal of tekst aan de linkerkant zetten.",
        "Gebruik een variabelenaam links van = en de waarde rechts."
      );
    }
    return set(
      "De code is niet geldig (SyntaxError)",
      message || "Python kan deze regel niet lezen.",
      "Kijk naar de genoemde regel en de regel erboven. Vaak ontbreekt een dubbele punt, haakje of aanhalingsteken."
    );
  }

  if (type === "IndentationError") {
    if (/expected an indented block/i.test(message)) {
      return set(
        "Inspringing vergeten (IndentationError)",
        "De regel onder een if, for, while of def moet inspringen. Anders weet Python niet wat er bij hoort.",
        "Zet de regel eronder 4 spaties naar rechts. Gebruik spaties, geen tabs."
      );
    }
    if (/unexpected indent/i.test(message)) {
      return set(
        "Te veel inspringing (IndentationError)",
        "Deze regel staat verder naar rechts dan Python verwacht.",
        "Haal de extra spaties weg, zodat de regel op dezelfde hoogte staat als de code eromheen."
      );
    }
    return set(
      "De inspringing klopt niet (IndentationError)",
      "Gebruik altijd 4 spaties per niveau en meng geen tabs met spaties.",
      "Zet de regels die bij elkaar horen op dezelfde hoogte. Kijk extra naar regels onder if, for, while en def."
    );
  }

  if (type === "TypeError") {
    const operand = message.match(/unsupported operand type\(s\) for (.+?): '([^']+)' and '([^']+)'/);
    if (operand) {
      return set(
        "Twee soorten waarden passen niet bij elkaar (TypeError)",
        `Je probeert ${quote(operand[2])} en ${quote(operand[3])} te combineren met ${quote(operand[1])}. Dat kan niet zomaar.`,
        "Maak ze hetzelfde soort: gebruik `str()` om een getal tekst te maken, of `int()` om tekst een getal te maken."
      );
    }
    if (/can only concatenate str|must be str, not int/i.test(message)) {
      return set(
        "Tekst en getal opgeteld (TypeError)",
        "Je plakt tekst en een getal aan elkaar met +. Python wil dan aan beide kanten tekst.",
        "Gebruik een f-string: `print(f\"Je bent {leeftijd} jaar.\")`, of zet `str()` om het getal."
      );
    }
    if (/missing \d+ required positional argument/i.test(message)) {
      const count = message.match(/missing (\d+) required positional argument/i);
      return set(
        "Een functie mist een argument (TypeError)",
        `Je roept een functie aan, maar geeft ${count?.[1] || "een"} waarde(n) te weinig mee.`,
        "Kijk bij de def naar de namen tussen de haakjes en geef bij het aanroepen voor elke naam een waarde mee."
      );
    }
    if (/takes \d+ positional arguments? but \d+ (?:was|were) given/i.test(message)) {
      return set(
        "Te veel waarden meegegeven (TypeError)",
        "Je geeft meer waarden aan een functie dan de functie verwacht.",
        "Tel de waarden tussen de haakjes bij het aanroepen en vergelijk ze met de namen bij def."
      );
    }
    if (/object is not callable/i.test(message)) {
      const name = message.match(/'([^']+)' object is not callable/);
      return set(
        "Dit is geen functie (TypeError)",
        `Je zet haakjes achter ${name ? quote(name[1]) : "een waarde"}, maar dat is geen functie.`,
        "Controleer of je de juiste functienaam gebruikt en of je geen variabele dezelfde naam hebt gegeven."
      );
    }
    if (/object is not subscriptable/i.test(message)) {
      const name = message.match(/'([^']+)' object is not subscriptable/);
      return set(
        "Je kunt hier geen [ ] gebruiken (TypeError)",
        `${name ? quote(name[1]) : "Deze waarde"} is geen lijst, tekst of dictionary, dus je kunt geen plek opvragen met [ ].`,
        "Gebruik [ ] alleen bij een lijst, tekst of dictionary. Controleer wat er echt in de variabele zit met `print(type(variabele))`."
      );
    }
    if (/has no attribute/i.test(message)) {
      const name = message.match(/'([^']+)' object has no attribute '([^']+)'/);
      return set(
        "Deze functie hoort niet bij dit soort waarde (TypeError)",
        name
          ? `${quote(name[1])} heeft geen ${quote(name[2])}.`
          : "Je gebruikt een functie die niet bij dit soort waarde hoort.",
        "Controleer de spelling. Bij een lijst hoort `.append()`, bij tekst hoort bijvoorbeeld `.upper()`. Vraag EasyCoach als je twijfelt."
      );
    }
    return set(
      "De soorten waarden kloppen niet (TypeError)",
      message || "Je gebruikt een waarde van het verkeerde soort.",
      "Controleer met `print(type(variabele))` wat je echt hebt. Maak waarden hetzelfde soort met `str()`, `int()` of `float()`."
    );
  }

  if (type === "ValueError") {
    const integer = message.match(/invalid literal for int\(\) with base 10: '([^']*)'/);
    if (integer) {
      return set(
        "Dit is geen getal (ValueError)",
        `${quote(integer[1])} kan Python niet omzetten naar een getal met int().`,
        "Vraag alleen om een getal, of vang de fout op met try en except ValueError."
      );
    }
    if (/could not convert string to float/i.test(message)) {
      return set(
        "Dit is geen kommagetal (ValueError)",
        "Python kon de tekst niet omzetten naar een getal met float().",
        "Gebruik een punt in plaats van een komma, bijvoorbeeld `1.5`, of vervang eerst de komma door een punt."
      );
    }
    if (/too many values to unpack/i.test(message)) {
      return set(
        "Te veel waarden om te verdelen (ValueError)",
        "Je probeert meer waarden in variabelen te stoppen dan er beschikbaar zijn.",
        "Tel de waarden links en rechts van het =-teken. Ze moeten evenveel zijn."
      );
    }
    return set(
      "De waarde klopt niet (ValueError)",
      message || "Het soort waarde klopt, maar de inhoud niet.",
      "Controleer wat de gebruiker invult of wat er in de variabele zit. Gebruik zo nodig try en except ValueError."
    );
  }

  if (type === "IndexError") {
    const listIndex = /list index out of range/i.test(message);
    return set(
      "Die plek bestaat niet (IndexError)",
      listIndex
        ? "Je vraagt een plek in een lijst die niet bestaat. Een lijst met 3 items heeft de plekken 0, 1 en 2."
        : "Je vraagt een plek in een tekst of lijst die niet bestaat.",
      "Gebruik `len(lijst)` om te zien hoeveel items er zijn. De hoogste plek is `len(lijst) - 1`."
    );
  }

  if (type === "KeyError") {
    const key = message.match(/^'([^']+)'$/);
    return set(
      "Deze sleutel staat niet in de dictionary (KeyError)",
      key ? `De sleutel ${quote(key[1])} bestaat niet in deze dictionary.` : "Je zoekt een sleutel op die niet in de dictionary staat.",
      "Controleer de spelling of gebruik `.get(\"sleutel\", \"standaardwaarde\")`."
    );
  }

  if (type === "AttributeError") {
    const name = message.match(/'([^']+)' object has no attribute '([^']+)'/);
    return set(
      "Deze functie bestaat niet voor dit soort waarde (AttributeError)",
      name ? `${quote(name[1])} heeft geen ${quote(name[2])}.` : "Je gebruikt een functie die niet bij dit soort waarde hoort.",
      "Controleer de spelling. Bij een lijst hoort `.append()`, bij tekst bijvoorbeeld `.upper()`."
    );
  }

  if (type === "ZeroDivisionError") {
    return set(
      "Delen door nul kan niet (ZeroDivisionError)",
      "Je deelt een getal door 0. Dat kan in de wiskunde niet.",
      "Controleer de deler voordat je deelt: `if deler != 0:`."
    );
  }

  if (type === "ModuleNotFoundError" || type === "ImportError") {
    const module = message.match(/No module named '([^']+)'/);
    return set(
      "Deze module is niet gevonden (ModuleNotFoundError)",
      module
        ? `${quote(module[1])} zit niet in de Python die in je browser draait.`
        : "Python vindt een module of onderdeel niet.",
      "Gebruik bij voorkeur de standaardbibliotheek, zoals random, math of statistics. Sommige modules moeten eerst met pip worden geïnstalleerd en werken niet in de browser."
    );
  }

  if (type === "FileNotFoundError") {
    const file = message.match(/No such file or directory: '([^']+)'/);
    return set(
      "Het bestand is niet gevonden (FileNotFoundError)",
      file ? `Het bestand ${quote(file[1])} staat niet op de plek die je opgeeft.` : "Het bestand staat niet op de plek die je opgeeft.",
      "Controleer de naam en de map. In de browser heb je meestal geen echte bestanden: gebruik invoer of een lijst in je code."
    );
  }

  if (type === "RecursionError") {
    return set(
      "De functie roept zichzelf te vaak aan (RecursionError)",
      "Een functie blijft zichzelf aanroepen en stopt nooit.",
      "Zorg dat de functie een stopvoorwaarde heeft, zodat hij niet eindeloos doorgaat."
    );
  }

  if (type === "MemoryError") {
    return set(
      "Het programma gebruikt te veel geheugen (MemoryError)",
      "Je maakt iets heel groots, bijvoorbeeld een lijst die steeds maar blijft groeien.",
      "Maak de lijst kleiner of stop met herhalen zodra je klaar bent."
    );
  }

  return set(
    type ? `Er ging iets mis (${type})` : "Er ging iets mis",
    message || "Python stopte met een fout die niet in een standaardcategorie past.",
    "Lees de laatste regel van de technische foutmelding. Kijk naar de genoemde regel en test daarna opnieuw."
  );
}

export function explainPythonError(error, code) {
  return explain(error, code);
}

function caretLine(codeLine, caret) {
  if (!codeLine || !caret) return "";
  return `${" ".repeat(caret)}^`;
}

export function formatPythonError(error, code) {
  const info = explain(error, code);
  const parts = [`❌ ${info.title}`];

  if (info.line > 0) {
    parts.push("");
    parts.push(`Regel ${info.line}:`);
    if (info.codeLine.trim()) {
      parts.push(`    ${info.codeLine.replace(/\t/g, "    ")}`);
      const caret = caretLine(info.codeLine, info.caret);
      if (caret) parts.push(`    ${caret}`);
    }
  }

  parts.push("");
  parts.push("Wat er misgaat:");
  parts.push(info.hint);
  parts.push("");
  parts.push("Wat je kunt doen:");
  parts.push(info.tip);

  if (info.original) {
    parts.push("");
    parts.push("Technische foutmelding (voor gevorderden):");
    parts.push(info.original);
  }

  return parts.join("\n");
}

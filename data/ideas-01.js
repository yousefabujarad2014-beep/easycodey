// Deel 1: de eerste negen projecten.
export const IDEAS_PART_1 = [
  {
    id: "raad-het-getal",
    title: "Raad het getal",
    emoji: "🎯",
    category: "Games",
    level: "Beginner",
    time: "30 min",
    summary: "De computer kiest een geheim getal en jij moet het raden met hints.",
    description:
      "De computer kiest een geheim getal tussen 1 en 100. Jij typt een gok en krijgt te horen of je te hoog of te laag zit. Het perfecte eerste project: je leert invoer lezen, met getallen rekenen, beslissingen nemen en herhalen.",
    learn: ["random", "input()", "while", "if / elif / else", "f-strings"],
    steps: [
      {
        title: "Laat Python een geheim getal kiezen",
        text: "Met de module random laat je Python willekeurig kiezen. Print het getal één keer tijdens het testen, zodat je weet of je code klopt. Daarna haal je die regel weer weg.",
        code: `import random

geheim = random.randint(1, 100)
print("Test: het geheime getal is", geheim)`
      },
      {
        title: "Vraag de speler om een gok",
        text: "input() geeft altijd tekst terug. Met int() maak je er een heel getal van. Test wat er gebeurt als je letters intypt — daar komen we later op terug.",
        code: `gok = input("Raad het getal tussen 1 en 100: ")
gok = int(gok)

print("Je koos", gok)`
      },
      {
        title: "Vergelijk en geef een hint",
        text: "Vergelijk de gok met het geheime getal. Gebruik elif voor de tweede controle: zo wordt alleen de juiste tak uitgevoerd.",
        code: `if gok < geheim:
    print("Te laag!")
elif gok > geheim:
    print("Te hoog!")
else:
    print("Goed geraden!")`
      },
      {
        title: "Blijf herhalen tot het goed is",
        text: "Een while-loop blijft vragen stellen tot de speler wint. De teller pogingen houdt bij hoeveel gokken je nodig had. Met break stop je de loop.",
        code: `pogingen = 0

while True:
    gok = int(input("Jouw gok: "))
    pogingen += 1

    if gok < geheim:
        print("Te laag!")
    elif gok > geheim:
        print("Te hoog!")
    else:
        print(f"Goed! Je had {pogingen} pogingen nodig.")
        break`
      },
      {
        title: "Vang foute invoer op",
        text: "Als iemand 'abc' typt, crasht int(). Met try en except vang je die fout op en vraag je opnieuw. Zo wordt je spel pas echt speelbaar.",
        code: `def vraag_gok():
    while True:
        try:
            return int(input("Jouw gok: "))
        except ValueError:
            print("Dat is geen getal. Probeer opnieuw.")


gok = vraag_gok()
print("Je gokte:", gok)`
      }
    ],
    tips: [
      "Test met een klein bereik, bijvoorbeeld 1 tot 10, dan vind je fouten sneller.",
      "Laat de speler na afloop kiezen of die opnieuw wil spelen.",
      "Beperk het aantal pogingen tot 10 voor extra spanning."
    ],
    next: ["steen-papier-schaar", "galgje", "quiz-spel"]
  },
  {
    id: "steen-papier-schaar",
    title: "Steen, papier, schaar",
    emoji: "✊",
    category: "Games",
    level: "Beginner",
    time: "40 min",
    summary: "Speel tegen de computer en houd de score bij over meerdere rondes.",
    description:
      "Een klassieker die je leert werken met lijsten, willekeurige keuzes en een woordenboek als spelregel. Je bouwt het uit tot een wedstrijd van vijf rondes met een scorebord.",
    learn: ["lists", "random.choice()", "dict", "functies", "for-loop"],
    steps: [
      {
        title: "Laat de computer kiezen",
        text: "Zet de drie opties in een lijst en laat random.choice() eentje kiezen. Zo hoef je geen lange if-keten te schrijven.",
        code: `import random

keuzes = ["steen", "papier", "schaar"]
computer = random.choice(keuzes)

print("De computer koos:", computer)`
      },
      {
        title: "Vraag de speler om een keuze",
        text: "lower() maakt van 'Steen' netjes 'steen'. Controleer daarna of de invoer echt in de lijst staat, anders kan de speler vals spelen.",
        code: `speler = input("steen, papier of schaar? ").lower()

if speler not in keuzes:
    print("Kies precies een van de drie opties.")
else:
    print("Jij koos:", speler)`
      },
      {
        title: "Bepaal wie wint",
        text: "Een woordenboek legt vast wat wat verslaat. Zo is de spelregel één regel code in plaats van zes losse vergelijkingen.",
        code: `verslaat = {"steen": "schaar", "schaar": "papier", "papier": "steen"}

if speler == computer:
    print("Gelijkspel")
elif verslaat[speler] == computer:
    print("Jij wint!")
else:
    print("De computer wint!")`
      },
      {
        title: "Speel vijf rondes met een score",
        text: "Stop de spelronde in een functie en roep die vijf keer aan. De scores houd je bij in een woordenboek buiten de functie.",
        code: `scores = {"jij": 0, "computer": 0}

def speel_ronde():
    speler = input("steen, papier of schaar? ").lower()
    computer = random.choice(keuzes)

    if speler not in keuzes:
        print("Ongeldige keuze, deze ronde telt niet.")
        return

    print("Computer:", computer)

    if speler == computer:
        print("Gelijkspel")
    elif verslaat[speler] == computer:
        print("Jij wint deze ronde!")
        scores["jij"] += 1
    else:
        print("Computer wint deze ronde!")
        scores["computer"] += 1

for ronde in range(5):
    print()
    print("Ronde", ronde + 1)
    speel_ronde()`
      },
      {
        title: "Maak de uitslag af",
        text: "Na de loop vergelijk je de scores en print je de winnaar. Dit is ook een mooi moment om de tussenstand na elke ronde te tonen.",
        code: `print()
print("Eindstand")
print("Jij:", scores["jij"])
print("Computer:", scores["computer"])

if scores["jij"] > scores["computer"]:
    print("🏆 Jij bent de winnaar!")
elif scores["jij"] < scores["computer"]:
    print("De computer wint.")
else:
    print("Gelijk spel!")`
      }
    ],
    tips: [
      "Laat de computer niet met zichzelf spelen tijdens het testen: print de keuze altijd.",
      "Voeg 'lizard' en 'spock' toe voor een uitgebreidere versie.",
      "Bewaar de scores in een JSON-bestand als je een competitie wilt."
    ],
    next: ["boter-kaas-eieren", "galgje", "quiz-spel"]
  },
  {
    id: "todo-lijst",
    title: "To-do lijst in de terminal",
    emoji: "✅",
    category: "Handige tools",
    level: "Beginner",
    time: "45 min",
    summary: "Een takenlijst die je kunt bekijken, toevoegen en verwijderen — en die blijft bestaan.",
    description:
      "Bouw een klein programma waarmee je taken beheert. Je leert een menu maken met een while-loop, werken met lijsten en uiteindelijk je taken opslaan in een JSON-bestand, zodat ze niet verdwijnen als je stopt.",
    learn: ["lists", "enumerate()", "while", "json", "bestanden"],
    steps: [
      {
        title: "Maak een menu dat blijft draaien",
        text: "Een while True-loop toont steeds hetzelfde menu. Met break stop je het programma. Zo werkt bijna elke terminal-app.",
        code: `taken = []

while True:
    print()
    print("1. Taken bekijken")
    print("2. Taak toevoegen")
    print("3. Stoppen")
    keuze = input("Kies: ")

    if keuze == "3":
        print("Tot de volgende keer!")
        break`
      },
      {
        title: "Toon de taken met een nummer",
        text: "enumerate() geeft bij elk item ook een nummer. Met start=1 begin je bij 1 in plaats van 0, dat leest prettiger.",
        code: `if keuze == "1":
    if not taken:
        print("Je lijst is nog leeg.")
    else:
        for nummer, taak in enumerate(taken, start=1):
            print(nummer, "-", taak)`
      },
      {
        title: "Voeg een taak toe",
        text: "Vraag om de tekst en voeg die toe met append(). Een lege invoer sla je over, anders krijg je lege regels in je lijst.",
        code: `if keuze == "2":
    nieuwe_taak = input("Wat wil je doen? ").strip()
    if nieuwe_taak:
        taken.append(nieuwe_taak)
        print("Toegevoegd!")`
      },
      {
        title: "Verwijder een taak",
        text: "De speler kiest een nummer. In Python begint een lijst bij 0, dus trek je 1 af. Controleer eerst of het nummer wel bestaat.",
        code: `if keuze == "4":
    nummer = int(input("Welk nummer verwijderen? "))
    if 1 <= nummer <= len(taken):
        verwijderd = taken.pop(nummer - 1)
        print("Verwijderd:", verwijderd)
    else:
        print("Dat nummer bestaat niet.")`
      },
      {
        title: "Bewaar de taken in een bestand",
        text: "Met json.dump() schrijf je de lijst naar een bestand en met json.load() lees je hem terug. Bij de start van je programma laad je de lijst, zodat je verder kunt waar je gebleven was.",
        code: `import json
from pathlib import Path

bestand = Path("taken.json")

if bestand.exists():
    taken = json.loads(bestand.read_text(encoding="utf-8"))
else:
    taken = []

# ... na elke wijziging:
bestand.write_text(json.dumps(taken, indent=2, ensure_ascii=False), encoding="utf-8")`
      }
    ],
    tips: [
      "Gebruik strip() op invoer zodat spaties aan het begin en eind verdwijnen.",
      "Voeg een optie 'klaar' toe met een aparte lijst voor afgeronde taken.",
      "Maak van de menu-acties losse functies zodra je code langer wordt."
    ],
    next: ["wachtwoord-generator", "budget-tracker", "organiseer-downloads"]
  },
  {
    id: "wachtwoord-generator",
    title: "Wachtwoord-generator",
    emoji: "🔐",
    category: "Handige tools",
    level: "Beginner",
    time: "30 min",
    summary: "Maak sterke wachtwoorden en makkelijk te onthouden passzinnen.",
    description:
      "Een klein maar nuttig script. Je leert veilige willekeur gebruiken (secrets in plaats van random), werken met strings en controleren of een wachtwoord aan je eisen voldoet.",
    learn: ["secrets", "string", "join()", "comprehensions", "input()"],
    steps: [
      {
        title: "Genereer je eerste wachtwoord",
        text: "Gebruik secrets in plaats van random: secrets is gemaakt voor wachtwoorden en is niet voorspelbaar. join() plakt de losse tekens aan elkaar.",
        code: `import secrets
import string

letters = string.ascii_letters
cijfers = string.digits
symbolen = "!@#$%^&*()-_=+"
alles = letters + cijfers + symbolen

lengte = int(input("Hoeveel tekens? "))
wachtwoord = "".join(secrets.choice(alles) for _ in range(lengte))
print(wachtwoord)`
      },
      {
        title: "Zorg dat elk type teken voorkomt",
        text: "Als je alleen willekeurig kiest, kan het gebeuren dat er geen cijfer in zit. Plaats daarom eerst één teken van elk type en vul de rest willekeurig aan.",
        code: `delen = [
    secrets.choice(letters),
    secrets.choice(cijfers),
    secrets.choice(symbolen),
]

rest = [secrets.choice(alles) for _ in range(lengte - len(delen))]
wachtwoord = delen + rest
secrets.SystemRandom().shuffle(wachtwoord)

print("".join(wachtwoord))`
      },
      {
        title: "Maak een passzin",
        text: "Een passzin van vier willekeurige woorden is sterk én te onthouden. Dit is vaak beter dan een kort wachtwoord met veel symbolen.",
        code: `woorden = ["appel", "tijger", "fiets", "regen", "planeet", "koffie", "zomer", "raket"]

passzin = "-".join(secrets.choice(woorden) for _ in range(4))
print(passzin)`
      },
      {
        title: "Kies zelf het soort wachtwoord",
        text: "Met een klein menu laat je de gebruiker kiezen. Zo oefen je met functies en if-statements tegelijk.",
        code: `def maak_wachtwoord(lengte):
    return "".join(secrets.choice(alles) for _ in range(lengte))


def maak_passzin(aantal):
    return "-".join(secrets.choice(woorden) for _ in range(aantal))


soort = input("Wachtwoord (w) of passzin (p)? ").lower()

if soort == "w":
    print(maak_wachtwoord(16))
else:
    print(maak_passzin(4))`
      }
    ],
    tips: [
      "Gebruik nooit random voor wachtwoorden; die reeks is voorspelbaar.",
      "Sla gegenereerde wachtwoorden niet op in een gewoon tekstbestand.",
      "Laat de lengte minimaal 12 zijn en toon een waarschuwing bij korter."
    ],
    next: ["todo-lijst", "ai-chatbot", "organiseer-downloads"]
  },
  {
    id: "galgje",
    title: "Galgje",
    emoji: "🪢",
    category: "Games",
    level: "Beginner",
    time: "60 min",
    summary: "Raad een woord letter voor letter, met een beperkt aantal levens.",
    description:
      "Bouw het klassieke woordspel. Je leert werken met sets (voor geraden letters), strings doorlopen en een loop die stopt bij winst of verlies. Aan het eind kun je het uitbreiden met een echt tekeningetje in ASCII.",
    learn: ["sets", "strings", "while", "in", "functies"],
    steps: [
      {
        title: "Kies een geheim woord",
        text: "Zet een paar woorden in een lijst en kies er willekeurig één. Houd de geraden letters bij in een set: elk teken komt daar maar één keer in voor.",
        code: `import random

woorden = ["python", "computer", "programmeren", "internet", "raket"]
woord = random.choice(woorden)
geraden = set()

print("Het woord heeft", len(woord), "letters.")`
      },
      {
        title: "Toon het woord met streepjes",
        text: "Met een generator-expressie maak je per letter een streepje of de letter zelf. join() zet er spaties tussen.",
        code: `def toon_woord():
    return " ".join(letter if letter in geraden else "_" for letter in woord)

print(toon_woord())`
      },
      {
        title: "Vraag om een letter",
        text: "Controleer of de letter al geraden is. Zo verspil je geen levens aan dezelfde letter. Voeg de letter daarna toe aan de set.",
        code: `letter = input("Raad een letter: ").lower()

if letter in geraden:
    print("Die had je al geraden.")
else:
    geraden.add(letter)
    if letter in woord:
        print("Goed gedaan!")
    else:
        print("Helaas, die letter zit er niet in.")`
      },
      {
        title: "Speel met levens",
        text: "Elke foute letter kost een leven. De loop stopt als de levens op zijn of als alle letters geraden zijn. all() controleert of elke letter in de set zit.",
        code: `levens = 6

while levens > 0:
    print()
    print(toon_woord())
    letter = input("Raad een letter: ").lower()

    if letter in geraden:
        print("Die had je al.")
        continue

    geraden.add(letter)

    if letter in woord:
        print("Goed!")
    else:
        levens -= 1
        print("Mis! Levens over:", levens)

    if all(l in geraden for l in woord):
        print("🎉 Gewonnen! Het woord was:", woord)
        break
else:
    print("Helaas, je levens zijn op. Het woord was:", woord)`
      }
    ],
    tips: [
      "Test met een kort woord zoals 'kat' voordat je lange woorden gebruikt.",
      "Teken de galg met een lijst strings en print de juiste fase.",
      "Voeg een categorie-hint toe, bijvoorbeeld 'dier' of 'technologie'."
    ],
    next: ["raad-het-getal", "boter-kaas-eieren", "tekst-avontuur"]
  },
  {
    id: "boter-kaas-eieren",
    title: "Boter-kaas-en-eieren",
    emoji: "⭕",
    category: "Games",
    level: "Gemiddeld",
    time: "60 min",
    summary: "Het 3x3-spel met twee spelers of een computertegenstander.",
    description:
      "Je bouwt een bord van negen vakjes, wisselt beurten af en controleert alle winnende lijnen. Daarna voeg je een simpele computer toe. Dit project leert je goed nadenken over lijsten en indexen.",
    learn: ["lists", "indexen", "functies", "loops", "random"],
    steps: [
      {
        title: "Maak het bord en de weergave",
        text: "Een lijst van negen spaties is genoeg voor het bord. De functie toon_bord() print het in een 3x3-rooster.",
        code: `bord = [" "] * 9

def toon_bord():
    print()
    print(bord[0], "|", bord[1], "|", bord[2])
    print("--+---+--")
    print(bord[3], "|", bord[4], "|", bord[5])
    print("--+---+--")
    print(bord[6], "|", bord[7], "|", bord[8])

toon_bord()`
      },
      {
        title: "Laat een speler een zet doen",
        text: "De speler kiest 1 tot 9 en jij rekent dat om naar een index van 0 tot 8. Controleer of het vakje nog leeg is.",
        code: `def zet(speler):
    while True:
        try:
            plek = int(input(f"Speler {speler}, kies 1-9: ")) - 1
        except ValueError:
            print("Vul een getal in.")
            continue

        if 0 <= plek < 9 and bord[plek] == " ":
            bord[plek] = speler
            return
        print("Die plek is niet vrij.")`
      },
      {
        title: "Controleer of iemand wint",
        text: "Er zijn acht winnende lijnen: drie rijen, drie kolommen en twee diagonalen. Loop ze allemaal langs en kijk of de drie vakjes gelijk zijn.",
        code: `lijnen = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]

def winnaar():
    for a, b, c in lijnen:
        if bord[a] == bord[b] == bord[c] != " ":
            return bord[a]
    return None`
      },
      {
        title: "Wissel beurten af",
        text: "Gebruik een for-loop van negen beurten. Na elke zet controleer je op winst. De for-else wordt uitgevoerd als de loop niet is gestopt: dan is het gelijkspel.",
        code: `speler = "X"

for beurt in range(9):
    toon_bord()
    zet(speler)

    if winnaar():
        toon_bord()
        print(winnaar(), "heeft gewonnen!")
        break

    speler = "O" if speler == "X" else "X"
else:
    toon_bord()
    print("Gelijkspel!")`
      },
      {
        title: "Voeg een computer toe",
        text: "Laat de computer willekeurig een vrij vakje kiezen. Dat is nog niet slim, maar wel een goede eerste stap. Later kun je hem laten blokkeren of winnen.",
        code: `import random

def computer_zet():
    vrije_plekken = [i for i, vak in enumerate(bord) if vak == " "]
    if vrije_plekken:
        bord[random.choice(vrije_plekken)] = "O"`
      }
    ],
    tips: [
      "Print het bord na elke zet, anders zie je niet wat er gebeurt.",
      "Test eerst met twee menselijke spelers voordat je de computer toevoegt.",
      "Een slimme computer kijkt eerst of hij kan winnen, daarna of hij moet blokkeren."
    ],
    next: ["galgje", "quiz-spel", "pong"]
  },
  {
    id: "quiz-spel",
    title: "Quizspel",
    emoji: "❓",
    category: "Games",
    level: "Beginner",
    time: "45 min",
    summary: "Stel meerkeuzevragen, houd de score bij en voeg zelf vragen toe.",
    description:
      "Een quiz met vragen als woordenboeken in een lijst. Je leert hoe je gestructureerde data gebruikt en hoe je gebruikersinvoer omzet naar een antwoord. Aan het eind heb je een sjabloon waarmee je elke quiz kunt maken.",
    learn: ["list van dicts", "enumerate()", "for-loop", "input()", "score"],
    steps: [
      {
        title: "Zet je vragen in een lijst",
        text: "Elke vraag is een woordenboek met de vraag, de opties en het juiste antwoord. Het juiste antwoord is de index van de optie, beginnend bij 0.",
        code: `vragen = [
    {
        "vraag": "Wat doet print() in Python?",
        "opties": ["Rekent iets uit", "Toont tekst op het scherm", "Slaat een bestand op"],
        "antwoord": 1,
    },
    {
        "vraag": "Welk type is 3.14?",
        "opties": ["int", "str", "float"],
        "antwoord": 2,
    },
]`
      },
      {
        title: "Toon een vraag met genummerde opties",
        text: "Met enumerate() zet je een nummer voor elke optie. De gebruiker kiest 1, 2 of 3.",
        code: `for vraag in vragen:
    print()
    print(vraag["vraag"])

    for nummer, optie in enumerate(vraag["opties"], start=1):
        print(nummer, "-", optie)

    keuze = int(input("Jouw antwoord: ")) - 1`
      },
      {
        title: "Controleer het antwoord en tel de score",
        text: "Vergelijk de keuze met de opgeslagen index. Geef bij een fout antwoord meteen het juiste antwoord, dat leert het meest.",
        code: `score = 0

for vraag in vragen:
    print()
    print(vraag["vraag"])

    for nummer, optie in enumerate(vraag["opties"], start=1):
        print(nummer, "-", optie)

    keuze = int(input("Jouw antwoord: ")) - 1

    if keuze == vraag["antwoord"]:
        print("Goed!")
        score += 1
    else:
        juiste = vraag["opties"][vraag["antwoord"]]
        print("Helaas. Het juiste antwoord is:", juiste)`
      },
      {
        title: "Toon de eindscore",
        text: "Bereken het percentage en sluit af met een passende boodschap. Door de score te delen door het aantal vragen krijg je een cijfer.",
        code: `aantal = len(vragen)
percentage = score / aantal * 100

print()
print(f"Je score: {score} van {aantal} ({percentage:.0f}%)")

if percentage == 100:
    print("Perfect! 🏆")
elif percentage >= 70:
    print("Netjes gedaan!")
else:
    print("Blijf oefenen, je komt er wel.")`
      },
      {
        title: "Hussel de vragen en breid uit",
        text: "Met random.shuffle() krijgt elke speler een andere volgorde. Voeg daarna je eigen vragen toe; de code verandert niet mee.",
        code: `import random

random.shuffle(vragen)

# Nieuwe vraag toevoegen:
vragen.append({
    "vraag": "Waar begint een Python-lijst mee te tellen?",
    "opties": ["0", "1", "Altijd willekeurig"],
    "antwoord": 0,
})`
      }
    ],
    tips: [
      "Hussel de opties niet zomaar, tenzij je ook het juiste antwoord bijwerkt.",
      "Vraag om een getal en vang fouten op met try/except.",
      "Bewaar je vragen in een JSON-bestand als je meerdere quizzen wilt."
    ],
    next: ["raad-het-getal", "tekst-avontuur", "weer-app"]
  },
  {
    id: "tekst-avontuur",
    title: "Tekst-avontuur",
    emoji: "🗺️",
    category: "Games",
    level: "Gemiddeld",
    time: "75 min",
    summary: "Bouw een verhaal waarin de speler zelf kiest wat er gebeurt.",
    description:
      "Je maakt een interactief verhaal met kamers, keuzes en een schat. Alle scènes staan in een woordenboek, zodat je nieuwe stukken verhaal kunt toevoegen zonder de code te herschrijven. Een geweldig project om logisch te leren denken.",
    learn: ["dict", "while", "input()", "state", "functies"],
    steps: [
      {
        title: "Beschrijf je scènes als data",
        text: "Elke scène heeft een tekst en keuzes die naar een andere scène verwijzen. De sleutels van de keuzes zijn de woorden die de speler typt.",
        code: `scenes = {
    "start": {
        "tekst": "Je staat bij een donker bos. Links een pad, rechts een rivier.",
        "opties": {"links": "bos", "rechts": "rivier"},
    },
    "bos": {
        "tekst": "Tussen de bomen vind je een oude kist.",
        "opties": {"open": "schat", "terug": "start"},
    },
    "rivier": {
        "tekst": "Een boot ligt klaar. Hij brengt je naar een eiland.",
        "opties": {"instappen": "schat", "terug": "start"},
    },
    "schat": {
        "tekst": "Je hebt de schat gevonden. Je wint!",
        "opties": {},
    },
}`
      },
      {
        title: "Toon de huidige scène",
        text: "De variabele huidige onthoudt waar de speler is. Elke ronde zoek je die scène op in het woordenboek en print je de tekst en opties.",
        code: `huidige = "start"

while True:
    scene = scenes[huidige]
    print()
    print(scene["tekst"])

    if not scene["opties"]:
        break

    for optie in scene["opties"]:
        print("-", optie)

    keuze = input("Wat doe je? ").lower()
    if keuze in scene["opties"]:
        huidige = scene["opties"][keuze]
    else:
        print("Dat kan niet. Kies een van de opties.")`
      },
      {
        title: "Voeg levens en voorwerpen toe",
        text: "Een avontuur wordt spannender met gevolgen. Houd levens en een inventory bij buiten de loop. Een verkeerde keuze kost bijvoorbeeld een leven.",
        code: `levens = 3
inventory = []

# In de loop, na een keuze:
if keuze == "open":
    inventory.append("oude sleutel")
    print("Je vindt een oude sleutel.")
elif keuze == "instappen":
    levens -= 1
    print("De boot lekt! Je verliest een leven.")

if levens <= 0:
    print("Game over.")
    break`
      },
      {
        title: "Maak je eigen verhaal",
        text: "Kopieer het patroon en voeg drie nieuwe scènes toe. Zorg dat elke scène minstens één uitweg heeft, anders zit de speler vast.",
        code: `scenes["grot"] = {
    "tekst": "Het is donker in de grot. Je hoort water druppelen.",
    "opties": {"verder": "schat", "terug": "start"},
}

scenes["start"]["opties"]["grot"] = "grot"

print("Nieuwe route toegevoegd!")`
      }
    ],
    tips: [
      "Teken je verhaal eerst op papier; dat voorkomt dat spelers vastlopen.",
      "Lowercase alle invoer met .lower() zodat 'Open' en 'open' hetzelfde werken.",
      "Bewaar scènes in een JSON-bestand als je verhaal heel groot wordt."
    ],
    next: ["quiz-spel", "galgje", "boter-kaas-eieren"]
  },
  {
    id: "weer-app",
    title: "Weer-app met een echte API",
    emoji: "🌤️",
    category: "Web",
    level: "Gemiddeld",
    time: "60 min",
    summary: "Vraag het actuele weer op voor elke stad — zonder API-sleutel.",
    description:
      "Je leert hoe je met een API praat: een verzoek sturen, JSON terugkrijgen en de juiste velden gebruiken. We gebruiken Open-Meteo, een gratis weer-API waarvoor je geen account nodig hebt.",
    learn: ["requests", "JSON", "API's", "params", "foutafhandeling"],
    steps: [
      {
        title: "Zoek de coördinaten van een stad",
        text: "Open-Meteo heeft een aparte zoek-API. Stuur de stadsnaam mee als parameter en bekijk wat er terugkomt. Print de JSON eerst volledig, dan zie je de structuur.",
        code: `import requests

plaats = input("Voor welke stad? ")

url = "https://geocoding-api.open-meteo.com/v1/search"
params = {"name": plaats, "count": 1, "language": "nl", "format": "json"}

data = requests.get(url, params=params, timeout=10).json()
print(data)`
      },
      {
        title: "Haal de juiste gegevens eruit",
        text: "De API geeft een lijst results terug. Als die leeg is, bestaat de stad niet. Anders pak je het eerste resultaat met naam, land en coördinaten.",
        code: `if "results" not in data:
    print("Ik kon die plaats niet vinden.")
else:
    plek = data["results"][0]
    print(plek["name"], "-", plek["country"])
    print("Breedte:", plek["latitude"])
    print("Lengte:", plek["longitude"])`
      },
      {
        title: "Vraag het weer op",
        text: "Met de coördinaten vraag je het actuele weer op. De parameter current bepaalt welke velden je terugkrijgt.",
        code: `weer_url = "https://api.open-meteo.com/v1/forecast"
weer_params = {
    "latitude": plek["latitude"],
    "longitude": plek["longitude"],
    "current": "temperature_2m,wind_speed_10m,weather_code",
}

weer = requests.get(weer_url, params=weer_params, timeout=10).json()
print(weer["current"])`
      },
      {
        title: "Maak de uitvoer leesbaar",
        text: "De weercode is een getal. Met een kleine functie zet je die om naar gewone taal. Daarna print je één nette zin.",
        code: `def beschrijf(code):
    if code == 0:
        return "zonnig"
    if code in (1, 2, 3):
        return "half bewolkt"
    if code in (45, 48):
        return "mistig"
    if code in (61, 63, 65):
        return "regen"
    return "wisselvallig"


nu = weer["current"]
temperatuur = nu["temperature_2m"]
wind = nu["wind_speed_10m"]

print(f"Het is {temperatuur} °C en {beschrijf(nu['weather_code'])}.")
print(f"De wind waait met {wind} km/u.")`
      },
      {
        title: "Vang netwerkfouten op",
        text: "Een API kan traag zijn of offline. Met try/except voorkom je dat je programma crasht. Geef een duidelijke melding en stop netjes.",
        code: `try:
    data = requests.get(url, params=params, timeout=10).json()
except requests.RequestException:
    print("Geen internet of de weer-dienst is niet bereikbaar.")
    raise SystemExit`
      }
    ],
    tips: [
      "Print de JSON één keer als je niet weet welk veld je nodig hebt.",
      "Gebruik altijd een timeout, anders kan je script eindeloos wachten.",
      "Open-Meteo vraagt geen sleutel; veel andere API's wel. Bewaar zo'n sleutel nooit in je code."
    ],
    next: ["streamlit-dashboard", "ai-chatbot", "webscraper"]
  }
];

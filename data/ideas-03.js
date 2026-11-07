// Deel 3: games en wetenschap.
import { idea, step } from "./helper.js";

export const IDEAS_PART_3 = [
  idea(
    "memorie",
    "Memorie",
    "🃏",
    "Games",
    "Beginner",
    "45 min",
    "Draai kaartjes om en vind alle paren.",
    "Je bouwt een tekstversie van memorie. De computer schudt een lijst met paren en jij draait steeds twee kaartjes om. Je leert lijsten, random.shuffle() en het vergelijken van waarden.",
    ["lists", "random.shuffle", "for", "functies"],
    [
      step("Maak een geschudde stapel", "Bouw een lijst met elk symbool twee keer en schud hem. Zo liggen de paren willekeurig door elkaar.", `import random

symbolen = ["A", "B", "C", "D"]
kaarten = symbolen * 2
random.shuffle(kaarten)
print(kaarten)`),
      step("Draai twee kaarten om", "Vraag de speler om twee posities. Controleer daarna of de symbolen gelijk zijn.", `def draai(kaarten, a, b):
    print(f"Kaart {a}: {kaarten[a]}")
    print(f"Kaart {b}: {kaarten[b]}")
    return kaarten[a] == kaarten[b]

print(draai(kaarten, 0, 1))`),
      step("Speel tot alle paren gevonden zijn", "Houd bij welke paren al gevonden zijn en stop wanneer alles open is.", `gevonden = set()

while len(gevonden) < len(kaarten):
    a = int(input("Eerste kaart (0-7): "))
    b = int(input("Tweede kaart (0-7): "))

    if draai(kaarten, a, b):
        gevonden.add(a)
        gevonden.add(b)
        print("Paar gevonden!")
    else:
        print("Helaas, probeer opnieuw.")

print("Alles gevonden!")`)
    ],
    ["Print de stapel tijdens het testen, dan zie je of het schudden werkt.", "Voeg een beurtenteller toe."]
  ),
  idea(
    "woord-raden",
    "Woord raden",
    "🔤",
    "Games",
    "Beginner",
    "40 min",
    "Raad een geheim woord letter voor letter.",
    "Een variant op galgje waarbij je met een set bijhoudt welke letters al geraden zijn. Je leert sets, strings en lussen combineren.",
    ["set", "strings", "while", "if / else"],
    [
      step("Kies een woord en maak het geheim", "Vervang nog niet geraden letters door streepjes. Dat maakt de voortgang zichtbaar.", `geheim = "python"
geraden = set()

def toon(woord, geraden):
    return " ".join(letter if letter in geraden else "_" for letter in woord)

print(toon(geheim, geraden))`),
      step("Verwerk een letter", "Voeg de letter toe aan de set en controleer of hij in het woord zit.", `letter = input("Raad een letter: ").lower()
geraden.add(letter)

if letter in geheim:
    print("Goed geraden!")
else:
    print("Die zit er niet in.")`),
      step("Stop als het woord compleet is", "Blijf vragen tot elke letter geraden is. Tel ook de fouten mee.", `fouten = 0

while True:
    print(toon(geheim, geraden))
    letter = input("Raad een letter: ").lower()

    if len(letter) != 1 or not letter.isalpha():
        print("Kies één letter.")
        continue

    geraden.add(letter)
    if letter not in geheim:
        fouten += 1

    if all(letter in geraden for letter in geheim):
        print(f"Gewonnen met {fouten} fouten!")
        break
    if fouten >= 8:
        print(f"Helaas, het woord was {geheim}.")
        break`)
    ],
    ["Gebruik een lijst met woorden en random.choice() voor meer variatie.", "Toon de gebruikte letters apart."]
  ),
  idea(
    "dobbelsteen-simulator",
    "Dobbelsteen-simulator",
    "🎲",
    "Games",
    "Beginner",
    "25 min",
    "Gooi virtuele dobbelstenen en bekijk de verdeling.",
    "Je simuleert duizenden worpen en telt hoe vaak elk getal voorkomt. Daarmee leer je random, dictionaries en tellen.",
    ["random.randint", "dict", "for", "f-strings"],
    [
      step("Gooi één dobbelsteen", "random.randint(1, 6) geeft een geheel getal van 1 tot en met 6.", `import random

for _ in range(5):
    print(random.randint(1, 6))`),
      step("Simuleer duizend worpen", "Gebruik een dictionary om per uitkomst te tellen hoe vaak die voorkomt.", `telling = {ogen: 0 for ogen in range(1, 7)}

for _ in range(1000):
    worp = random.randint(1, 6)
    telling[worp] += 1

print(telling)`),
      step("Toon de verdeling", "Print per getal een eenvoudige balk. Zo zie je meteen of de verdeling ongeveer gelijk is.", `for ogen, aantal in sorted(telling.items()):
    balk = "#" * (aantal // 20)
    print(f"{ogen}: {balk} ({aantal})")`)
    ],
    ["Gooi eerst 10 keer en daarna 10000 keer; vergelijk de verdeling.", "Voeg meerdere dobbelstenen toe."]
  ),
  idea(
    "hoger-lager",
    "Hoger of lager",
    "🔼",
    "Games",
    "Beginner",
    "30 min",
    "Raad of de volgende kaart hoger of lager is.",
    "Een kaartspel met een oneindige score. Je leert random, vergelijken en een while-loop met een teller.",
    ["random", "while", "if / else", "score"],
    [
      step("Trek een kaart", "Simuleer een kaart met een getal van 1 tot en met 13.", `import random

def trek_kaart():
    return random.randint(1, 13)

huidig = trek_kaart()
print("Huidige kaart:", huidig)`),
      step("Vraag hoger of lager", "Lees de keuze en trek daarna de volgende kaart.", `keuze = input("Hoger of lager? ").lower()
volgende = trek_kaart()
print("Volgende kaart:", volgende)`),
      step("Houd de score bij", "Vergelijk de kaarten en ga door zolang de speler goed raadt.", `score = 0
huidig = trek_kaart()

while True:
    keuze = input(f"Kaart {huidig}: hoger of lager? ").lower()
    volgende = trek_kaart()

    if (keuze == "hoger" and volgende > huidig) or (keuze == "lager" and volgende < huidig):
        score += 1
        print(f"Goed! Score: {score}")
        huidig = volgende
    else:
        print(f"Mis. Je eindscore is {score}.")
        break`)
    ],
    ["Behandel gelijke kaarten als een nieuwe ronde.", "Voeg een maximumaantal rondes toe."]
  ),
  idea(
    "snake-ai",
    "Snake met een computertegenstander",
    "🐍",
    "Games",
    "Gevorderd",
    "2 uur",
    "Laat een simpele AI Snake spelen.",
    "Je bouwt eerst een tekstversie van Snake en daarna een eenvoudige strategie die naar het voedsel toe beweegt. Zo combineer je spelregels met algoritmisch denken.",
    ["grid", "BFS", "collections.deque", "algoritme"],
    [
      step("Bouw een tekstgrid", "Een lijst met lijsten is een simpel speelveld. Zet de slang en het voedsel erin.", `from collections import deque

breedte, hoogte = 12, 8
slang = deque([(3, 3), (2, 3), (1, 3)])
voedsel = (7, 4)

def toon():
    for y in range(hoogte):
        rij = ""
        for x in range(breedte):
            if (x, y) == voedsel:
                rij += "*"
            elif (x, y) in slang:
                rij += "o"
            else:
                rij += "."
        print(rij)

toon()`),
      step("Beweeg de slang", "Voeg een nieuwe kop toe en verwijder de staart. Zo groeit de slang alleen als hij eet.", `def stap(richting):
    kop_x, kop_y = slang[0]
    dx, dy = richting
    nieuwe_kop = (kop_x + dx, kop_y + dy)

    slang.appendleft(nieuwe_kop)
    if nieuwe_kop != voedsel:
        slang.pop()

stap((1, 0))
toon()`),
      step("Kies een eenvoudige AI-richting", "Bereken het verschil tussen de kop en het voedsel. De AI kiest eerst de horizontale richting en daarna de verticale.", `def kies_richting():
    kop_x, kop_y = slang[0]
    voedsel_x, voedsel_y = voedsel

    if kop_x < voedsel_x:
        return (1, 0)
    if kop_x > voedsel_x:
        return (-1, 0)
    if kop_y < voedsel_y:
        return (0, 1)
    return (0, -1)

for _ in range(10):
    stap(kies_richting())
    toon()
    print()`)
    ],
    ["Voorkom dat de slang tegen de muur of zichzelf botsen.", "Gebruik daarna BFS voor een slimmere route."]
  ),
  idea(
    "asteroids-spel",
    "Asteroïden",
    "☄️",
    "Games",
    "Gemiddeld",
    "2 uur",
    "Beweeg een schip tussen vallende rotsen.",
    "Met pygame maak je een klein arcadespel. Je leert game loops, toetsenbordinvoer, botsingen en het tekenen van vormen.",
    ["pygame", "game loop", "collision", "klassen"],
    [
      step("Start een pygame-venster", "Pygame tekent alles in een loop. De klok houdt de snelheid stabiel.", `import pygame

pygame.init()
scherm = pygame.display.set_mode((800, 600))
klok = pygame.time.Clock()
loopt = True

while loopt:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            loopt = False

    scherm.fill((10, 12, 20))
    pygame.display.flip()
    klok.tick(60)

pygame.quit()`),
      step("Teken en bestuur het schip", "Houd de positie bij en pas die aan op basis van ingedrukte toetsen.", `schip_x, schip_y = 400, 500
snelheid = 6

toetsen = pygame.key.get_pressed()
if toetsen[pygame.K_LEFT]:
    schip_x -= snelheid
if toetsen[pygame.K_RIGHT]:
    schip_x += snelheid

pygame.draw.polygon(scherm, (120, 200, 255), [
    (schip_x, schip_y - 18),
    (schip_x - 14, schip_y + 14),
    (schip_x + 14, schip_y + 14)
])`),
      step("Laat rotsen vallen en test botsingen", "Beweeg de rotsen naar beneden en vergelijk de afstand met het schip.", `import random

rotsen = [[random.randint(0, 780), 0] for _ in range(6)]

for rots in rotsen:
    rots[1] += 3
    pygame.draw.circle(scherm, (180, 180, 190), (rots[0], rots[1]), 18)

    afstand = ((rots[0] - schip_x) ** 2 + (rots[1] - schip_y) ** 2) ** 0.5
    if afstand < 30:
        print("Botsing!")
        loopt = False`)
    ],
    ["Begin met één rots en voeg er daarna meer toe.", "Gebruik een lijst met dictionaries voor alle rotsen."]
  ),
  idea(
    "breakout",
    "Breakout",
    "🧱",
    "Games",
    "Gemiddeld",
    "90 min",
    "Kaats een bal en breek alle blokken.",
    "Je bouwt de klassieke muur van blokken. Je leert een bal laten stuiteren, een paddle besturen en blokken verwijderen bij een botsing.",
    ["pygame", "collision", "lijsten", "game loop"],
    [
      step("Teken de bal en paddle", "Begin met een bal en een paddle onderaan het scherm.", `import pygame

pygame.init()
scherm = pygame.display.set_mode((800, 600))
klok = pygame.time.Clock()

bal = pygame.Rect(390, 300, 20, 20)
paddle = pygame.Rect(350, 550, 100, 14)
bal_snelheid = [4, -4]
loopt = True

while loopt:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            loopt = False

    scherm.fill((12, 14, 22))
    pygame.draw.ellipse(scherm, (255, 220, 80), bal)
    pygame.draw.rect(scherm, (120, 200, 255), paddle)
    pygame.display.flip()
    klok.tick(60)`),
      step("Beweeg en laat de bal stuiteren", "De bal kaatst tegen de randen en tegen de paddle.", `bal.x += bal_snelheid[0]
bal.y += bal_snelheid[1]

if bal.left <= 0 or bal.right >= 800:
    bal_snelheid[0] *= -1
if bal.top <= 0:
    bal_snelheid[1] *= -1
if bal.colliderect(paddle):
    bal_snelheid[1] = -abs(bal_snelheid[1])

paddle.x = pygame.mouse.get_pos()[0] - paddle.width // 2`),
      step("Maak blokken die verdwijnen", "Bewaar de blokken in een lijst en verwijder een blok bij een botsing.", `blokken = [pygame.Rect(60 + kolom * 110, 80 + rij * 40, 90, 24)
           for rij in range(4) for kolom in range(7)]

for blok in blokken[:]:
    pygame.draw.rect(scherm, (255, 120, 90), blok)
    if bal.colliderect(blok):
        blokken.remove(blok)
        bal_snelheid[1] *= -1

if not blokken:
    print("Gewonnen!")
    loopt = False`)
    ],
    ["Houd de bal onder de paddle als hij valt; voeg een levenenteller toe.", "Laat de bal sneller worden na elke botsing."]
  ),
  idea(
    "flappy-bird",
    "Flappy Bird",
    "🐤",
    "Games",
    "Gemiddeld",
    "90 min",
    "Laat een vogel door buizen vliegen.",
    "Een klein spel met zwaartekracht en buizen. Je leert physics, score en een eenvoudige game loop.",
    ["pygame", "zwaartekracht", "collision", "score"],
    [
      step("Laat de vogel vallen", "Zwaartekracht verhoogt de valsnelheid. Een sprong zet de snelheid omlaag.", `import pygame

pygame.init()
scherm = pygame.display.set_mode((480, 640))
klok = pygame.time.Clock()

vogel = pygame.Rect(100, 300, 34, 34)
snelheid = 0
zwaartekracht = 0.5

while True:
    snelheid += zwaartekracht
    vogel.y += snelheid
    scherm.fill((110, 190, 255))
    pygame.draw.rect(scherm, (255, 210, 60), vogel)
    pygame.display.flip()
    klok.tick(60)`),
      step("Spring met de spatiebalk", "Bij een toetsaanslag krijgt de vogel een negatieve snelheid.", `for event in pygame.event.get():
    if event.type == pygame.QUIT:
        pygame.quit()
        raise SystemExit
    if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
        snelheid = -8`),
      step("Voeg buizen en een score toe", "Beweeg buizen naar links en tel een punt als de vogel er langs komt.", `buizen = [pygame.Rect(480, 200, 70, 260)]
score = 0

for buis in buizen:
    buis.x -= 3
    pygame.draw.rect(scherm, (80, 170, 80), buis)

    if vogel.colliderect(buis) or vogel.bottom >= 640:
        print("Game over. Score:", score)
        break

    if not hasattr(buis, "geteld") and buis.right < vogel.left:
        score += 1
        buis.geteld = True

if buizen and buizen[-1].x < 240:
    buizen.append(pygame.Rect(480, 150, 70, 220))`)
    ],
    ["Begin zonder buizen en test eerst alleen de sprong.", "Gebruik een lijst met dictionaries voor buisposities."]
  ),
  idea(
    "tetris",
    "Tetris",
    "🧩",
    "Games",
    "Gevorderd",
    "2 uur",
    "Laat blokken vallen en maak volledige rijen.",
    "Tetris vraagt een grid, vallende stukken en rij-detectie. Je leert een 2D-rooster en het roteren van vormen.",
    ["grid", "2D-lijsten", "collision", "rotatie"],
    [
      step("Maak een leeg speelveld", "Een lijst met rijen vormt het bord. 0 betekent leeg.", `breedte, hoogte = 10, 20
bord = [[0 for _ in range(breedte)] for _ in range(hoogte)]

def toon():
    for rij in bord:
        print("".join("#" if cel else "." for cel in rij))`),
      step("Plaats een vallend blok", "Een T-vorm bestaat uit vier coördinaten. Teken ze in het bord.", `blok = [(4, 0), (5, 0), (6, 0), (5, 1)]

for x, y in blok:
    bord[y][x] = 1

toon()`),
      step("Laat het blok zakken en wis rijen", "Verschuif het blok omlaag tot het ergens op stuit. Daarna verwijder je volledige rijen.", `def zakt_naar_beneden(blok):
    while all(y + 1 < hoogte and bord[y + 1][x] == 0 for x, y in blok):
        blok = [(x, y + 1) for x, y in blok]
    for x, y in blok:
        bord[y][x] = 1
    return blok

zakt_naar_beneden(blok)

for rij in range(hoogte):
    if all(bord[rij]):
        bord.pop(rij)
        bord.insert(0, [0] * breedte)

toon()`)
    ],
    ["Begin met één soort blok voordat je rotaties toevoegt.", "Test rij-detectie met een handmatig gevuld bord."]
  ),
  idea(
    "minesweeper",
    "Mijnenveger",
    "💣",
    "Games",
    "Gevorderd",
    "2 uur",
    "Ontdek veilige vakjes zonder op een mijn te klikken.",
    "Je bouwt een tekstversie van mijnenveger. Je leert een grid vullen, buren tellen en invoer verwerken.",
    ["grid", "random", "buren", "sets"],
    [
      step("Plaats mijnen", "Kies willekeurige posities en bewaar ze in een set.", `import random

grootte = 8
mijnen = set()

while len(mijnen) < 10:
    x = random.randrange(grootte)
    y = random.randrange(grootte)
    mijnen.add((x, y))

print(mijnen)`),
      step("Tel de mijnen rond een vakje", "Loop over de acht buren en tel hoeveel mijnen er staan.", `def buren(x, y):
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < grootte and 0 <= ny < grootte:
                yield nx, ny

def aantal_mijnen(x, y):
    return sum((bx, by) in mijnen for bx, by in buren(x, y))

print(aantal_mijnen(3, 3))`),
      step("Speel het spel", "Vraag om een vakje en stop bij een mijn. Houd gevonden veilige vakjes bij.", `veilig = set()

while True:
    x = int(input("X: "))
    y = int(input("Y: "))

    if (x, y) in mijnen:
        print("BOEM! Je hebt verloren.")
        break

    veilig.add((x, y))
    print("Mijnen rond dit vakje:", aantal_mijnen(x, y))

    if len(veilig) == grootte * grootte - len(mijnen):
        print("Gewonnen!")
        break`)
    ],
    ["Teken het bord met vraagtekens en laat gevonden getallen zien.", "Voeg een vlaggenfunctie toe."]
  ),
  idea(
    "simon-says",
    "Simon Says",
    "🔴",
    "Games",
    "Gemiddeld",
    "60 min",
    "Onthoud en herhaal een steeds langere reeks.",
    "Het spel voegt elke ronde een kleur toe. De speler moet de hele reeks herhalen. Je leert lijsten, random.choice en invoer valideren.",
    ["lists", "random.choice", "while", "validatie"],
    [
      step("Maak een beginkleur", "Kies willekeurig uit vier kleuren en toon de reeks.", `import random

kleuren = ["rood", "groen", "blauw", "geel"]
reeks = [random.choice(kleuren)]
print("Onthoud:", reeks)`),
      step("Laat de speler herhalen", "Vraag de speler om de kleuren in de juiste volgorde te typen.", `antwoord = []
for _ in reeks:
    antwoord.append(input("Kleur: ").lower())

if antwoord == reeks:
    print("Goed!")
else:
    print("Fout. De reeks was:", reeks)`),
      step("Maak de reeks langer", "Bij een goed antwoord voeg je een kleur toe en ga je door.", `while True:
    print("Onthoud:", reeks)
    antwoord = [input("Kleur: ").lower() for _ in reeks]

    if antwoord != reeks:
        print("Game over. Je reeks was", len(reeks) - 1, "kleuren.")
        break

    reeks.append(random.choice(kleuren))
    print("Goed! De reeks wordt langer.")`)
    ],
    ["Toon de reeks met een korte pauze tussen de kleuren.", "Voeg een moeilijkheidsgraad toe."]
  ),
  idea(
    "emoji-raden",
    "Emoji raden",
    "😀",
    "Games",
    "Beginner",
    "30 min",
    "Raad welk woord bij een reeks emoji's hoort.",
    "Een quizspel met emoji's als hints. Je leert dictionaries, random.choice en een score bijhouden.",
    ["dict", "random.choice", "for", "score"],
    [
      step("Maak een quizvragenlijst", "Koppel elke emoji-hint aan het juiste antwoord.", `vragen = {
    "🍎 + 🍌 + 🍇": "fruit",
    "🌞 + 🌧️": "regenboog",
    "🐍 + 💻": "python",
    "🎮 + 🕹️": "gamen"
}`),
      step("Stel één vraag", "Kies een willekeurige vraag en vergelijk het antwoord.", `import random

hint, antwoord = random.choice(list(vragen.items()))
print(hint)
gok = input("Wat is het? ").lower()

if gok == antwoord:
    print("Goed!")
else:
    print("Het antwoord was:", antwoord)`),
      step("Speel meerdere rondes", "Houd de score bij en stop na vijf vragen.", `score = 0

for _ in range(5):
    hint, antwoord = random.choice(list(vragen.items()))
    print("\\n", hint)
    if input("Antwoord: ").lower() == antwoord:
        score += 1
        print("Goed!")
    else:
        print("Fout, het was:", antwoord)

print("Score:", score, "van 5")`)
    ],
    ["Maak de antwoorden niet hoofdlettergevoelig.", "Voeg zelf emoji-hints toe."]
  ),
  idea(
    "woordketting",
    "Woordketting",
    "🔗",
    "Games",
    "Gemiddeld",
    "45 min",
    "Maak een ketting van woorden die op elkaar aansluiten.",
    "De speler en de computer noemen om de beurt een woord dat begint met de laatste letter van het vorige woord. Je leert sets en stringbewerkingen.",
    ["strings", "set", "while", "validatie"],
    [
      step("Controleer de laatste letter", "Met [-1] pak je de laatste letter van een woord.", `def laatste_letter(woord):
    return woord[-1].lower()

print(laatste_letter("python"))`),
      step("Controleer of een woord geldig is", "Het nieuwe woord moet met de juiste letter beginnen en nog niet gebruikt zijn.", `gebruikt = {"python"}
vorige = "python"

woord = input(f"Woord dat begint met '{laatste_letter(vorige)}': ").lower()

if not woord.startswith(laatste_letter(vorige)):
    print("Verkeerde beginletter.")
elif woord in gebruikt:
    print("Dat woord is al gebruikt.")
else:
    gebruikt.add(woord)
    print("Geldig!")`),
      step("Laat de computer meedoen", "Kies een woord uit een lijst dat met de juiste letter begint.", `woorden = {"noot", "toren", "nevel", "letter", "regen"}

def computer_woord(letter, gebruikt):
    for woord in woorden:
        if woord.startswith(letter) and woord not in gebruikt:
            return woord
    return None

letter = laatste_letter("python")
print("Computer kiest:", computer_woord(letter, gebruikt))`)
    ],
    ["Gebruik een grotere woordenlijst uit een tekstbestand.", "Voeg een timer per beurt toe."]
  ),
  idea(
    "eenentwintigen",
    "Eenentwintigen",
    "🃏",
    "Games",
    "Gemiddeld",
    "50 min",
    "Speel 21 tegen de computer.",
    "Je simuleert kaarten en een dealer. Je leert lijsten, functies en de spelregels van blackjack vereenvoudigen.",
    ["lists", "random.choice", "functies", "while"],
    [
      step("Trek een kaart", "Gebruik een lijst met kaartwaarden en trek willekeurig.", `import random

kaarten = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]

def trek():
    return random.choice(kaarten)

print(trek(), trek())`),
      step("Bereken de score", "Tel de kaarten op en verlaag een aas van 11 naar 1 als de score boven 21 komt.", `def score(hand):
    totaal = sum(hand)
    while totaal > 21 and 11 in hand:
        hand[hand.index(11)] = 1
        totaal = sum(hand)
    return totaal

hand = [10, 11]
print(score(hand))`),
      step("Speel een ronde", "De speler mag kaarten blijven trekken. Daarna speelt de dealer.", `speler = [trek(), trek()]
dealer = [trek(), trek()]

while score(speler) < 21:
    print("Jouw hand:", speler, score(speler))
    if input("Nog een kaart? (j/n) ").lower() != "j":
        break
    speler.append(trek())

while score(dealer) < 17:
    dealer.append(trek())

print("Speler:", score(speler), "Dealer:", score(dealer))
if score(speler) > 21:
    print("Je bent kapot.")
elif score(dealer) > 21 or score(speler) > score(dealer):
    print("Je wint!")
else:
    print("De dealer wint.")`)
    ],
    ["Gebruik een volledig kaartspel met kleuren.", "Voeg inzetten en meerdere rondes toe."]
  ),
  idea(
    "bingo",
    "Bingo",
    "🎟️",
    "Games",
    "Beginner",
    "35 min",
    "Trek nummers en controleer je kaart.",
    "Je genereert een bingokaart en trekt willekeurige nummers. Je leert sets, random.sample en controleren of een rij vol is.",
    ["set", "random.sample", "for", "voorwaarden"],
    [
      step("Maak een bingokaart", "Kies 25 unieke nummers voor een 5x5-kaart.", `import random

nummers = random.sample(range(1, 76), 25)
kaart = [nummers[i:i + 5] for i in range(0, 25, 5)]

for rij in kaart:
    print(rij)`),
      step("Trek een nummer", "Houd getrokken nummers bij in een set.", `getrokken = set()

def trek_nummer():
    nummer = random.choice([n for n in range(1, 76) if n not in getrokken])
    getrokken.add(nummer)
    return nummer

print(trek_nummer())`),
      step("Controleer of je bingo hebt", "Kijk of een hele rij van de kaart in de getrokken set zit.", `def heeft_bingo():
    return any(all(nummer in getrokken for nummer in rij) for rij in kaart)

while not heeft_bingo():
    nummer = trek_nummer()
    print("Getrokken:", nummer)

print("BINGO!")`)
    ],
    ["Speel met meerdere kaarten.", "Controleer ook kolommen en diagonalen."]
  ),
  idea(
    "doolhof",
    "Doolhof oplossen",
    "🧭",
    "Games",
    "Gevorderd",
    "2 uur",
    "Zoek de uitgang in een doolhof.",
    "Je leert een doolhof als grid voorstellen en zoeken met een stack. Dit is een klassiek algoritme dat je ook buiten games gebruikt.",
    ["grid", "DFS", "stack", "algoritme"],
    [
      step("Maak een doolhof", "Een # is een muur en een punt is een vrije plek.", `doolhof = [
    "#########",
    "#S..#...#",
    "#.#.#.#.#",
    "#.#...#.#",
    "#.#####.#",
    "#.......#",
    "#########",
]`),
      step("Zoek de buurvakjes", "Vanuit een positie kun je naar boven, onder, links en rechts.", `def buren(positie):
    x, y = positie
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if doolhof[ny][nx] != "#":
            yield (nx, ny)`),
      step("Zoek met een stack", "Depth-first search probeert steeds een nieuwe buur. Houd bezochte vakjes bij.", `start = (1, 1)
doel = (7, 5)
stack = [start]
bezocht = {start}
vorige = {}

while stack:
    huidig = stack.pop()
    if huidig == doel:
        break

    for buur in buren(huidig):
        if buur not in bezocht:
            bezocht.add(buur)
            vorige[buur] = huidig
            stack.append(buur)

pad = []
stap = doel
while stap != start:
    pad.append(stap)
    stap = vorige[stap]
pad.append(start)
print("Pad:", list(reversed(pad)))`)
    ],
    ["Print het pad in het doolhof.", "Probeer daarna BFS voor de kortste route."]
  ),
  idea(
    "platformer",
    "Platformspel",
    "🏃",
    "Games",
    "Gevorderd",
    "2 uur",
    "Spring over platforms naar de finish.",
    "Een zijwaarts platformspel met zwaartekracht en platforms. Je leert collision detection en een camera volgen.",
    ["pygame", "zwaartekracht", "collision", "camera"],
    [
      step("Beweeg de speler", "Met pijltjes verander je de horizontale snelheid.", `import pygame

pygame.init()
scherm = pygame.display.set_mode((800, 500))
klok = pygame.time.Clock()
speler = pygame.Rect(100, 350, 34, 44)
snelheid_x = 0
snelheid_y = 0

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            raise SystemExit

    toetsen = pygame.key.get_pressed()
    snelheid_x = (toetsen[pygame.K_RIGHT] - toetsen[pygame.K_LEFT]) * 4
    speler.x += snelheid_x
    scherm.fill((120, 180, 255))
    pygame.draw.rect(scherm, (220, 90, 70), speler)
    pygame.display.flip()
    klok.tick(60)`),
      step("Voeg zwaartekracht toe", "De speler valt omlaag tot hij op een platform staat.", `platforms = [pygame.Rect(0, 450, 800, 50), pygame.Rect(300, 360, 180, 20)]
snelheid_y += 0.8
speler.y += snelheid_y

for platform in platforms:
    if speler.colliderect(platform) and snelheid_y > 0:
        speler.bottom = platform.top
        snelheid_y = 0`),
      step("Laat de speler springen", "Een sprong mag alleen als de speler op de grond staat.", `op_grond = any(speler.colliderect(p) and speler.bottom == p.top for p in platforms)

if op_grond and toetsen[pygame.K_SPACE]:
    snelheid_y = -14

if speler.top > 500:
    print("Je bent gevallen!")
    break`)
    ],
    ["Maak een level als lijst met rechthoeken.", "Laat de camera meebewegen als de speler naar rechts loopt."]
  ),
  idea(
    "quizduel",
    "Quizduel",
    "⚔️",
    "Games",
    "Gemiddeld",
    "50 min",
    "Speel een quiz tegen de computer.",
    "Je maakt een quiz met punten voor jou en de computer. Je leert dictionaries, random en een beurtensysteem.",
    ["dict", "random", "while", "score"],
    [
      step("Maak vragen met antwoorden", "Bewaar de vraag, opties en het juiste antwoord in een dictionary.", `vragen = [
    {"vraag": "Wat doet print()?", "antwoord": "tekst tonen"},
    {"vraag": "Welk type is 3.14?", "antwoord": "float"},
    {"vraag": "Waarmee herhaal je code?", "antwoord": "een loop"},
]`),
      step("Stel een vraag aan de speler", "Toon de vraag en vergelijk het antwoord.", `import random

vraag = random.choice(vragen)
print(vraag["vraag"])
antwoord = input("Jouw antwoord: ").lower()

if antwoord == vraag["antwoord"]:
    print("Punt voor jou!")
else:
    print("De computer krijgt een punt.")`),
      step("Speel meerdere rondes", "Houd de scores bij en stop na vijf vragen.", `speler_score = 0
computer_score = 0

for _ in range(5):
    vraag = random.choice(vragen)
    print("\\n" + vraag["vraag"])
    if input("Antwoord: ").lower() == vraag["antwoord"]:
        speler_score += 1
    else:
        computer_score += 1

print(f"Jij: {speler_score} - Computer: {computer_score}")`)
    ],
    ["Voeg meerkeuzevragen met vier opties toe.", "Maak de antwoorden minder streng met synonyms."]
  ),
  idea(
    "life-simulator",
    "Game of Life",
    "🧬",
    "Games",
    "Gemiddeld",
    "60 min",
    "Simuleer cellen die leven, sterven en geboren worden.",
    "Conway's Game of Life is een grid met simpele regels die verrassend complexe patronen maakt. Je leert 2D-lijsten en buren tellen.",
    ["2D-lijsten", "buren", "simulatie", "print"],
    [
      step("Maak een startgrid", "Een paar levende cellen is genoeg om te beginnen.", `grootte = 12
grid = [[0 for _ in range(grootte)] for _ in range(grootte)]
grid[5][5] = grid[5][6] = grid[5][7] = 1

for rij in grid:
    print("".join("█" if cel else "·" for cel in rij))`),
      step("Tel de levende buren", "Elke cel kijkt naar de acht omliggende cellen.", `def buren(rij, kolom):
    totaal = 0
    for dr in (-1, 0, 1):
        for dk in (-1, 0, 1):
            if dr == 0 and dk == 0:
                continue
            r, k = rij + dr, kolom + dk
            if 0 <= r < grootte and 0 <= k < grootte:
                totaal += grid[r][k]
    return totaal`),
      step("Bereken de volgende generatie", "Pas de drie regels toe en print het nieuwe grid.", `def volgende():
    nieuw = [[0] * grootte for _ in range(grootte)]
    for rij in range(grootte):
        for kolom in range(grootte):
            aantal = buren(rij, kolom)
            if grid[rij][kolom] == 1 and aantal in (2, 3):
                nieuw[rij][kolom] = 1
            elif grid[rij][kolom] == 0 and aantal == 3:
                nieuw[rij][kolom] = 1
    return nieuw

grid = volgende()
for rij in grid:
    print("".join("█" if cel else "·" for cel in rij))`)
    ],
    ["Begin met een blok, een knipperlicht en een glider.", "Maak een oneindig grid met wrap-around randen."]
  ),
  idea(
    "slimme-boter-kaas-eieren",
    "Slimme boter-kaas-eieren",
    "❌",
    "Games",
    "Gevorderd",
    "2 uur",
    "Laat de computer nooit verliezen.",
    "Je breidt boter-kaas-eieren uit met een tegenstander die wint of blokkeert. Je leert een grid evalueren en een eenvoudige minimax-strategie.",
    ["2D-lijsten", "minimax", "recursie", "algoritme"],
    [
      step("Maak het bord en de wincheck", "Een 3x3-grid en een functie die kijkt of iemand drie op een rij heeft.", `bord = [[" " for _ in range(3)] for _ in range(3)]

def winnaar(speler):
    for i in range(3):
        if all(bord[i][j] == speler for j in range(3)):
            return True
        if all(bord[j][i] == speler for j in range(3)):
            return True
    if all(bord[i][i] == speler for i in range(3)):
        return True
    if all(bord[i][2 - i] == speler for i in range(3)):
        return True
    return False`),
      step("Zoek een winnende zet", "Probeer elke lege plek en kijk of de computer daarmee wint.", `def winnende_zet(speler):
    for rij in range(3):
        for kolom in range(3):
            if bord[rij][kolom] == " ":
                bord[rij][kolom] = speler
                if winnaar(speler):
                    bord[rij][kolom] = " "
                    return (rij, kolom)
                bord[rij][kolom] = " "
    return None

zet = winnende_zet("O")
print("Winnende zet:", zet)`),
      step("Blokkeer de tegenstander", "Als de computer niet kan winnen, kijk dan of de speler dreigt te winnen.", `def kies_zet():
    for speler in ("O", "X"):
        zet = winnende_zet(speler)
        if zet:
            return zet

    if bord[1][1] == " ":
        return (1, 1)

    for rij in range(3):
        for kolom in range(3):
            if bord[rij][kolom] == " ":
                return (rij, kolom)

    return None

print(kies_zet())`)
    ],
    ["Test de blokkering met een bijna-vol bord.", "Breid later uit naar echte minimax."]
  ),
  idea(
    "priemgetallen",
    "Priemgetallen zoeken",
    "🔢",
    "Wetenschap",
    "30 min",
    "Beginner",
    "Vind alle priemgetallen tot een grens.",
    "Je schrijft een efficiënte zeef van Eratosthenes. Je leert lijsten, bereik en wiskundig redeneren.",
    ["lists", "for", "wiskunde", "algoritme"],
    [
      step("Maak een lijst met kandidaten", "Begin met alle getallen van 2 tot en met de grens.", `grens = 50
kandidaten = list(range(2, grens + 1))
print(kandidaten)`),
      step("Streep veelvouden weg", "Voor elk priemgetal streep je alle veelvouden weg.", `for getal in range(2, int(grens ** 0.5) + 1):
    if getal in kandidaten:
        for veelvoud in range(getal * getal, grens + 1, getal):
            if veelvoud in kandidaten:
                kandidaten.remove(veelvoud)

print(kandidaten)`),
      step("Tel en print de priemgetallen", "Toon hoeveel priemgetallen je hebt gevonden.", `print("Aantal:", len(kandidaten))
print("Priemgetallen:", ", ".join(str(n) for n in kandidaten))`)
    ],
    ["Vergelijk de zeef met een simpele deler-test.", "Probeer de grens 100000 en meet de tijd."]
  ),
  idea(
    "fibonacci",
    "Fibonacci en de gulden snede",
    "🌀",
    "Wetenschap",
    "Beginner",
    "30 min",
    "Genereer de Fibonacci-reeks en onderzoek de verhouding.",
    "Je berekent de reeks met een loop en bekijkt hoe de verhouding naar de gulden snede groeit.",
    ["while", "lists", "float", "wiskunde"],
    [
      step("Genereer de reeks", "Elk getal is de som van de twee vorige.", `a, b = 0, 1
reeks = []

for _ in range(20):
    reeks.append(a)
    a, b = b, a + b

print(reeks)`),
      step("Bereken de verhouding", "Deel elk getal door het vorige en print het resultaat.", `for i in range(2, len(reeks)):
    verhouding = reeks[i] / reeks[i - 1]
    print(reeks[i], round(verhouding, 6))`),
      step("Vergelijk met de gulden snede", "De verhouding nadert 1,6180339887.", `gulden_snede = (1 + 5 ** 0.5) / 2
print("Gulden snede:", round(gulden_snede, 8))
print("Laatste verhouding:", round(reeks[-1] / reeks[-2], 8))`)
    ],
    ["Probeer ook een recursieve versie en vergelijk de snelheid.", "Maak een grafiek van de verhouding."]
  ),
  idea(
    "mandelbrot",
    "Mandelbrot-verkenner",
    "🌈",
    "Wetenschap",
    "Gemiddeld",
    "60 min",
    "Teken een fractal met tekst of pixels.",
    "Je berekent voor elk punt of het binnen de Mandelbrot-set valt. Je leert complexe getallen, loops en visualisatie.",
    ["complex", "for", "fractal", "visualisatie"],
    [
      step("Bereken één punt", "Herhaal de formule z = z*z + c en kijk of z ontsnapt.", `def in_mandelbrot(c, max_iter=30):
    z = 0
    for _ in range(max_iter):
        z = z * z + c
        if abs(z) > 2:
            return False
    return True

print(in_mandelbrot(0))`),
      step("Teken een tekstfractal", "Loop over een rooster en print een teken voor elk punt.", `for y in range(-12, 13):
    rij = ""
    for x in range(-39, 21):
        c = complex(x / 20, y / 10)
        rij += "#" if in_mandelbrot(c) else " "
    print(rij)`),
      step("Maak het fijner", "Vergroot het aantal iteraties en het bereik voor meer detail.", `for y in range(-20, 21):
    rij = ""
    for x in range(-60, 21):
        c = complex(x / 30 - 0.5, y / 15)
        rij += "#" if in_mandelbrot(c, 60) else " "
    print(rij)`)
    ],
    ["Gebruik matplotlib voor een kleurenversie.", "Zoom in op een interessant randgebied."]
  ),
  idea(
    "planeten-simulatie",
    "Planeten-simulatie",
    "🪐",
    "Wetenschap",
    "Gevorderd",
    "2 uur",
    "Laat planeten rond een ster bewegen.",
    "Je simuleert zwaartekracht met eenvoudige natuurkunde. Je leert vectoren, klassen en numerieke integratie.",
    ["klassen", "wiskunde", "simulatie", "vectoren"],
    [
      step("Maak een planeet", "Een planeet heeft een positie, snelheid en massa.", `class Planeet:
    def __init__(self, x, y, vx, vy, massa):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.massa = massa

aarde = Planeet(100, 0, 0, 6, 1)
print(aarde.x, aarde.y)`),
      step("Bereken de zwaartekracht", "De kracht wijst naar de ster en wordt sterker als de afstand kleiner is.", `def versnel(planeet, ster=(0, 0), G=50):
    dx = ster[0] - planeet.x
    dy = ster[1] - planeet.y
    afstand = (dx ** 2 + dy ** 2) ** 0.5
    kracht = G / (afstand ** 2 + 1)
    planeet.vx += kracht * dx / afstand
    planeet.vy += kracht * dy / afstand`),
      step("Laat de planeet bewegen", "Werk de positie bij en print de baan als tekst.", `for _ in range(200):
    versnel(aarde)
    aarde.x += aarde.vx
    aarde.y += aarde.vy
    print(round(aarde.x), round(aarde.y))`)
    ],
    ["Teken de baan met matplotlib.", "Voeg meerdere planeten met verschillende massa's toe."]
  ),
  idea(
    "dna-analyse",
    "DNA-analyse",
    "🧬",
    "Wetenschap",
    "Gemiddeld",
    "50 min",
    "Tel basen en zoek patronen in een DNA-string.",
    "Je analyseert een DNA-sequentie met tekstfuncties. Je leert strings, dictionaries en zoeken naar patronen.",
    ["strings", "dict", "count", "bio-informatica"],
    [
      step("Tel de basen", "Met count() tel je hoe vaak A, C, G en T voorkomen.", `dna = "ATGCGATACGCTTGA"
for base in "ACGT":
    print(base, dna.count(base))`),
      step("Zoek een patroon", "Met find() vind je de eerste positie van een stukje DNA.", `patroon = "GCTA"
positie = dna.find(patroon)

if positie >= 0:
    print(f"Gevonden op positie {positie}")
else:
    print("Niet gevonden")`),
      step("Bereken de GC-inhoud", "Het percentage G en C zegt iets over de stabiliteit van DNA.", `gc = dna.count("G") + dna.count("C")
percentage = gc / len(dna) * 100
print(f"GC-inhoud: {percentage:.1f}%")`)
    ],
    ["Lees een FASTA-bestand in.", "Zoek naar open reading frames met start- en stopcodons."]
  ),
  idea(
    "temperatuurgrafiek",
    "Temperatuurgrafiek",
    "🌡️",
    "Wetenschap",
    "Gemiddeld",
    "45 min",
    "Lees temperatuurmetingen in en maak een grafiek.",
    "Je leert data inlezen uit een lijst en visualiseren met matplotlib. Daarna bereken je gemiddelde en extremen.",
    ["matplotlib", "lists", "statistiek", "csv"],
    [
      step("Maak meetgegevens", "Begin met een lijst met dagen en temperaturen.", `dagen = list(range(1, 8))
temperaturen = [12, 14, 13, 16, 18, 17, 15]`),
      step("Teken de grafiek", "Matplotlib maakt van de lijsten een lijngrafiek.", `import matplotlib.pyplot as plt

plt.plot(dagen, temperaturen, marker="o")
plt.title("Temperatuur per dag")
plt.xlabel("Dag")
plt.ylabel("Graden Celsius")
plt.grid(True)
plt.show()`),
      step("Bereken het gemiddelde", "Gebruik sum() en len() voor het gemiddelde en print de extremen.", `gemiddelde = sum(temperaturen) / len(temperaturen)
print("Gemiddeld:", round(gemiddelde, 1))
print("Hoogste:", max(temperaturen))
print("Laagste:", min(temperaturen))`)
    ],
    ["Lees echte metingen uit een CSV-bestand.", "Voeg een tweede lijn toe voor een andere stad."]
  ),
  idea(
    "vallende-bal",
    "Vallende bal",
    "🎾",
    "Wetenschap",
    "Beginner",
    "35 min",
    "Simuleer een stuiterende bal met zwaartekracht.",
    "Je modelleert positie en snelheid in kleine stappen. Zo leer je hoe simulaties met een loop werken.",
    ["while", "float", "simulatie", "print"],
    [
      step("Start de simulatie", "De bal begint hoog met snelheid nul.", `hoogte = 100.0
snelheid = 0.0
zwaartekracht = -9.81
dt = 0.1`),
      step("Werk de beweging bij", "Elke stap verandert de snelheid en daarna de hoogte.", `for _ in range(50):
    snelheid += zwaartekracht * dt
    hoogte += snelheid * dt
    print(round(hoogte, 2))`),
      step("Laat de bal stuiteren", "Keer de snelheid om bij de grond en verlies een beetje energie.", `for _ in range(300):
    snelheid += zwaartekracht * dt
    hoogte += snelheid * dt

    if hoogte <= 0:
        hoogte = 0
        snelheid = -snelheid * 0.8

    if int(_) % 10 == 0:
        print(round(hoogte, 2))`)
    ],
    ["Maak een grafiek van de hoogte.", "Voeg luchtweerstand toe."]
  ),
  idea(
    "statistiek-tool",
    "Statistiek-tool",
    "📊",
    "Wetenschap",
    "Gemiddeld",
    "45 min",
    "Bereken gemiddelde, mediaan en spreiding.",
    "Je leest getallen in en berekent de belangrijkste statistieken. Je leert sorteren, dictionaries en formatteren.",
    ["statistiek", "sorted", "lists", "f-strings"],
    [
      step("Lees getallen in", "Gebruik split() om meerdere getallen in één keer te lezen.", `tekst = input("Getallen, gescheiden door komma's: ")
getallen = [float(deel) for deel in tekst.split(",")]
print(getallen)`),
      step("Bereken gemiddelde en mediaan", "Sorteer de lijst en pak het middelste element.", `gemiddelde = sum(getallen) / len(getallen)
gesorteerd = sorted(getallen)
midden = len(gesorteerd) // 2

if len(gesorteerd) % 2:
    mediaan = gesorteerd[midden]
else:
    mediaan = (gesorteerd[midden - 1] + gesorteerd[midden]) / 2

print("Gemiddelde:", gemiddelde)
print("Mediaan:", mediaan)`),
      step("Bereken de standaardafwijking", "De spreiding laat zien hoe ver de getallen van het gemiddelde liggen.", `variantie = sum((x - gemiddelde) ** 2 for x in getallen) / len(getallen)
standaardafwijking = variantie ** 0.5
print(f"Standaardafwijking: {standaardafwijking:.2f}")`)
    ],
    ["Voeg min, max en kwartielen toe.", "Lees de getallen uit een CSV-bestand."]
  ),
  idea(
    "sterrenkaart",
    "Sterrenkaart",
    "🌌",
    "Wetenschap",
    "Gemiddeld",
    "60 min",
    "Teken sterren op basis van helderheid en positie.",
    "Je maakt een eenvoudige sterrenkaart met matplotlib. Je leert scatterplots en het omzetten van coördinaten.",
    ["matplotlib", "scatter", "lists", "visualisatie"],
    [
      step("Maak stergegevens", "Elke ster heeft een x-, y- en helderheidswaarde.", `sterren = [
    (1, 2, 8), (3, 5, 4), (6, 1, 9), (8, 7, 3), (4, 4, 6),
]`),
      step("Teken de sterren", "Gebruik een scatterplot met de helderheid als grootte.", `import matplotlib.pyplot as plt

x = [ster[0] for ster in sterren]
y = [ster[1] for ster in sterren]
grootte = [ster[2] * 20 for ster in sterren]

plt.scatter(x, y, s=grootte, c="white")
plt.gca().set_facecolor("#0c0c1a")
plt.show()`),
      step("Maak het mooier", "Voeg een titel en een donkere achtergrond toe en verberg de assen.", `plt.style.use("dark_background")
plt.scatter(x, y, s=grootte, c="gold", alpha=0.9)
plt.title("Mijn sterrenkaart")
plt.axis("off")
plt.show()`)
    ],
    ["Lees echte sterrendata uit een CSV-bestand.", "Kleur sterren op basis van temperatuur."]
  ),
  idea(
    "chemie-tabel",
    "Periodiek systeem",
    "⚗️",
    "Wetenschap",
    "Gemiddeld",
    "60 min",
    "Zoek elementen op in een dictionary.",
    "Je bouwt een kleine chemie-tool met elementgegevens. Je leert dictionaries, invoer en formatteren.",
    ["dict", "input", "f-strings", "chemie"],
    [
      step("Maak een elementendatabase", "Koppel elk symbool aan naam en atoomnummer.", `elementen = {
    "H": ("Waterstof", 1),
    "He": ("Helium", 2),
    "O": ("Zuurstof", 8),
    "C": ("Koolstof", 6),
}`),
      step("Zoek een element", "Vraag om een symbool en toon de gegevens.", `symbool = input("Symbool: ").capitalize()

if symbool in elementen:
    naam, nummer = elementen[symbool]
    print(f"{naam} heeft atoomnummer {nummer}.")
else:
    print("Onbekend element.")`),
      step("Bereken de molaire massa", "Tel de atoommassa's van de elementen in een formule.", `massa = {"H": 1.008, "C": 12.011, "O": 15.999}

formule = "H2O"
totaal = 0

for deel in formule.split():
    pass

for symbool, aantal in [("H", 2), ("O", 1)]:
    totaal += massa[symbool] * aantal

print(f"Molaire massa van water: {totaal:.2f} g/mol")`)
    ],
    ["Breid de database uit met alle elementen.", "Parse een formule zoals C6H12O6 echt."]
  )
];

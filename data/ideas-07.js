// Deel 7: extra games, wetenschap, web, security en GUI.
import { idea, step } from "./helper.js";

export const IDEAS_PART_7 = [
  idea(
    "reactiespel",
    "Reactiespel",
    "⚡",
    "Games",
    "Beginner",
    "40 min",
    "Meet hoe snel je reageert op een kleurwissel.",
    "Je leert tijd meten en een eenvoudige GUI-besturing maken. Het spel wacht een willekeurige tijd en meet daarna jouw reactie.",
    ["tkinter", "time", "random", "events"],
    [
      step("Maak een wachtvenster", "Een groot label wordt later groen.", `import tkinter as tk

venster = tk.Tk()
venster.geometry("500x300")
label = tk.Label(venster, text="Wacht...", font=("Segoe UI", 28), bg="#e11d48", fg="white")
label.pack(fill="both", expand=True)`),
      step("Start na een willekeurige tijd", "after() voorkomt dat je precies kunt voorspellen wanneer het groen wordt.", `import random
import time

start = 0

def maak_groen():
    global start
    label.config(text="KLIK!", bg="#0f9d58")
    start = time.perf_counter()

venster.after(random.randint(1500, 4000), maak_groen)`),
      step("Meet de reactie", "Bereken het verschil tussen nu en de starttijd.", `def klik(event):
    if start == 0:
        label.config(text="Te vroeg!", bg="#e11d48")
        return
    ms = (time.perf_counter() - start) * 1000
    label.config(text=f"{ms:.0f} ms", bg="#1f5eff")

label.bind("<Button-1>", klik)`),
      step("Speel opnieuw", "Reset de starttijd en plan een nieuwe ronde.", `def opnieuw(event=None):
    global start
    start = 0
    label.config(text="Wacht...", bg="#e11d48")
    venster.after(random.randint(1500, 4000), maak_groen)

venster.bind("<space>", opnieuw)`),
    ],
    ["Test op een rustige computer; achtergrondtaken beïnvloeden de meting.", "Toon een duidelijke melding bij een te vroege klik."]
  ),
  idea(
    "yahtzee-lite",
    "Dobbelpuzzel",
    "🎲",
    "Games",
    "Beginner",
    "45 min",
    "Gooi vijf dobbelstenen en zoek de beste combinatie.",
    "Je leert lijsten tellen en combinaties herkennen. Je bouwt een kleine variant van yahtzee met vaste scores.",
    ["random", "lijsten", "tellen", "spel"],
    [
      step("Gooi de stenen", "Genereer vijf waarden tussen 1 en 6.", `import random

def gooi():
    return [random.randint(1, 6) for _ in range(5)]

stenen = gooi()
print(stenen)`),
      step("Bereken de score", "Tel dubbele waarden en kleine straten.", `from collections import Counter

def score(stenen):
    teller = Counter(stenen)
    if 5 in teller.values():
        return 50
    if 4 in teller.values():
        return 30
    if sorted(teller.values()) == [1, 1, 1, 2]:
        return 25
    if set(range(1, 6)).issubset(set(stenen)):
        return 20
    return sum(stenen)`),
      step("Laat de speler kiezen", "Eén worp per ronde houdt het simpel.", `for ronde in range(1, 4):
    stenen = gooi()
    print(f"Worp {ronde}: {stenen} - score {score(stenen)}")`),
      step("Bewaar de hoogste score", "Houd de beste worp bij.", `beste = 0
for _ in range(3):
    stenen = gooi()
    beste = max(beste, score(stenen))
print("Beste score:", beste)`),
    ],
    ["Test de combinaties met vaste dobbelsteenwaarden.", "Maak de regels zichtbaar voor de speler."]
  ),
  idea(
    "woordpuzzel",
    "Woordpuzzel",
    "🔤",
    "Games",
    "Gemiddeld",
    "60 min",
    "Raad een woord met letters op de juiste plek.",
    "Je leert strings vergelijken en feedback geven per letter. Je bouwt een Wordle-achtig spel in de terminal.",
    ["strings", "lussen", "feedback", "spel"],
    [
      step("Kies een geheim woord", "Gebruik een vaste lijst met woorden van vijf letters.", `import random

woorden = ["appel", "fiets", "school", "tafel", "water"]
geheim = random.choice(woorden)`),
      step("Geef feedback per letter", "Groen is goed op de juiste plek, geel bestaat maar staat elders.", `def feedback(gok, geheim):
    uitslag = []
    for index, letter in enumerate(gok):
        if letter == geheim[index]:
            uitslag.append("🟩")
        elif letter in geheim:
            uitslag.append("🟨")
        else:
            uitslag.append("⬜")
    return "".join(uitslag)`),
      step("Speel het spel", "Geef de speler zes pogingen.", `for poging in range(6):
    gok = input("Raad een woord van 5 letters: ").lower().strip()
    if len(gok) != 5:
        print("Gebruik precies 5 letters.")
        continue
    print(feedback(gok, geheim))
    if gok == geheim:
        print("Geraden!")
        break
else:
    print("Helaas, het woord was", geheim)`),
      step("Verbeter dubbele letters", "Tel eerst hoeveel keer een letter voorkomt voordat je geel geeft.", `# Houd een teller bij van resterende letters in het geheime woord.`),
    ],
    ["Test met woorden met dubbele letters.", "Gebruik alleen woorden uit een lijst die je zelf kent."]
  ),
  idea(
    "sokoban",
    "Sokoban",
    "📦",
    "Games",
    "Gevorderd",
    "2 uur",
    "Duw kisten naar de juiste plek in een doolhof.",
    "Je leert een raster als spelbord gebruiken en bewegingen valideren. Je bouwt een klein puzzelspel met vaste levels.",
    ["raster", "tekenen", "spellogica", "levels"],
    [
      step("Maak een level", "Een string met tekens is makkelijk aan te passen.", `level = [
    "#######",
    "#  .  #",
    "# $ $ #",
    "#  @  #",
    "#######",
]
# # muur, . doel, $ kist, @ speler`),
      step("Zoek de speler", "Bewaar de positie als rij en kolom.", `def vind_speler(bord):
    for y, rij in enumerate(bord):
        for x, teken in enumerate(rij):
            if teken == "@":
                return x, y
    return None`),
      step("Beweeg de speler", "Controleer muren en kisten voordat je verplaatst.", `def beweeg(bord, dx, dy):
    x, y = vind_speler(bord)
    nx, ny = x + dx, y + dy
    if bord[ny][nx] == "#":
        return bord
    if bord[ny][nx] == "$":
        kx, ky = nx + dx, ny + dy
        if bord[ky][kx] in "#$":
            return bord
        bord[ky] = bord[ky][:kx] + "$" + bord[ky][kx + 1:]
    bord[y] = bord[y][:x] + " " + bord[y][x + 1:]
    bord[ny] = bord[ny][:nx] + "@" + bord[ny][nx + 1:]
    return bord`),
      step("Controleer de winst", "Alle kisten moeten op een doel staan.", `def gewonnen(bord):
    for rij in bord:
        for teken in rij:
            if teken == "$":
                # Controleer of deze kist op een doel staat.
                pass
    return True`),
      step("Teken het bord", "Print het bord na elke zet.", `for rij in bord:
    print("".join(rij))`),
    ],
    ["Houd levels klein; grotere levels vragen meer logica.", "Test eerst met één kist."]
  ),
  idea(
    "spel-2048",
    "2048",
    "🔢",
    "Games",
    "Gevorderd",
    "2 uur",
    "Schuif getallen en maak vakjes van 2048.",
    "Je leert een lijst als raster gebruiken en rijen comprimeren. Je bouwt de kern van het bekende schuifspel.",
    ["raster", "lijsten", "spellogica", "getallen"],
    [
      step("Maak een bord", "Een 4x4-raster met nullen en twee startwaarden.", `import random

bord = [[0] * 4 for _ in range(4)]

def nieuw_vakje():
    leeg = [(y, x) for y in range(4) for x in range(4) if bord[y][x] == 0]
    if leeg:
        y, x = random.choice(leeg)
        bord[y][x] = 2`),
      step("Compress een rij", "Schuif nullen weg en voeg gelijke buren samen.", `def comprimeer(rij):
    waarden = [n for n in rij if n]
    uitkomst = []
    for n in waarden:
        if uitkomst and uitkomst[-1] == n:
            uitkomst[-1] *= 2
        else:
            uitkomst.append(n)
    return uitkomst + [0] * (4 - len(uitkomst))`),
      step("Schuif naar links", "Pas comprimeren toe op elke rij.", `def links():
    for y in range(4):
        bord[y] = comprimeer(bord[y])`),
      step("Draai het bord", "Met draaien kun je dezelfde functie voor alle richtingen gebruiken.", `def draai():
    global bord
    bord = [list(rij) for rij in zip(*bord[::-1])]`),
      step("Toon het bord", "Print het resultaat na elke zet.", `for rij in bord:
    print(rij)`),
    ],
    ["Test comprimeren los met vaste rijen.", "Voeg pas een nieuw vakje toe nadat een zet echt iets veranderde."]
  ),
  idea(
    "torens-van-hanoi",
    "Torens van Hanoi",
    "🗼",
    "Games",
    "Beginner",
    "40 min",
    "Verplaats een stapel schijven volgens de regels.",
    "Je leert recursie en het oplossen van een klassiek probleem. Je print elke zet en controleert daarna de oplossing.",
    ["recursie", "lijsten", "algoritme", "puzzel"],
    [
      step("Maak drie torens", "De eerste toren bevat alle schijven.", `torens = [list(range(4, 0, -1)), [], []]`),
      step("Controleer een zet", "Je mag alleen een kleinere schijf op een grotere leggen.", `def mag_verplaatsen(van, naar):
    if not torens[van]:
        return False
    if not torens[naar]:
        return True
    return torens[van][-1] < torens[naar][-1]`),
      step("Los recursief op", "Verplaats n-1 schijven, dan de grootste, dan weer n-1.", `def hanoi(n, van, naar, hulp):
    if n == 0:
        return
    hanoi(n - 1, van, hulp, naar)
    print(f"Verplaats schijf {n} van {van} naar {naar}")
    hanoi(n - 1, hulp, naar, van)

hanoi(4, 0, 2, 1)`),
      step("Tel de zetten", "Het minimum aantal zetten is 2^n - 1.", `print("Minimaal", 2 ** 4 - 1, "zetten")`),
    ],
    ["Teken de torens na elke zet om het algoritme te begrijpen.", "Begin met drie schijven."]
  ),
  idea(
    "ruimteschietspel",
    "Ruimteschietspel",
    "🚀",
    "Games",
    "Gemiddeld",
    "2 uur",
    "Beweeg een schip en schiet op vallende vijanden.",
    "Je leert pygame gebruiken: een game-loop, toetsenbord, botsingen en een score. Je bouwt een compact arcadespel.",
    ["pygame", "game-loop", "collisions", "score"],
    [
      step("Start pygame", "Maak een venster en een klok voor een vaste framerate.", `import pygame

pygame.init()
scherm = pygame.display.set_mode((640, 480))
klok = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    scherm.fill((10, 10, 18))
    pygame.display.flip()
    klok.tick(60)`),
      step("Beweeg het schip", "Lees de toetsen en houd het schip binnen het scherm.", `schip = pygame.Rect(300, 420, 40, 18)

toetsen = pygame.key.get_pressed()
if toetsen[pygame.K_LEFT]:
    schip.x -= 6
if toetsen[pygame.K_RIGHT]:
    schip.x += 6
schip.clamp_ip(scherm.get_rect())`),
      step("Schiet kogels", "Een lijst met rechthoeken houdt alle kogels bij.", `kogels = []

if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
    kogels.append(pygame.Rect(schip.centerx - 2, schip.y, 4, 12))

for kogel in kogels:
    kogel.y -= 10`),
      step("Laat vijanden vallen", "Beweeg vijanden en verwijder ze onderaan.", `vijanden = [pygame.Rect(100, 40, 30, 30), pygame.Rect(300, 40, 30, 30)]
for vijand in vijanden:
    vijand.y += 2`),
      step("Tel de score", "Verhoog de score bij een botsing.", `for kogel in kogels[:]:
    for vijand in vijanden[:]:
        if kogel.colliderect(vijand):
            kogels.remove(kogel)
            vijanden.remove(vijand)
            score += 1
            break`),
    ],
    ["Begin met één vijand en voeg daarna meer toe.", "Gebruik rects voor botsingen; dat is snel en eenvoudig."]
  ),
  idea(
    "katten-rennen",
    "Eindeloze renner",
    "🐈",
    "Games",
    "Gemiddeld",
    "90 min",
    "Laat een kat springen over obstakels.",
    "Je leert zwaartekracht simuleren met een verticale snelheid. Je bouwt een eindeloze renner met een score en herstart.",
    ["pygame", "zwaartekracht", "obstakels", "score"],
    [
      step("Maak de speler", "Een rechthoek met een y-snelheid is genoeg.", `import pygame

pygame.init()
scherm = pygame.display.set_mode((800, 300))
klok = pygame.time.Clock()

kat = pygame.Rect(100, 220, 40, 40)
snelheid_y = 0
OP_DE_GROND = 220`),
      step("Voeg zwaartekracht toe", "De speler valt tot hij de grond raakt.", `ZWAARTEKRACHT = 0.8

snelheid_y += ZWAARTEKRACHT

def spring():
    global snelheid_y
    if kat.y >= OP_DE_GROND:
        snelheid_y = -14`),
      step("Beweeg de kat", "Werk de positie bij en stop op de grond.", `kat.y += snelheid_y
if kat.y > OP_DE_GROND:
    kat.y = OP_DE_GROND
    snelheid_y = 0`),
      step("Laat obstakels komen", "Beweeg een blok naar links en reset het voorbij de rand.", `obstakel = pygame.Rect(800, 240, 28, 40)
obstakel.x -= 6
if obstakel.right < 0:
    obstakel.x = 800`),
      step("Tel de score en herstart", "Stop bij een botsing en toon de score.", `score += 1
if kat.colliderect(obstakel):
    print("Game over, score:", score)`),
    ],
    ["Test de spronghoogte los van de obstakels.", "Houd de zwaartekracht en sprongkracht als constanten."]
  ),
  idea(
    "zwaartekracht-simulatie",
    "Zwaartekracht-simulatie",
    "🪐",
    "Wetenschap",
    "Gemiddeld",
    "75 min",
    "Simuleer vallende objecten met echte natuurkunde.",
    "Je leert snelheid en versnelling integreren. Je vergelijkt een simulatie met de formule voor vrije val.",
    ["natuurkunde", "simulatie", "snelheid", "grafiek"],
    [
      step("Stel de beginwaarden in", "Hoogte, snelheid en tijd beginnen bij nul.", `hoogte = 100.0
snelheid = 0.0
tijd = 0.0
G = 9.81
dt = 0.05`),
      step("Simuleer de val", "Versnel en werk de positie bij.", `hoogtepunten = []

while hoogte > 0:
    snelheid += G * dt
    hoogte -= snelheid * dt
    tijd += dt
    hoogtepunten.append((tijd, max(0, hoogte)))`),
      step("Vergelijk met de formule", "De theoretische valtijd is wortel van 2h/g.", `import math

theorie = math.sqrt(2 * 100 / G)
print(f"Simulatie: {tijd:.2f} s, theorie: {theorie:.2f} s")`),
      step("Maak een grafiek", "Print een eenvoudige tekstgrafiek of gebruik matplotlib.", `for t, h in hoogtepunten[::20]:
    print(f"{t:4.1f}s " + "#" * int(h // 5))`),
    ],
    ["Kleinere tijdstappen geven een nauwkeuriger resultaat.", "Vergelijk altijd met een handmatige berekening."]
  ),
  idea(
    "plantengroei",
    "Plantengroei simuleren",
    "🌱",
    "Wetenschap",
    "Gemiddeld",
    "70 min",
    "Modelleer hoe een plant groeit met licht en water.",
    "Je leert exponentiële groei en beperkende factoren. Je bouwt een model waarin te weinig water of licht de groei stopt.",
    ["simulatie", "wiskunde", "modellen", "grafiek"],
    [
      step("Kies de groeivoet", "Een plant groeit sneller als er meer bladeren zijn.", `groei = 0.08
lengte = 5.0
water = 1.0
licht = 1.0`),
      step("Simuleer per dag", "Beperk de groei door de kleinste factor.", `for dag in range(1, 31):
    factor = min(water, licht)
    lengte += lengte * groei * factor
    water -= 0.02
    licht -= 0.01
    print(f"Dag {dag}: {lengte:.1f} cm")`),
      step("Voeg een maximum toe", "Planten groeien niet eindeloos.", `MAXIMUM = 120
lengte = min(MAXIMUM, lengte + lengte * groei * factor)`),
      step("Vergelijk omstandigheden", "Test weinig water versus veel licht.", `# Herhaal de simulatie met water = 0.3 en vergelijk de eindlengte.`),
    ],
    ["Noteer je aannames.", "Gebruik een grafiek om de groei over tijd te zien."]
  ),
  idea(
    "exoplaneet-transit",
    "Exoplaneet-transit",
    "🌑",
    "Wetenschap",
    "Gevorderd",
    "2 uur",
    "Simuleer een dip in het licht van een ster.",
    "Je leert hoe astronomen planeten vinden door helderheidsdips. Je bouwt een lichtcurve met een periodieke transit.",
    ["astronomie", "lichtcurve", "wiskunde", "data"],
    [
      step("Modelleer de ster", "De helderheid is bijna constant.", `basis = 1.0
helderheid = []`),
      step("Voeg een transit toe", "Als de planeet voor de ster langs gaat, daalt de helderheid.", `for minuut in range(0, 600):
    dip = 0.02 if 240 < minuut < 260 else 0.0
    helderheid.append(basis - dip)`),
      step("Maak een lichtcurve", "Print de waarden als een grafiek in de terminal.", `for minuut in range(0, 600, 10):
    waarde = helderheid[minuut]
    balk = "#" * int(waarde * 40)
    print(f"{minuut:3d} {balk}")`),
      step("Bereken de periode", "Herhaal de dip en meet de afstand tussen twee dips.", `dips = [i for i, w in enumerate(helderheid) if w < 0.99]
print("Eerste dip op minuut", dips[0])`),
    ],
    ["Een echte transit is veel kleiner; dit is een vereenvoudigd model.", "Voeg ruis toe om realistische data na te bootsen."]
  ),
  idea(
    "ph-simulator",
    "pH-simulator",
    "🧪",
    "Wetenschap",
    "Gemiddeld",
    "60 min",
    "Bereken de pH van een oplossing en toon de kleur.",
    "Je leert de pH-schaal en het verband met waterstofionen. Je maakt een eenvoudige indicator met kleuren per bereik.",
    ["chemie", "wiskunde", "logaritme", "kleuren"],
    [
      step("Bereken de pH", "pH is het negatieve logaritme van de concentratie H+.", `import math

def ph(concentratie):
    if concentratie <= 0:
        raise ValueError("Concentratie moet positief zijn")
    return -math.log10(concentratie)`),
      step("Kies een kleur", "Elk pH-bereik krijgt een eigen kleur.", `def kleur(pH):
    if pH < 3:
        return "rood"
    if pH < 7:
        return "oranje"
    if pH == 7:
        return "groen"
    if pH < 11:
        return "blauw"
    return "paars"`),
      step("Test bekende waarden", "Maagzuur, water en zeep hebben verschillende pH's.", `for naam, waarde in [("maagzuur", 0.01), ("water", 1e-7), ("zeep", 0.001)]:
    print(naam, round(ph(waarde), 1), kleur(ph(waarde)))`),
      step("Maak een schaal", "Toon de volledige pH-schaal van 0 tot 14.", `for waarde in range(15):
    print(waarde, kleur(waarde))`),
    ],
    ["Gebruik alleen veilige, verzonnen concentraties.", "pH is temperatuur-afhankelijk; vermeld je aannames."]
  ),
  idea(
    "projectielbaan",
    "Projectielbaan",
    "🏹",
    "Wetenschap",
    "Gemiddeld",
    "75 min",
    "Bereken waar een bal landt bij een schuine worp.",
    "Je leert ontbinden in x- en y-richting. Je simuleert de baan en vergelijkt met de analytische formule.",
    ["natuurkunde", "sinus", "cosinus", "simulatie"],
    [
      step("Stel de beginsnelheid in", "Splits de snelheid in horizontaal en verticaal.", `import math

v0 = 20
hoek = math.radians(45)
vx = v0 * math.cos(hoek)
vy = v0 * math.sin(hoek)
G = 9.81`),
      step("Simuleer de baan", "De horizontale snelheid blijft gelijk; de verticale verandert.", `x, y = 0.0, 0.0
dt = 0.01
punten = []

while y >= 0:
    x += vx * dt
    vy -= G * dt
    y += vy * dt
    punten.append((x, y))`),
      step("Vergelijk met de formule", "De theoretische afstand is v² sin(2θ) / g.", `bereik = v0 ** 2 * math.sin(2 * hoek) / G
print(f"Simulatie: {x:.1f} m, formule: {bereik:.1f} m")`),
      step("Maak een baan", "Print de baan als tekstgrafiek.", `for px, py in punten[::50]:
    print(f"{px:5.1f} " + " " * int(py) + "*")`),
    ],
    ["Laat wrijving weg in de eerste versie en vermeld dat.", "Test met een hoek van 45 graden voor het maximale bereik."]
  ),
  idea(
    "ecosysteem",
    "Ecosysteem simuleren",
    "🦊",
    "Wetenschap",
    "Gevorderd",
    "2 uur",
    "Simuleer prooien en roofdieren in een eenvoudig ecosysteem.",
    "Je leert differentievergelijkingen en terugkoppeling. Je ziet hoe populaties oscilleren en soms uitsterven.",
    ["simulatie", "populaties", "wiskunde", "modellen"],
    [
      step("Kies de parameters", "Prooien groeien; roofdieren eten prooien.", `prooien = 40
roofdieren = 9
alpha = 0.1
beta = 0.01
delta = 0.005
gamma = 0.1`),
      step("Werk één stap bij", "De Lotka-Volterra-vergelijkingen beschrijven de verandering.", `for dag in range(200):
    groei_prooi = alpha * prooien - beta * prooien * roofdieren
    groei_roof = delta * prooien * roofdieren - gamma * roofdieren
    prooien += groei_prooi
    roofdieren += groei_roof
    if dag % 20 == 0:
        print(dag, round(prooien, 1), round(roofdieren, 1))`),
      step("Voeg een ondergrens toe", "Populaties kunnen niet negatief worden.", `prooien = max(0.0, prooien)
roofdieren = max(0.0, roofdieren)`),
      step("Test een andere startwaarde", "Kleine veranderingen kunnen grote gevolgen hebben.", `# Probeer prooien = 10 en roofdieren = 20.`),
    ],
    ["Dit model is een vereenvoudiging; echte ecosystemen zijn complexer.", "Plot de populaties om oscillaties te zien."]
  ),
  idea(
    "molecuulmassa",
    "Molecuulmassa berekenen",
    "⚗️",
    "Wetenschap",
    "Beginner",
    "45 min",
    "Bereken de massa van een molecuul uit een formule.",
    "Je leert een dictionary met atoommassa's en een eenvoudige parser. Je berekent de molaire massa van bekende stoffen.",
    ["chemie", "dict", "parsen", "rekenen"],
    [
      step("Maak een atoomtabel", "De waarden zijn afgeronde atoommassa's.", `massa = {
    "H": 1.008, "C": 12.011, "N": 14.007, "O": 15.999,
    "Na": 22.990, "Cl": 35.45, "Ca": 40.078,
}`),
      step("Lees een formule", "Ondersteun letters en kleine getallen.", `import re

def parse(formule):
    return re.findall(r"([A-Z][a-z]?)(\\d*)", formule)`),
      step("Bereken de massa", "Vermenigvuldig elk atoom met zijn aantal.", `def molecuulmassa(formule):
    totaal = 0.0
    for atoom, aantal in parse(formule):
        totaal += massa[atoom] * int(aantal or 1)
    return totaal

print(molecuulmassa("H2O"))`),
      step("Test meerdere stoffen", "Controleer of de uitkomsten kloppen.", `for formule in ["H2O", "CO2", "NaCl", "C6H12O6"]:
    print(formule, round(molecuulmassa(formule), 2))`),
    ],
    ["Gebruik haakjes in formules pas als je parser ze ondersteunt.", "Controleer je atoommassa's met een betrouwbare tabel."]
  ),
  idea(
    "warmteverspreiding",
    "Warmteverspreiding",
    "🌡️",
    "Wetenschap",
    "Gevorderd",
    "2 uur",
    "Simuleer hoe warmte zich verspreidt door een plaat.",
    "Je leert een raster bijwerken met de warmtevergelijking. Je ziet hoe warmte van hete naar koude plekken stroomt.",
    ["simulatie", "raster", "warmte", "wiskunde"],
    [
      step("Maak een raster", "Een lijst met rijen bevat temperaturen.", `BREEDTE, HOOGTE = 30, 20
raster = [[0.0 for _ in range(BREEDTE)] for _ in range(HOOGTE)]
raster[10][10] = 100.0`),
      step("Werk één stap bij", "Elke cel wordt het gemiddelde van zijn buren.", `def stap(raster):
    nieuw = [rij[:] for rij in raster]
    for y in range(1, HOOGTE - 1):
        for x in range(1, BREEDTE - 1):
            nieuw[y][x] = (
                raster[y - 1][x] + raster[y + 1][x] +
                raster[y][x - 1] + raster[y][x + 1]
            ) / 4
    return nieuw`),
      step("Herhaal en toon", "Na veel stappen is de warmte verdeeld.", `for _ in range(50):
    raster = stap(raster)

for rij in raster[::2]:
    print("".join("#" if cel > 20 else "+" if cel > 5 else "." for cel in rij))`),
      step("Voeg een warmtebron toe", "Houd één cel op een vaste temperatuur.", `raster[10][10] = 100.0`),
    ],
    ["Dit is een diffusiemodel, geen volledige warmteberekening.", "Kleinere rasters zijn sneller om te testen."]
  ),
  idea(
    "nieuwsbrief-aanmelding",
    "Nieuwsbrief-aanmelding",
    "📨",
    "Web",
    "Beginner",
    "50 min",
    "Verzamel e-mailadressen via een Flask-formulier.",
    "Je leert formulieren verwerken, invoer controleren en aanmeldingen opslaan. Je schrijft alleen geldige adressen naar een bestand.",
    ["flask", "forms", "validatie", "bestanden"],
    [
      step("Toon het formulier", "Een eenvoudig formulier met een e-mailveld.", `from flask import Flask

app = Flask(__name__)

@app.get("/")
def home():
    return """
      <h1>Nieuwsbrief</h1>
      <form method="post">
        <input type="email" name="email" required>
        <button>Aanmelden</button>
      </form>
    """`),
      step("Controleer het adres", "Een simpele controle op een apenstaart en een punt.", `def geldig(email):
    return "@" in email and "." in email.split("@")[-1]`),
      step("Sla de aanmelding op", "Voorkom dubbele adressen.", `from pathlib import Path

BESTAND = Path("aanmeldingen.txt")

@app.post("/")
def aanmelden():
    email = request.form.get("email", "").strip().lower()
    if not geldig(email):
        return "Ongeldig e-mailadres", 400

    bekend = BESTAND.read_text(encoding="utf-8").splitlines() if BESTAND.exists() else []
    if email not in bekend:
        with BESTAND.open("a", encoding="utf-8") as bestand:
            bestand.write(email + "\\n")

    return "Bedankt voor je aanmelding!"`),
      step("Toon het aantal aanmeldingen", "Een beheerroute geeft inzicht.", `@app.get("/aantal")
def aantal():
    regels = BESTAND.read_text(encoding="utf-8").splitlines() if BESTAND.exists() else []
    return f"Aantal aanmeldingen: {len(regels)}"`),
    ],
    ["Verstuur geen echte nieuwsbrief zonder toestemming.", "Gebruik voor productie een database en dubbele opt-in."]
  ),
  idea(
    "flask-favorieten",
    "Favorieten bewaren",
    "⭐",
    "Web",
    "Gemiddeld",
    "70 min",
    "Laat bezoekers favorieten opslaan in een cookie.",
    "Je leert een lijst in een sessie bewaren en toggle-knoppen maken. Je begrijpt dat een cookie per browser geldt.",
    ["flask", "sessies", "cookies", "lijsten"],
    [
      step("Maak een itemlijst", "Een paar voorbeelditems met een id.", `items = {
    "python": "Python leren",
    "flask": "Een webapp bouwen",
    "snake": "Snake maken",
}`),
      step("Toon de items", "Elk item krijgt een knop om te favorieten.", `from flask import session

@app.get("/")
def home():
    favorieten = session.get("favorieten", [])
    regels = []
    for sleutel, titel in items.items():
        label = "★" if sleutel in favorieten else "☆"
        regels.append(f'<li>{titel} <a href="/toggle/{sleutel}">{label}</a></li>')
    return "<h1>Items</h1><ul>" + "".join(regels) + "</ul>"`),
      step("Wissel de favoriet", "Voeg toe of verwijder uit de sessielijst.", `@app.get("/toggle/<sleutel>")
def toggle(sleutel):
    if sleutel not in items:
        return "Onbekend item", 404

    favorieten = session.get("favorieten", [])
    if sleutel in favorieten:
        favorieten.remove(sleutel)
    else:
        favorieten.append(sleutel)
    session["favorieten"] = favorieten
    return redirect("/")`),
      step("Toon alleen favorieten", "Een filterroute maakt de lijst bruikbaar.", `@app.get("/favorieten")
def alleen_favorieten():
    favorieten = session.get("favorieten", [])
    return "<br>".join(items[s] for s in favorieten) or "Nog geen favorieten."`),
    ],
    ["Sessies verdwijnen als de browser cookies wist.", "Bewaar geen gevoelige gegevens in een cookie."]
  ),
  idea(
    "sitemap-generator",
    "Sitemap maken",
    "🗺️",
    "Web",
    "Gemiddeld",
    "60 min",
    "Genereer een sitemap.xml voor je website.",
    "Je leert XML opbouwen en URL's netjes escapen. Zoekmachines gebruiken een sitemap om je pagina's te vinden.",
    ["xml", "urls", "bestanden", "seo"],
    [
      step("Verzamel je pagina's", "Een lijst met paden is genoeg.", `paden = ["/", "/over", "/projecten", "/contact"]`),
      step("Bouw de XML", "Elke URL krijgt een loc en een prioriteit.", `basis = "https://example.com"

regels = ['<?xml version="1.0" encoding="UTF-8"?>']
regels.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

for pad in paden:
    regels.append(f"  <url><loc>{basis}{pad}</loc></url>")

regels.append("</urlset>")`),
      step("Schrijf het bestand", "Sla de sitemap op in je webmap.", `from pathlib import Path

Path("sitemap.xml").write_text("\\n".join(regels), encoding="utf-8")`),
      step("Valideer de XML", "Gebruik een parser om te controleren of het bestand klopt.", `import xml.etree.ElementTree as ET

ET.parse("sitemap.xml")
print("De sitemap is geldige XML.")`),
    ],
    ["Gebruik volledige URL's met https.", "Verwijs alleen naar pagina's die echt bestaan."]
  ),
  idea(
    "webhook-ontvanger",
    "Webhook-ontvanger",
    "🔔",
    "Web",
    "Gevorderd",
    "90 min",
    "Ontvang JSON-berichten van een andere dienst.",
    "Je leert POST-verzoeken zonder formulier verwerken en een gedeeld geheim controleren. Je logt alleen wat nodig is.",
    ["flask", "json", "webhooks", "beveiliging"],
    [
      step("Maak een endpoint", "Accepteer alleen POST met JSON.", `from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/webhook")
def webhook():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"fout": "geen JSON"}), 400
    return jsonify({"ontvangen": True}), 200`),
      step("Controleer een geheim", "Een gedeeld token in de header voorkomt misbruik.", `import os

GEHEIM = os.environ.get("WEBHOOK_SECRET", "verander-mij")

@app.post("/webhook")
def webhook():
    if request.headers.get("X-Webhook-Secret") != GEHEIM:
        return jsonify({"fout": "niet toegestaan"}), 401
    data = request.get_json(silent=True) or {}
    return jsonify({"ontvangen": True})`),
      step("Log het bericht", "Schrijf een paar veilige velden naar een logbestand.", `import json
from pathlib import Path

with Path("webhooks.log").open("a", encoding="utf-8") as log:
    log.write(json.dumps(data, ensure_ascii=False) + "\\n")`),
      step("Test lokaal", "Gebruik curl of fetch om een bericht te sturen.", `# curl -X POST http://localhost:5000/webhook \
#   -H "Content-Type: application/json" \
#   -H "X-Webhook-Secret: verander-mij" \
#   -d '{"event":"test"}'`),
    ],
    ["Gebruik een lange, willekeurige secret uit je omgeving.", "Log geen wachtwoorden of persoonlijke gegevens."]
  ),
  idea(
    "csv-upload",
    "CSV uploaden",
    "📤",
    "Web",
    "Gemiddeld",
    "75 min",
    "Laat een gebruiker een CSV uploaden en toon een samenvatting.",
    "Je leert bestanduploads veilig verwerken en CSV parsen. Je toont alleen een voorbeeld en slaat het bestand tijdelijk op.",
    ["flask", "csv", "upload", "validatie"],
    [
      step("Maak een uploadformulier", "Gebruik multipart en beperk de bestandstypes.", `@app.get("/")
def home():
    return """
      <form method="post" enctype="multipart/form-data">
        <input type="file" name="bestand" accept=".csv" required>
        <button>Uploaden</button>
      </form>
    """`),
      step("Lees de CSV", "Decodeer als utf-8 en gebruik DictReader.", `import csv
import io

@app.post("/")
def upload():
    bestand = request.files.get("bestand")
    if not bestand or not bestand.filename.endswith(".csv"):
        return "Upload een CSV-bestand", 400

    tekst = bestand.read().decode("utf-8")
    rijen = list(csv.DictReader(io.StringIO(tekst)))
    return f"<p>{len(rijen)} rijen gevonden.</p>"`),
      step("Toon een voorbeeld", "Laat de eerste regels zien in een tabel.", `koppen = list(rijen[0].keys()) if rijen else []
thead = "".join(f"<th>{kop}</th>" for kop in koppen)
body = "".join(
    "<tr>" + "".join(f"<td>{rij[kop]}</td>" for kop in koppen) + "</tr>"
    for rij in rijen[:5]
)
return f"<table><tr>{thead}</tr>{body}</table>"`),
      step("Beperk de grootte", "Voorkom dat iemand een enorm bestand uploadt.", `app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024`),
    ],
    ["Escape celwaarden voordat je ze in HTML zet.", "Bewaar uploads niet permanent zonder opschoning."]
  ),
  idea(
    "eigen-404",
    "Eigen foutpagina's",
    "🚧",
    "Web",
    "Beginner",
    "40 min",
    "Maak vriendelijke 404- en 500-pagina's.",
    "Je leert foutafhandeling in Flask en het verschil tussen een foutpagina en een crash. Je houdt de site bruikbaar als er iets misgaat.",
    ["flask", "errors", "templates", "statuscodes"],
    [
      step("Maak een 404-pagina", "Registreer een handler voor not found.", `from flask import Flask, render_template

app = Flask(__name__)

@app.errorhandler(404)
def niet_gevonden(fout):
    return render_template("404.html"), 404`),
      step("Maak de template", "Een korte uitleg en een link terug naar huis.", `<!-- templates/404.html -->
<h1>Deze pagina bestaat niet</h1>
<p>Controleer de link of ga terug naar de homepage.</p>
<a href="/">Terug naar home</a>`),
      step("Vang serverfouten op", "Toon nooit interne foutdetails aan bezoekers.", `@app.errorhandler(500)
def serverfout(fout):
    return render_template("500.html"), 500`),
      step("Test de routes", "Vraag een onbekend pad op en controleer de statuscode.", `# Open http://localhost:5000/bestaat-niet
# De browser toont de 404-pagina.`),
    ],
    ["Log fouten server-side, maar toon ze niet aan de gebruiker.", "Test ook een route die bewust een fout veroorzaakt."]
  ),
  idea(
    "veilige-bestandsnaam",
    "Veilige bestandsnamen",
    "🛡️",
    "Security",
    "Beginner",
    "45 min",
    "Maak gebruikersinvoer veilig voor bestandsnamen.",
    "Je leert path traversal herkennen en bestandsnamen opschonen. Je voorkomt dat iemand met ../ bij systeembestanden komt.",
    ["pathlib", "strings", "security", "validatie"],
    [
      step("Zie het gevaar", "Een naam met .. kan buiten de bedoelde map wijzen.", `from pathlib import Path

basis = Path("uploads")
gevaarlijk = "../../secret.txt"
print((basis / gevaarlijk).resolve())`),
      step("Schoon de naam op", "Behoud alleen letters, cijfers, punt, streep en underscore.", `import re

def veilige_naam(naam):
    naam = Path(naam).name
    naam = re.sub(r"[^A-Za-z0-9._-]", "_", naam)
    return naam or "bestand"`),
      step("Controleer de eindmap", "De opgeloste locatie moet binnen de uploadmap blijven.", `def veilig_pad(naam):
    doel = (basis / veilige_naam(naam)).resolve()
    if basis.resolve() not in doel.parents:
        raise ValueError("Pad buiten de uploadmap")
    return doel`),
      step("Test aanvallen", "Probeer paden met .. en met schuine strepen.", `for naam in ["foto.jpg", "../../etc/passwd", "C:\\\\Windows\\\\win.ini"]:
    print(naam, "->", veilig_pad(naam))`),
    ],
    ["Gebruik nooit de originele bestandsnaam zonder controle.", "Test op Windows en Linux als je beide ondersteunt."]
  ),
  idea(
    "log-maskeren",
    "Gevoelige data maskeren",
    "🕶️",
    "Security",
    "Gemiddeld",
    "60 min",
    "Verwijder e-mailadressen en tokens uit logregels.",
    "Je leert regex gebruiken om gevoelige gegevens te herkennen. Je maakt logbestanden deelbaar zonder privégegevens weg te geven.",
    ["regex", "privacy", "loggen", "security"],
    [
      step("Maak testregels", "Gebruik verzonnen gegevens.", `regels = [
    "login user=sam@example.com token=abc123",
    "mail naar noa@example.org",
    "ip=192.168.1.5 status=ok",
]`),
      step("Maskeer e-mailadressen", "Vervang het deel voor de apenstaart.", `import re

def maskeer_email(tekst):
    return re.sub(r"[\\w.+-]+@[\\w.-]+", "[email]", tekst)`),
      step("Maskeer tokens", "Vervang waarden achter token= of password=.", `def maskeer_geheimen(tekst):
    tekst = re.sub(r"(token|password|secret)=\\S+", r"\\1=[verborgen]", tekst, flags=re.I)
    return tekst`),
      step("Verwerk het log", "Pas beide filters toe en schrijf een schoner bestand.", `from pathlib import Path

schoon = [maskeer_geheimen(maskeer_email(regel)) for regel in regels]
Path("log-schoon.txt").write_text("\\n".join(schoon), encoding="utf-8")`),
      step("Controleer het resultaat", "Zoek naar apenstaarten en tokenwaarden.", `for regel in schoon:
    print(regel)
    assert "@" not in regel or "[email]" in regel`),
    ],
    ["Test je regex op valse positieven.", "Verwijder logs met geheimen liever helemaal."]
  ),
  idea(
    "hash-kraken",
    "Hash kraken (demo)",
    "🔓",
    "Security",
    "Gemiddeld",
    "70 min",
    "Laat zien waarom korte wachtwoorden onveilig zijn.",
    "Je leert een woordenlijstaanval op een hash simuleren. Je gebruikt alleen zelfgemaakte hashes en verzonnen wachtwoorden.",
    ["hashlib", "woordenlijst", "security", "demo"],
    [
      step("Maak een doelhash", "Hash een zwak testwachtwoord.", `import hashlib

doel = hashlib.sha256("appel".encode()).hexdigest()
print(doel)`),
      step("Probeer woorden", "Hash elk woord uit een kleine lijst en vergelijk.", `woorden = ["appel", "banaan", "peer", "wachtwoord", "123456"]

for woord in woorden:
    if hashlib.sha256(woord.encode()).hexdigest() == doel:
        print("Gevonden:", woord)
        break`),
      step("Voeg cijfers toe", "Echte aanvallers proberen ook varianten.", `for woord in woorden:
    for cijfer in range(100):
        kandidaat = f"{woord}{cijfer}"
        if hashlib.sha256(kandidaat.encode()).hexdigest() == doel:
            print("Gevonden:", kandidaat)`),
      step("Trek de les", "Lange wachtwoorden en een salt maken dit veel moeilijker.", `print("Gebruik een wachtwoordmanager en unieke wachtwoorden.")`),
    ],
    ["Kraak alleen je eigen testhashes.", "Gebruik geen echte wachtwoorden of hashes van anderen."]
  ),
  idea(
    "twee-factor-demo",
    "Twee-factor demo",
    "📱",
    "Security",
    "Gevorderd",
    "2 uur",
    "Simuleer een tijdelijke code met HMAC.",
    "Je leert hoe tijdgebaseerde codes werken: een geheim plus de tijd, gehasht met HMAC. Je vergelijkt codes veilig met compare_digest.",
    ["hmac", "tijd", "security", "codes"],
    [
      step("Maak een geheim", "De sleutel blijft op de server en in de authenticator-app.", `import secrets

geheim = secrets.token_bytes(16)
print(geheim.hex())`),
      step("Bereken een code", "Gebruik een tijdvak van 30 seconden.", `import hmac
import hashlib
import struct
import time

def code(geheim, tijdvak=30):
    teller = int(time.time()) // tijdvak
    data = struct.pack(">Q", teller)
    digest = hmac.new(geheim, data, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    waarde = struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return f"{waarde % 1_000_000:06d}"`),
      step("Controleer de code", "Vergelijk in constante tijd en accepteer één tijdvak speling.", `def geldig(geheim, ingevoerd, speling=1):
    teller = int(time.time()) // 30
    for offset in range(-speling, speling + 1):
        data = struct.pack(">Q", teller + offset)
        digest = hmac.new(geheim, data, hashlib.sha1).digest()
        index = digest[-1] & 0x0F
        waarde = struct.unpack(">I", digest[index:index + 4])[0] & 0x7FFFFFFF
        if hmac.compare_digest(f"{waarde % 1_000_000:06d}", ingevoerd):
            return True
    return False`),
      step("Test de demo", "Print de code en controleer hem direct.", `huidig = code(geheim)
print("Code:", huidig)
print("Geldig:", geldig(geheim, huidig))`),
    ],
    ["Dit is een leerproject; gebruik in productie een bewezen TOTP-bibliotheek.", "Toon het geheim nooit in een log."]
  ),
  idea(
    "kleurenkiezer",
    "Kleurenkiezer",
    "🌈",
    "GUI",
    "Beginner",
    "40 min",
    "Kies een kleur en kopieer de hexcode.",
    "Je leert kleuren mengen met schuifjes en hexcodes maken. Je bouwt een handig hulpmiddel voor webdesign.",
    ["tkinter", "rgb", "hex", "schuifjes"],
    [
      step("Maak drie schuifjes", "Rood, groen en blauw lopen van 0 tot 255.", `import tkinter as tk

venster = tk.Tk()
waarden = {"r": tk.IntVar(value=31), "g": tk.IntVar(value=94), "b": tk.IntVar(value=255)}

for naam, variabele in waarden.items():
    tk.Scale(venster, from_=0, to=255, orient="horizontal", variable=variabele,
             label=naam.upper()).pack(fill="x")`),
      step("Toon de kleur", "Een label met een achtergrondkleur laat het resultaat zien.", `voorbeeld = tk.Label(venster, text="Kleur", bg="#1f5eff", fg="white", height=4)
voorbeeld.pack(fill="x")`),
      step("Werk de hexcode bij", "Maak een hexcode en toon die.", `def hexcode():
    return "#{:02x}{:02x}{:02x}".format(waarden["r"].get(), waarden["g"].get(), waarden["b"].get())

code = tk.Label(venster, text="#1f5eff", font=("Consolas", 16))
code.pack()

def update(*_):
    kleur = hexcode()
    voorbeeld.config(bg=kleur)
    code.config(text=kleur)
    venster.after(50, update)

update()`),
      step("Kopieer de code", "Een knop zet de hexcode op het klembord.", `def kopieer():
    venster.clipboard_clear()
    venster.clipboard_append(hexcode())

tk.Button(venster, text="Kopieer hexcode", command=kopieer).pack(pady=8)`),
    ],
    ["Test de kleur op een witte en een donkere achtergrond.", "Controleer het contrast voordat je de kleur gebruikt."]
  ),
  idea(
    "stopwatch-gui",
    "Stopwatch",
    "⏱️",
    "GUI",
    "Beginner",
    "45 min",
    "Bouw een stopwatch met start, stop en reset.",
    "Je leert tijd opslaan en een label elke 100 milliseconden verversen. Je oefent met knoppen en eenvoudige state.",
    ["tkinter", "tijd", "after", "knoppen"],
    [
      step("Maak het scherm", "Een groot label toont de tijd.", `import tkinter as tk

venster = tk.Tk()
venster.title("Stopwatch")
label = tk.Label(venster, text="00:00.0", font=("Consolas", 40))
label.pack(padx=30, pady=20)`),
      step("Start de timer", "Bewaar de starttijd en een vlag.", `import time

start = 0.0
loopt = False

def start_timer():
    global start, loopt
    if not loopt:
        start = time.perf_counter()
        loopt = True
        update()`),
      step("Werk de weergave bij", "Bereken de verstreken tijd elke 100 ms.", `def update():
    if loopt:
        verstreken = time.perf_counter() - start
        label.config(text=f"{verstreken:05.1f}")
        venster.after(100, update)`),
      step("Stop en reset", "Stop de lus en zet de tijd terug.", `def stop():
    global loopt
    loopt = False

def reset():
    global loopt
    loopt = False
    label.config(text="00:00.0")

tk.Button(venster, text="Start", command=start_timer).pack(side="left")
tk.Button(venster, text="Stop", command=stop).pack(side="left")
tk.Button(venster, text="Reset", command=reset).pack(side="left")`),
    ],
    ["Test de stopwatch na een minuut.", "Gebruik perf_counter voor korte metingen."]
  ),
  idea(
    "mp3-speler",
    "Muziekspeler",
    "🎧",
    "GUI",
    "Gemiddeld",
    "90 min",
    "Speel een lokaal muziekbestand af met knoppen.",
    "Je leert pygame.mixer gebruiken en een bestandsdialoog openen. Je bouwt een eenvoudige speler voor je eigen muziek.",
    ["pygame", "mixer", "filedialog", "knoppen"],
    [
      step("Start de mixer", "pygame.mixer speelt mp3 en ogg af.", `import pygame

pygame.mixer.init()
print("Mixer klaar")`),
      step("Laad een bestand", "Vraag de gebruiker om een muziekbestand.", `from tkinter import Tk, Button, filedialog

venster = Tk()

def kies():
    pad = filedialog.askopenfilename(filetypes=[("Audio", "*.mp3 *.ogg *.wav")])
    if pad:
        pygame.mixer.music.load(pad)
        pygame.mixer.music.play()

Button(venster, text="Kies muziek", command=kies).pack()`),
      step("Voeg bediening toe", "Stop, pauze en hervat met knoppen.", `Button(venster, text="Stop", command=pygame.mixer.music.stop).pack()
Button(venster, text="Pauze", command=pygame.mixer.music.pause).pack()
Button(venster, text="Verder", command=pygame.mixer.music.unpause).pack()`),
      step("Stel het volume in", "Het volume loopt van 0.0 tot 1.0.", `pygame.mixer.music.set_volume(0.6)`),
      step("Start de app", "Houd het venster open.", `venster.mainloop()`),
    ],
    ["Test met een kort bestand.", "Gebruik alleen muziek die je mag afspelen."]
  ),
  idea(
    "bmi-app",
    "BMI-app",
    "⚖️",
    "GUI",
    "Beginner",
    "45 min",
    "Bereken je BMI en toon een categorie.",
    "Je leert invoer omzetten naar floats en een berekening tonen. Je voegt een duidelijke waarschuwing toe dat BMI een ruwe maat is.",
    ["tkinter", "floats", "berekenen", "gezondheid"],
    [
      step("Maak de invoervelden", "Vraag lengte in centimeters en gewicht in kilo's.", `import tkinter as tk

venster = tk.Tk()
lengte = tk.Entry(venster)
gewicht = tk.Entry(venster)

lengte.pack()
gewicht.pack()`),
      step("Bereken de BMI", "Deel gewicht door lengte in meters in het kwadraat.", `def bereken():
    try:
        m = float(lengte.get().replace(",", ".")) / 100
        kg = float(gewicht.get().replace(",", "."))
        bmi = kg / (m * m)
    except (ValueError, ZeroDivisionError):
        resultaat.config(text="Vul geldige getallen in.")
        return

    resultaat.config(text=f"BMI: {bmi:.1f}")`),
      step("Voeg een categorie toe", "Gebruik de officiële grenzen als ruwe indicatie.", `def categorie(bmi):
    if bmi < 18.5:
        return "ondergewicht"
    if bmi < 25:
        return "gezond gewicht"
    if bmi < 30:
        return "overgewicht"
    return "obesitas"`),
      step("Toon een waarschuwing", "BMI houdt geen rekening met spier massa of leeftijd.", `tk.Label(venster, text="BMI is een ruwe indicatie, geen medisch advies.").pack()`),
    ],
    ["Test met een geldige en een ongeldige invoer.", "Vraag bij twijfel altijd advies aan een professional."]
  )
];

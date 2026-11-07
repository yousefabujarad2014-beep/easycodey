// Deel 2: GUI, games en praktische tools.
export const IDEAS_PART_2 = [
  {
    id: "pomodoro-timer",
    title: "Pomodoro-timer met tkinter",
    emoji: "🍅",
    category: "GUI",
    level: "Gemiddeld",
    time: "70 min",
    summary: "Een echte desktop-app met een aftellende klok en start- en stopknop.",
    description:
      "Je eerste grafische programma. Met tkinter maak je een venster, labels en knoppen. De timer telt af met behulp van after(), de manier waarop tkinter taken uitstelt zonder je venster te bevriezen.",
    learn: ["tkinter", "after()", "functies", "global", "event loop"],
    steps: [
      {
        title: "Maak je eerste venster",
        text: "tkinter zit standaard bij Python, je hoeft niets te installeren. Elk programma begint met een hoofdvenster en eindigt met mainloop(), dat het venster openhoudt.",
        code: `import tkinter as tk

root = tk.Tk()
root.title("Pomodoro")
root.geometry("320x220")

tijd = tk.Label(root, text="25:00", font=("Segoe UI", 42, "bold"))
tijd.pack(pady=20)

root.mainloop()`
      },
      {
        title: "Laat de klok aftellen",
        text: "after(1000, tick) vraagt tkinter om tick() over één seconde opnieuw aan te roepen. Zo blijft het venster reageren tijdens het aftellen.",
        code: `seconden = 25 * 60
loopt = False

def tick():
    global seconden
    if not loopt:
        return

    if seconden > 0:
        seconden -= 1
        minuten, rest = divmod(seconden, 60)
        tijd.config(text=f"{minuten:02d}:{rest:02d}")
        root.after(1000, tick)
    else:
        tijd.config(text="Klaar!")`
      },
      {
        title: "Voeg start- en stopknoppen toe",
        text: "De knoppen roepen functies aan. Met de variabele loopt voorkom je dat er twee timers tegelijk lopen als je twee keer op start klikt.",
        code: `def start():
    global loopt
    if not loopt:
        loopt = True
        tick()


def stop():
    global loopt
    loopt = False


tk.Button(root, text="Start", width=10, command=start).pack(side="left", padx=24)
tk.Button(root, text="Stop", width=10, command=stop).pack(side="right", padx=24)`
      },
      {
        title: "Wissel werk en pauze af",
        text: "Na 25 minuten werken volgt 5 minuten pauze. Houd bij in welke fase je zit en reset de seconden als de fase voorbij is. Zo wordt het een echte pomodoro.",
        code: `werk_seconden = 25 * 60
pauze_seconden = 5 * 60
is_werk = True

# In tick(), als seconden 0 is:
if is_werk:
    is_werk = False
    seconden = pauze_seconden
    tijd.config(text="Pauze")
else:
    is_werk = True
    seconden = werk_seconden
    tijd.config(text="Werken")`
      },
      {
        title: "Maak het af met een melding",
        text: "Een venster dat piept of van kleur verandert voelt pas af. Op Windows kun je winsound gebruiken; op andere systemen print je een melding of gebruik je een belletje van tkinter.",
        code: `import sys

def meld():
    root.bell()
    if sys.platform == "win32":
        import winsound
        winsound.MessageBeep()

# Roep meld() aan wanneer een fase eindigt:
# tijd.config(text="Klaar!")
# meld()`
      }
    ],
    tips: [
      "Gebruik root.after() nooit in een lange while-loop, anders bevriest het venster.",
      "Maak de timer instelbaar met een Entry-veld voor werk- en pauzetijd.",
      "Test de timer met 5 seconden in plaats van 25 minuten."
    ],
    next: ["rekenmachine", "snake", "pong"]
  },
  {
    id: "snake",
    title: "Snake met pygame",
    emoji: "🐍",
    category: "Games",
    level: "Gemiddeld",
    time: "90 min",
    summary: "Het slangenspel: eet, groei en bots niet tegen de muur of jezelf.",
    description:
      "Je eerste echte spellenproject. Je leert een game-loop opzetten, toetsen lezen, botsingen controleren en tekenen op het scherm. Aan het eind heb je een spel dat je aan vrienden kunt laten zien.",
    learn: ["pygame", "game loop", "botsingen", "lijsten", "tekenen"],
    steps: [
      {
        title: "Zet het spelvenster op",
        text: "Installeer pygame met pip install pygame. Daarna maak je een venster met een vaste celgrootte, zodat je slang en eten op een raster passen.",
        code: `import pygame
import random

pygame.init()

CELL = 24
COLS, ROWS = 20, 20
scherm = pygame.display.set_mode((COLS * CELL, ROWS * CELL))
pygame.display.set_caption("Snake")
klok = pygame.time.Clock()`
      },
      {
        title: "Maak de slang en het eten",
        text: "De slang is een lijst met coördinaten. Het eerste element is het hoofd. Het eten staat op een willekeurige cel.",
        code: `slang = [(10, 10), (9, 10), (8, 10)]
richting = (1, 0)
eten = (15, 10)

def nieuw_eten():
    return (random.randrange(COLS), random.randrange(ROWS))`
      },
      {
        title: "Lees de toetsen",
        text: "Met pygame.key.get_pressed() lees je alle toetsen tegelijk. De slang mag niet direct omkeren, anders botst hij meteen tegen zichzelf.",
        code: `loopt = True

while loopt:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            loopt = False

    toetsen = pygame.key.get_pressed()

    if toetsen[pygame.K_UP] and richting != (0, 1):
        richting = (0, -1)
    if toetsen[pygame.K_DOWN] and richting != (0, -1):
        richting = (0, 1)
    if toetsen[pygame.K_LEFT] and richting != (1, 0):
        richting = (-1, 0)
    if toetsen[pygame.K_RIGHT] and richting != (-1, 0):
        richting = (1, 0)`
      },
      {
        title: "Beweeg, eet en groei",
        text: "Bereken eerst de nieuwe kop en controleer botsingen. Daarna schuif je de slang door: een nieuwe kop vooraan en het laatste stukje eraf. Alleen bij eten laat je het staartje staan.",
        code: `    kop_x, kop_y = slang[0]
    nieuwe_kop = (kop_x + richting[0], kop_y + richting[1])

    if (nieuwe_kop[0] < 0 or nieuwe_kop[0] >= COLS or
            nieuwe_kop[1] < 0 or nieuwe_kop[1] >= ROWS or
            nieuwe_kop in slang):
        loopt = False
        continue

    slang.insert(0, nieuwe_kop)

    if nieuwe_kop == eten:
        eten = nieuw_eten()
    else:
        slang.pop()`
      },
      {
        title: "Teken alles en houd de snelheid vast",
        text: "Vul het scherm, teken het eten en daarna elk stuk van de slang. Met klok.tick(10) speelt het spel tien stappen per seconde.",
        code: `    scherm.fill((18, 18, 22))

    pygame.draw.rect(scherm, (255, 107, 74),
                     (eten[0] * CELL, eten[1] * CELL, CELL - 2, CELL - 2))

    for x, y in slang:
        pygame.draw.rect(scherm, (61, 220, 132),
                         (x * CELL, y * CELL, CELL - 2, CELL - 2))

    pygame.display.flip()
    klok.tick(10)

pygame.quit()`
      }
    ],
    tips: [
      "Houd de slang in een lijst met tuples; dat is makkelijker dan losse x- en y-variabelen.",
      "Laat de slang niet sneller worden voordat het basisspel werkt.",
      "Toon de score met pygame.font.SysFont()."
    ],
    next: ["pong", "boter-kaas-eieren", "rekenmachine"]
  },
  {
    id: "pong",
    title: "Pong met pygame",
    emoji: "🏓",
    category: "Games",
    level: "Gemiddeld",
    time: "60 min",
    summary: "De retro tennisklassieker met een computertegenstander.",
    description:
      "Pong is simpel maar verrassend leerzaam: je werkt met rechthoeken, snelheden, botsingen en een tegenstander die de bal volgt. Perfect als je Snake onder de knie hebt.",
    learn: ["pygame.Rect", "collisions", "snelheid", "game loop", "AI"],
    steps: [
      {
        title: "Zet het speelveld klaar",
        text: "Met pygame.Rect maak je rechthoeken voor de twee peddels en de bal. Een Rect heeft handige eigenschappen zoals top, bottom en colliderect().",
        code: `import pygame

pygame.init()

WIDTH, HEIGHT = 800, 500
scherm = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pong")
klok = pygame.time.Clock()

speler = pygame.Rect(30, 200, 14, 100)
computer = pygame.Rect(WIDTH - 44, 200, 14, 100)
bal = pygame.Rect(WIDTH // 2, HEIGHT // 2, 14, 14)
bal_snelheid = [4, 3]`
      },
      {
        title: "Beweeg je peddel",
        text: "Met W en S bestuur je de linkse peddel. Controleer de randen zodat de peddel niet uit het scherm verdwijnt.",
        code: `while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            raise SystemExit

    toetsen = pygame.key.get_pressed()

    if toetsen[pygame.K_w] and speler.top > 0:
        speler.y -= 6
    if toetsen[pygame.K_s] and speler.bottom < HEIGHT:
        speler.y += 6`
      },
      {
        title: "Laat de bal stuiteren",
        text: "De bal beweegt elke frame met zijn snelheid. Tegen de boven- of onderkant klapt de verticale snelheid om. Raakt hij een peddel, dan klapt de horizontale snelheid om.",
        code: `    bal.x += bal_snelheid[0]
    bal.y += bal_snelheid[1]

    if bal.top <= 0 or bal.bottom >= HEIGHT:
        bal_snelheid[1] *= -1

    if bal.colliderect(speler) or bal.colliderect(computer):
        bal_snelheid[0] *= -1`
      },
      {
        title: "Tel punten en reset de bal",
        text: "Als de bal links of rechts uit het scherm gaat, krijgt de ander een punt. Zet de bal daarna weer in het midden.",
        code: `    if bal.left <= 0 or bal.right >= WIDTH:
        bal.center = (WIDTH // 2, HEIGHT // 2)
        bal_snelheid = [4, 3]

    scherm.fill((12, 12, 16))
    pygame.draw.rect(scherm, (109, 141, 255), speler)
    pygame.draw.rect(scherm, (255, 107, 74), computer)
    pygame.draw.rect(scherm, (244, 242, 234), bal)

    pygame.display.flip()
    klok.tick(60)`
      },
      {
        title: "Laat de computer spelen",
        text: "De computerpeddel volgt de bal met een vaste snelheid. Zo is hij niet onverslaanbaar, maar doet hij wel mee.",
        code: `    if computer.centery < bal.centery:
        computer.y += 4
    elif computer.centery > bal.centery:
        computer.y -= 4

    computer.clamp_ip(pygame.Rect(0, 0, WIDTH, HEIGHT))`
      }
    ],
    tips: [
      "Houd de bal net iets langzamer dan de peddels, anders is het spel niet leuk.",
      "Voeg een scorebord toe met pygame.font.SysFont().",
      "Met pijltjes in plaats van W/S kun je ook met twee spelers spelen."
    ],
    next: ["snake", "boter-kaas-eieren", "multiplayer-chat"]
  },
  {
    id: "webscraper",
    title: "Webscraper voor nieuwskoppen",
    emoji: "🕷️",
    category: "Web",
    level: "Gemiddeld",
    time: "60 min",
    summary: "Haal automatisch de nieuwste koppen van een website en bewaar ze als CSV.",
    description:
      "Je leert hoe een webpagina in elkaar zit en hoe je met BeautifulSoup informatie eruit haalt. We oefenen op een site die scraping toestaat. Je leert ook waarom je altijd de regels van een site moet respecteren.",
    learn: ["requests", "BeautifulSoup", "HTML", "selectors", "CSV"],
    steps: [
      {
        title: "Haal een pagina op",
        text: "Installeer de pakketten met pip install requests beautifulsoup4. Vraag de pagina op met een herkenbare User-Agent en een timeout.",
        code: `import requests
from bs4 import BeautifulSoup

url = "https://news.ycombinator.com/"
headers = {"User-Agent": "EasyCodeyLeerproject/1.0 (leerproject)"}

pagina = requests.get(url, headers=headers, timeout=10)
soep = BeautifulSoup(pagina.text, "html.parser")

print(soep.title.text)`
      },
      {
        title: "Zoek de juiste elementen",
        text: "Open de pagina in je browser en bekijk de HTML. De koppen staan in een span met class titleline. Met select() zoek je op CSS-selector.",
        code: `titels = soep.select(".titleline")

for titel in titels[:10]:
    print("-", titel.get_text())`
      },
      {
        title: "Bewaar titel en link",
        text: "Elke titel bevat een link. Met find('a') pak je die link en met ['href'] lees je het adres. Zet de resultaten in een lijst met woordenboeken.",
        code: `koppen = []

for titel in titels[:10]:
    link = titel.find("a")
    if link:
        koppen.append({
            "titel": titel.get_text(),
            "url": link["href"],
        })

for kop in koppen:
    print(kop["titel"])`
      },
      {
        title: "Schrijf de resultaten naar CSV",
        text: "Met de csv-module maak je een bestand dat je in Excel of Google Sheets kunt openen. newline='' voorkomt lege regels op Windows.",
        code: `import csv

with open("koppen.csv", "w", newline="", encoding="utf-8") as bestand:
    schrijver = csv.DictWriter(bestand, fieldnames=["titel", "url"])
    schrijver.writeheader()
    schrijver.writerows(koppen)

print("Opgeslagen in koppen.csv")`
      },
      {
        title: "Respecteer de regels",
        text: "Niet elke site wil dat je hem automatisch uitleest. Kijk altijd naar robots.txt en de gebruiksvoorwaarden. Doe rustig aan met verzoeken en zet geen persoonlijke gegevens in je User-Agent.",
        code: `# Controleer eerst:
# https://news.ycombinator.com/robots.txt

# Voeg een korte pauze toe tussen verzoeken:
import time

for pagina_nummer in range(1, 4):
    print("Pagina", pagina_nummer, "ophalen...")
    time.sleep(1)  # wees vriendelijk voor de server`
      }
    ],
    tips: [
      "Websites veranderen; als je selector niet werkt, bekijk dan opnieuw de HTML.",
      "Scrape geen persoonlijke data en omzeil geen inlogmuren.",
      "Bewaar ruwe HTML tijdens het ontwikkelen, dan hoef je niet steeds opnieuw te laden."
    ],
    next: ["streamlit-dashboard", "weer-app", "flask-blog"]
  },
  {
    id: "flask-blog",
    title: "Blog met Flask",
    emoji: "📝",
    category: "Web",
    level: "Gemiddeld",
    time: "90 min",
    summary: "Je eerste echte website met routes, templates en een formulier.",
    description:
      "Flask is een klein Python-webframework. Je bouwt een blog met een homepagina, detailpagina's en een formulier om nieuwe posts te maken. Zo leer je hoe het web werkt: verzoek, route, antwoord.",
    learn: ["Flask", "routes", "Jinja", "HTML", "POST"],
    steps: [
      {
        title: "Start een minimale Flask-app",
        text: "Installeer Flask met pip install flask. Elke route is een functie die teruggeeft wat de browser moet tonen. Met debug=True zie je fouten meteen.",
        code: `from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Mijn blog</h1><p>Welkom!</p>"

if __name__ == "__main__":
    app.run(debug=True)`
      },
      {
        title: "Gebruik templates in plaats van HTML-strings",
        text: "Plaats een bestand index.html in de map templates. Met render_template() geef je Python-data door aan de HTML. Jinja regelt de rest.",
        code: `from flask import Flask, render_template

app = Flask(__name__)

posts = [
    {"titel": "Mijn eerste post", "tekst": "Hallo wereld!"},
    {"titel": "Python leren", "tekst": "Vandaag begon ik met Flask."},
]

@app.route("/")
def home():
    return render_template("index.html", posts=posts)`
      },
      {
        title: "Toon de posts met een loop",
        text: "In Jinja gebruik je {% for %} en {{ }}. Dit is de index.html in de map templates. De opmaak mag je zo uitgebreid maken als je wilt.",
        code: `<!DOCTYPE html>
<html lang="nl">
<body>
  <h1>Mijn blog</h1>

  {% for post in posts %}
    <article>
      <h2>{{ post.titel }}</h2>
      <p>{{ post.tekst }}</p>
    </article>
  {% endfor %}

</body>
</html>`
      },
      {
        title: "Maak een detailpagina",
        text: "Een route met een variabele noemt de post op. Door <int:nummer> accepteert Flask alleen getallen. Zo krijg je nette URL's zoals /post/1.",
        code: `@app.route("/post/<int:nummer>")
def post(nummer):
    gekozen = posts[nummer]
    return render_template("post.html", post=gekozen)`
      },
      {
        title: "Voeg een formulier toe",
        text: "Bij GET toon je het formulier, bij POST verwerk je de invoer. Daarna stuur je de bezoeker terug naar de homepagina met redirect().",
        code: `from flask import request, redirect, url_for

@app.route("/nieuw", methods=["GET", "POST"])
def nieuw():
    if request.method == "POST":
        titel = request.form["titel"]
        tekst = request.form["tekst"]
        posts.append({"titel": titel, "tekst": tekst})
        return redirect(url_for("home"))

    return render_template("nieuw.html")`
      }
    ],
    tips: [
      "Zet nooit debug=True op een publieke server.",
      "Gebruik url_for() in plaats van hardgecodeerde links.",
      "Posts verdwijnen bij een herstart; later vervang je de lijst door een database."
    ],
    next: ["fastapi-api", "webscraper", "streamlit-dashboard"]
  },
  {
    id: "budget-tracker",
    title: "Budget-tracker met grafiek",
    emoji: "💰",
    category: "Data & AI",
    level: "Gemiddeld",
    time: "75 min",
    summary: "Houd uitgaven bij in CSV en maak een staafdiagram per categorie.",
    description:
      "Je combineert bestanden lezen en schrijven met rekenen en data-visualisatie. Aan het eind heb je een script dat je uitgaven analyseert en laat zien waar je geld naartoe gaat.",
    learn: ["CSV", "DictReader", "dict", "matplotlib", "data-analyse"],
    steps: [
      {
        title: "Maak een CSV met uitgaven",
        text: "Een CSV-bestand is platte tekst met komma's. De eerste regel bevat de kolomnamen. Maak dit bestand met de hand of met een kort script.",
        code: `import csv

with open("uitgaven.csv", "w", newline="", encoding="utf-8") as bestand:
    schrijver = csv.writer(bestand)
    schrijver.writerow(["datum", "categorie", "bedrag"])
    schrijver.writerow(["2026-11-01", "eten", 12.50])
    schrijver.writerow(["2026-11-02", "vervoer", 3.20])
    schrijver.writerow(["2026-11-03", "eten", 8.75])
    schrijver.writerow(["2026-11-04", "entertainment", 15.00])`
      },
      {
        title: "Lees de uitgaven in",
        text: "DictReader maakt van elke rij een woordenboek met de kolomnamen als sleutels. Zo hoef je geen indexen te onthouden.",
        code: `import csv

with open("uitgaven.csv", newline="", encoding="utf-8") as bestand:
    rijen = list(csv.DictReader(bestand))

for rij in rijen:
    print(rij["datum"], rij["categorie"], "€", rij["bedrag"])

print("Aantal uitgaven:", len(rijen))`
      },
      {
        title: "Bereken het totaal per categorie",
        text: "Met een woordenboek tel je bedragen op. get() geeft 0 als de categorie nog niet bestaat, zodat je veilig kunt optellen.",
        code: `totalen = {}

for rij in rijen:
    bedrag = float(rij["bedrag"])
    categorie = rij["categorie"]
    totalen[categorie] = totalen.get(categorie, 0) + bedrag

for categorie, bedrag in totalen.items():
    print(f"{categorie}: €{bedrag:.2f}")

print(f"Totaal: €{sum(totalen.values()):.2f}")`
      },
      {
        title: "Teken een staafdiagram",
        text: "Installeer matplotlib met pip install matplotlib. Daarna maak je in drie regels een grafiek. plt.show() opent een venster met de grafiek.",
        code: `import matplotlib.pyplot as plt

plt.bar(totalen.keys(), totalen.values(), color="#1f5eff")
plt.title("Uitgaven per categorie")
plt.ylabel("Euro")
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()`
      },
      {
        title: "Voeg een nieuwe uitgave toe",
        text: "Vraag de gegevens met input() en schrijf één regel bij aan het bestand. Met mode 'a' voeg je toe in plaats van te overschrijven.",
        code: `datum = input("Datum (JJJJ-MM-DD): ")
categorie = input("Categorie: ")
bedrag = float(input("Bedrag: "))

with open("uitgaven.csv", "a", newline="", encoding="utf-8") as bestand:
    schrijver = csv.writer(bestand)
    schrijver.writerow([datum, categorie, bedrag])

print("Toegevoegd!")`
      }
    ],
    tips: [
      "Gebruik Decimal in plaats van float als je met echt geld rekenen moet.",
      "Maak een maandfilter met rij['datum'].startswith('2026-11').",
      "Bewaar een budget per categorie en kleur de balken rood als je eroverheen gaat."
    ],
    next: ["streamlit-dashboard", "todo-lijst", "ml-huizenprijzen"]
  },
  {
    id: "organiseer-downloads",
    title: "Organiseer je Downloads-map",
    emoji: "🗂️",
    category: "Handige tools",
    level: "Beginner",
    time: "45 min",
    summary: "Sorteer bestanden automatisch in mappen op basis van hun extensie.",
    description:
      "Een script dat je echt kunt gebruiken. Je leert werken met pathlib, bestanden verplaatsen en — heel belangrijk — eerst een droge run doen voordat je iets aanraakt. Veiligheid boven alles.",
    learn: ["pathlib", "bestanden", "extensies", "dry-run", "csv-log"],
    steps: [
      {
        title: "Bekijk wat er in de map staat",
        text: "Path.home() geeft je gebruikersmap. Met iterdir() loop je door de inhoud. Print eerst alleen de namen: nog niets verplaatsen.",
        code: `from pathlib import Path

map = Path.home() / "Downloads"

for bestand in map.iterdir():
    print(bestand.name)`
      },
      {
        title: "Bepaal de doelmap per extensie",
        text: "Een woordenboek koppelt elke extensie aan een mapnaam. Bestanden met een onbekende extensie laat je staan.",
        code: `doelen = {
    ".jpg": "Afbeeldingen",
    ".jpeg": "Afbeeldingen",
    ".png": "Afbeeldingen",
    ".pdf": "Documenten",
    ".docx": "Documenten",
    ".txt": "Documenten",
    ".zip": "Archieven",
    ".mp4": "Videos",
}

print("Aantal regels:", len(doelen))`
      },
      {
        title: "Doe eerst een droge run",
        text: "Print wat je zou verplaatsen zonder het echt te doen. Controleer de lijst goed. Dit voorkomt dat je per ongeluk bestanden kwijtraakt.",
        code: `for bestand in map.iterdir():
    if not bestand.is_file():
        continue

    doel = doelen.get(bestand.suffix.lower())
    if doel:
        print("Zou verplaatsen:", bestand.name, "->", doel)
    else:
        print("Overslaan:", bestand.name)`
      },
      {
        title: "Verplaats de bestanden",
        text: "Maak de doelmap aan met mkdir(exist_ok=True) en verplaats daarna elk bestand met rename(). Test dit eerst op een kopie van je map.",
        code: `for bestand in map.iterdir():
    if not bestand.is_file():
        continue

    doel = doelen.get(bestand.suffix.lower())
    if not doel:
        continue

    doel_map = map / doel
    doel_map.mkdir(exist_ok=True)
    bestand.rename(doel_map / bestand.name)
    print("Verplaatst:", bestand.name)`
      },
      {
        title: "Maak een logboek",
        text: "Schrijf voor elk verplaatst bestand de oude en nieuwe locatie naar een CSV. Zo kun je later terugzoeken waar iets naartoe is gegaan.",
        code: `import csv

with open("verplaatsingen.csv", "a", newline="", encoding="utf-8") as log:
    schrijver = csv.writer(log)
    schrijver.writerow(["oud", "nieuw"])

    # Binnen de loop, na het verplaatsen:
    # schrijver.writerow([str(bestand), str(doel_map / bestand.name)])

print("Logboek bijgewerkt.")`
      }
    ],
    tips: [
      "Test altijd op een tijdelijke map voordat je je echte Downloads-map sorteert.",
      "Sla verborgen bestanden over, zoals .gitignore of configuratiebestanden.",
      "Maak een undo-script dat het CSV-logboek terugleest."
    ],
    next: ["todo-lijst", "markdown-html", "afbeeldingen-bewerken"]
  },
  {
    id: "markdown-html",
    title: "Markdown naar HTML",
    emoji: "📄",
    category: "Handige tools",
    level: "Gemiddeld",
    time: "50 min",
    summary: "Zet een eenvoudig Markdown-bestand om naar een webpagina.",
    description:
      "Je leert hoe tekstverwerking werkt met reguliere expressies. Je leest een .md-bestand, vervangt koppen en vetgedrukte tekst door HTML en schrijft een complete webpagina weg.",
    learn: ["re", "regex", "Path", "tekstverwerking", "HTML"],
    steps: [
      {
        title: "Lees een Markdown-bestand",
        text: "Maak een bestand notitie.md met een paar regels tekst. Path leest het bestand in één keer als string.",
        code: `from pathlib import Path

tekst = Path("notitie.md").read_text(encoding="utf-8")
print(tekst)`
      },
      {
        title: "Vervang koppen",
        text: "Met re.sub() vervang je een patroon. De vlag re.MULTILINE zorgt dat ^ aan het begin van elke regel matcht. De \\1 in de vervanging is de tekst tussen haakjes.",
        code: `import re

tekst = re.sub(r"^### (.+)$", r"<h3>\\1</h3>", tekst, flags=re.MULTILINE)
tekst = re.sub(r"^## (.+)$", r"<h2>\\1</h2>", tekst, flags=re.MULTILINE)
tekst = re.sub(r"^# (.+)$", r"<h1>\\1</h1>", tekst, flags=re.MULTILINE)

print(tekst)`
      },
      {
        title: "Maak tekst vet",
        text: "Twee sterretjes rond tekst wordt <strong>. Het vraagteken in (.+?) zorgt dat de match zo kort mogelijk is, zodat twee vetgedrukte stukken op één regel niet samensmelten.",
        code: `tekst = re.sub(r"\\*\\*(.+?)\\*\\*", r"<strong>\\1</strong>", tekst)

tekst = re.sub(r"^- (.+)$", r"<li>\\1</li>", tekst, flags=re.MULTILINE)

print(tekst)`
      },
      {
        title: "Maak er een complete pagina van",
        text: "Plak de omgezette tekst tussen HTML-tags en schrijf het resultaat naar een .html-bestand. Open dat bestand daarna in je browser.",
        code: `html = f"""<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>Mijn notitie</title>
  <style>
    body {{ max-width: 700px; margin: 40px auto; font-family: sans-serif; }}
  </style>
</head>
<body>
{tekst}
</body>
</html>"""

Path("notitie.html").write_text(html, encoding="utf-8")
print("Klaar! Open notitie.html in je browser.")`
      },
      {
        title: "Test met lastige tekst",
        text: "Probeer koppen, vetgedrukte woorden en lege regels door elkaar. Reguliere expressies zijn krachtig, maar je moet randgevallen testen. Voor serieus werk gebruik je de markdown-bibliotheek.",
        code: `# Alternatief: gebruik een bestaande bibliotheek
# pip install markdown

import markdown

md = Path("notitie.md").read_text(encoding="utf-8")
html = markdown.markdown(md)

Path("notitie.html").write_text(html, encoding="utf-8")`
      }
    ],
    tips: [
      "Begin met één soort opmaak tegelijk; test na elke toevoeging.",
      "Gebruik een online regex-tester om je patronen te controleren.",
      "Voor productiegebruik is de markdown-bibliotheek betrouwbaarder dan zelf schrijven."
    ],
    next: ["webscraper", "flask-blog", "organiseer-downloads"]
  },
  {
    id: "sudoku-oplosser",
    title: "Sudoku-oplosser",
    emoji: "🧩",
    category: "Data & AI",
    level: "Gevorderd",
    time: "90 min",
    summary: "Laat Python elke sudoku oplossen met backtracking.",
    description:
      "Dit is een echte algoritme-uitdaging. Je leert recursie en backtracking: proberen, vastlopen en teruggaan. Het is misschien het slimste kleine programma dat je tot nu toe schrijft.",
    learn: ["recursie", "backtracking", "2D-lijsten", "algoritmes", "functies"],
    steps: [
      {
        title: "Zet de sudoku in een 2D-lijst",
        text: "Een sudoku is een lijst van negen rijen, elk met negen getallen. Nul betekent een leeg vakje. Print het bord in een leesbaar rooster.",
        code: `bord = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

def toon_bord():
    for rij in bord:
        print(" ".join(str(getal) if getal else "." for getal in rij))`
      },
      {
        title: "Controleer of een getal mag",
        text: "Een getal mag niet twee keer in dezelfde rij, kolom of 3x3-box staan. Bereken eerst waar de box begint en loop die daarna door.",
        code: `def geldig(rij, kolom, getal):
    for i in range(9):
        if bord[rij][i] == getal or bord[i][kolom] == getal:
            return False

    start_rij = (rij // 3) * 3
    start_kolom = (kolom // 3) * 3

    for r in range(start_rij, start_rij + 3):
        for k in range(start_kolom, start_kolom + 3):
            if bord[r][k] == getal:
                return False

    return True`
      },
      {
        title: "Schrijf de backtracking-oplosser",
        text: "Zoek een leeg vakje. Probeer de getallen 1 tot 9. Als een getal mag, zet je het neer en roep je de functie opnieuw aan. Loopt dat vast, dan zet je het vakje terug op 0. Dat is backtracking.",
        code: `def los_op():
    for rij in range(9):
        for kolom in range(9):
            if bord[rij][kolom] == 0:
                for getal in range(1, 10):
                    if geldig(rij, kolom, getal):
                        bord[rij][kolom] = getal
                        if los_op():
                            return True
                        bord[rij][kolom] = 0
                return False
    return True`
      },
      {
        title: "Los het bord op",
        text: "Roep de functie aan en print het resultaat. Als er geen oplossing is, krijg je False terug. Probeer daarna een leeg bord of een moeilijkere sudoku.",
        code: `if los_op():
    toon_bord()
else:
    print("Deze sudoku heeft geen oplossing.")`
      },
      {
        title: "Maak een sudoku-generator",
        text: "Als bonus kun je een sudoku maken: vul een leeg bord met de oplosser en haal daarna willekeurig cijfers weg. Controleer dat er nog steeds precies één oplossing is.",
        code: `import random

def maak_puzzel():
    # Vul eerst een leeg bord met de oplosser
    for rij in range(9):
        for kolom in range(9):
            bord[rij][kolom] = 0

    los_op()

    # Haal 40 willekeurige cijfers weg
    for _ in range(40):
        rij = random.randrange(9)
        kolom = random.randrange(9)
        bord[rij][kolom] = 0`
      }
    ],
    tips: [
      "Print het bord na elke stap tijdens het debuggen, dan zie je wat de recursie doet.",
      "Begin met een bijna-af bord; dat is sneller te testen.",
      "Een echte puzzelgenerator moet controleren of er nog maar één oplossing is."
    ],
    next: ["ml-huizenprijzen", "ai-chatbot", "multiplayer-chat"]
  }
];

// Deel 5: GUI, Kunst & Creatief en Onderwijs.
import { idea, step } from "./helper.js";

export const IDEAS_PART_5 = [
  idea(
    "rekenmachine-gui",
    "Rekenmachine met venster",
    "🧮",
    "GUI",
    "Beginner",
    "60 min",
    "Bouw een echte rekenmachine met knoppen en een scherm.",
    "Je maakt met tkinter een venster met een invoerveld en knoppen. Je leert widgets plaatsen, klikken afhandelen en rekenen met invoer.",
    ["tkinter", "grid", "lambda", "functies"],
    [
      step("Maak het venster", "tkinter zit standaard bij Python. Maak eerst een venster met een titel en een invoerveld.", `import tkinter as tk

venster = tk.Tk()
venster.title("Rekenmachine")

scherm = tk.Entry(venster, font=("Segoe UI", 20), justify="right")
scherm.grid(row=0, column=0, columnspan=4, sticky="nsew", padx=8, pady=8)

venster.mainloop()`),
      step("Voeg knoppen toe", "Een grid met rijen en kolommen houdt de knoppen netjes uitgelijnd.", `def voeg_in(teken):
    scherm.insert("end", teken)

knoppen = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"]

for index, label in enumerate(knoppen):
    rij = index // 4 + 1
    kolom = index % 4
    knop = tk.Button(venster, text=label, font=("Segoe UI", 16),
                     command=lambda t=label: voeg_in(t))
    knop.grid(row=rij, column=kolom, sticky="nsew", padx=4, pady=4)`),
      step("Bereken het resultaat", "eval is hier alleen veilig omdat je zelf de invoer via knoppen beperkt. Controleer de tekens extra.", `def bereken():
    tekst = scherm.get()
    if not all(teken in "0123456789.+-*/" for teken in tekst):
        return
    try:
        uitkomst = eval(tekst, {"__builtins__": {}}, {})
    except ZeroDivisionError:
        uitkomst = "delen door 0"
    scherm.delete(0, "end")
    scherm.insert(0, str(uitkomst))

# Koppel de = knop aan bereken()`),
      step("Maak het venster schaalbaar", "Met weight krijgen rijen en kolommen dezelfde ruimte.", `for i in range(4):
    venster.columnconfigure(i, weight=1)

for i in range(1, 6):
    venster.rowconfigure(i, weight=1)`),
      step("Voeg een wis-knop toe", "Een extra knop maakt de rekenmachine bruikbaar.", `tk.Button(venster, text="C", command=lambda: scherm.delete(0, "end")).grid(
    row=6, column=0, columnspan=4, sticky="nsew", padx=4, pady=4
)`)
    ],
    ["Gebruik nooit eval op vrije tekst van een gebruiker.", "Test ook delen door nul en meerdere punten."]
  ),
  idea(
    "todo-gui",
    "Takenlijst met venster",
    "📝",
    "GUI",
    "Beginner",
    "50 min",
    "Maak een takenlijst die je met knoppen beheert.",
    "Je leert een Listbox, Entry en knoppen combineren. Je voegt taken toe, verwijdert ze en vinkt ze af.",
    ["tkinter", "listbox", "entry", "events"],
    [
      step("Bouw de basis", "Een invoerveld, een lijst en drie knoppen vormen de hele app.", `import tkinter as tk

venster = tk.Tk()
venster.title("Mijn taken")

invoer = tk.Entry(venster, width=40)
invoer.pack(padx=12, pady=8)

lijst = tk.Listbox(venster, width=50, height=12)
lijst.pack(padx=12, pady=8)

venster.mainloop()`),
      step("Voeg een taak toe", "Lees de invoer, controleer op lege tekst en wis daarna het veld.", `def toevoegen(event=None):
    taak = invoer.get().strip()
    if taak:
        lijst.insert("end", taak)
        invoer.delete(0, "end")

invoer.bind("<Return>", toevoegen)
tk.Button(venster, text="Toevoegen", command=toevoegen).pack()`),
      step("Verwijder de selectie", "Met curselection weet je welk item geselecteerd is.", `def verwijderen():
    selectie = lijst.curselection()
    if selectie:
        lijst.delete(selectie[0])

tk.Button(venster, text="Verwijderen", command=verwijderen).pack()`),
      step("Markeer als klaar", "Een prefix in de lijst is genoeg voor een eerste versie.", `def klaar():
    selectie = lijst.curselection()
    if selectie:
        index = selectie[0]
        tekst = lijst.get(index)
        if not tekst.startswith("✓ "):
            lijst.delete(index)
            lijst.insert(index, "✓ " + tekst)

tk.Button(venster, text="Klaar", command=klaar).pack()`),
      step("Bewaar de taken", "Sla de lijst op in een tekstbestand en lees hem bij het starten.", `from pathlib import Path

BESTAND = Path("taken.txt")

def laad():
    if BESTAND.exists():
        for regel in BESTAND.read_text(encoding="utf-8").splitlines():
            lijst.insert("end", regel)

def bewaar():
    taken = lijst.get(0, "end")
    BESTAND.write_text("\\n".join(taken), encoding="utf-8")

venster.protocol("WM_DELETE_WINDOW", lambda: (bewaar(), venster.destroy()))`)
    ],
    ["Test met een lege invoer en een lege lijst.", "Gebruik een checkbox of prefix voor afgeronde taken."]
  ),
  idea(
    "klok-gui",
    "Digitale klok",
    "🕰️",
    "GUI",
    "Beginner",
    "40 min",
    "Toon de live tijd in een eigen venster.",
    "Je leert hoe je een GUI elke seconde laat verversen met after(). Je maakt een digitale klok met datum.",
    ["tkinter", "after", "datetime", "labels"],
    [
      step("Maak een groot label", "Een Label met een groot lettertype is het hele scherm.", `import tkinter as tk

venster = tk.Tk()
venster.title("Klok")
venster.configure(bg="#15150f")

klok = tk.Label(venster, font=("Consolas", 48), fg="#ffd43b", bg="#15150f")
klok.pack(padx=40, pady=30)

venster.mainloop()`),
      step("Toon de tijd", "strftime maakt een nette tijdsnotatie.", `from datetime import datetime

def update():
    nu = datetime.now()
    klok.config(text=nu.strftime("%H:%M:%S"))
    venster.after(1000, update)

update()`),
      step("Voeg de datum toe", "Een tweede label toont de datum in het Nederlands.", `datum = tk.Label(venster, font=("Segoe UI", 14), fg="#cfc9b8", bg="#15150f")
datum.pack(pady=(0, 24))

def update():
    nu = datetime.now()
    klok.config(text=nu.strftime("%H:%M:%S"))
    datum.config(text=nu.strftime("%d-%m-%Y"))
    venster.after(1000, update)`),
      step("Maak het scherm altijd bovenaan", "Een optionele instelling die handig is tijdens het leren.", `venster.attributes("-topmost", True)`),
      step("Voeg een stopknop toe", "Met een vlag kun je de updates netjes stoppen.", `actief = True

def stop():
    global actief
    actief = False

def update():
    if actief:
        klok.config(text=datetime.now().strftime("%H:%M:%S"))
        venster.after(1000, update)`),
    ],
    ["Gebruik after() in plaats van time.sleep in een GUI.", "Test de klok na middernacht niet handmatig; vertrouw op datetime."]
  ),
  idea(
    "weer-gui",
    "Weervenster",
    "🌤️",
    "GUI",
    "Gemiddeld",
    "75 min",
    "Haal het weer op en toon het in een eigen venster.",
    "Je combineert tkinter met requests. Je leert een API aanroepen, JSON lezen en het resultaat netjes tonen.",
    ["tkinter", "requests", "json", "threading"],
    [
      step("Bouw het venster", "Een titel, een knop en een tekstvak zijn genoeg.", `import tkinter as tk

venster = tk.Tk()
venster.title("Weer")

titel = tk.Label(venster, text="Weer in Amsterdam", font=("Segoe UI", 18, "bold"))
titel.pack(padx=20, pady=12)

uitvoer = tk.Label(venster, text="Klik op vernieuwen", font=("Segoe UI", 14))
uitvoer.pack(padx=20, pady=12)

venster.mainloop()`),
      step("Haal de gegevens op", "Open-Meteo heeft geen sleutel nodig. Gebruik een korte time-out.", `import requests

def haal_weer():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": 52.37, "longitude": 4.89, "current": "temperature_2m,wind_speed_10m"}
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()["current"]`),
      step("Werk de labels bij", "Doe het netwerkverzoek in een thread, anders bevriest het venster.", `import threading

def vernieuw():
    uitvoer.config(text="Laden...")
    threading.Thread(target=laad, daemon=True).start()

def laad():
    try:
        data = haal_weer()
        tekst = f"{data['temperature_2m']} °C, wind {data['wind_speed_10m']} km/u"
    except Exception:
        tekst = "Weer niet beschikbaar"
    uitvoer.config(text=tekst)`),
      step("Koppel de knop", "Een knop start het vernieuwen.", `tk.Button(venster, text="Vernieuwen", command=vernieuw).pack(pady=(0, 16))`),
      step("Toon de laatste update", "Een tijdstempel maakt de gegevens betrouwbaarder.", `from datetime import datetime

tijd = tk.Label(venster, text="", font=("Segoe UI", 10), fg="#6f6d62")
tijd.pack(pady=(0, 12))`)
    ],
    ["Test de foutmelding door de URL tijdelijk fout te typen.", "Roep een API niet bij elke toetsaanslag aan."]
  ),
  idea(
    "tekst-editor",
    "Kleine tekstverwerker",
    "📄",
    "GUI",
    "Gemiddeld",
    "90 min",
    "Maak een editor met openen, opslaan en een menubalk.",
    "Je leert een Text-widget, menu's en bestandsdialogen gebruiken. Dit is een echte desktop-app in miniatuur.",
    ["tkinter", "text", "filedialog", "menu"],
    [
      step("Maak het tekstvak", "Een Text-widget vult het venster en groeit mee.", `import tkinter as tk

venster = tk.Tk()
venster.title("Kladblok")
venster.geometry("700x500")

tekst = tk.Text(venster, wrap="word", undo=True, font=("Consolas", 12))
tekst.pack(fill="both", expand=True)

venster.mainloop()`),
      step("Open een bestand", "filedialog vraagt de gebruiker om een bestand.", `from tkinter import filedialog

def openen():
    pad = filedialog.askopenfilename(filetypes=[("Tekst", "*.txt"), ("Alle bestanden", "*.*")])
    if pad:
        with open(pad, encoding="utf-8") as bestand:
            tekst.delete("1.0", "end")
            tekst.insert("1.0", bestand.read())`),
      step("Sla het bestand op", "Vraag een pad en schrijf de inhoud weg.", `def opslaan():
    pad = filedialog.asksaveasfilename(defaultextension=".txt")
    if pad:
        with open(pad, "w", encoding="utf-8") as bestand:
            bestand.write(tekst.get("1.0", "end-1c"))`),
      step("Voeg een menubalk toe", "Menu's houden de app overzichtelijk.", `menu = tk.Menu(venster)
bestand_menu = tk.Menu(menu, tearoff=False)
bestand_menu.add_command(label="Openen", command=openen)
bestand_menu.add_command(label="Opslaan", command=opslaan)
menu.add_cascade(label="Bestand", menu=bestand_menu)
venster.config(menu=menu)`),
      step("Waarschuw bij sluiten", "Voorkom dat iemand per ongeluk werk verliest.", `from tkinter import messagebox

def sluiten():
    if messagebox.askyesno("Afsluiten", "Wil je het venster sluiten?"):
        venster.destroy()

venster.protocol("WM_DELETE_WINDOW", sluiten)`)
    ],
    ["Test met een bestand met emoji's en Nederlandse tekens.", "Gebruik utf-8 bij lezen en schrijven."]
  ),
  idea(
    "fotoviewer",
    "Fotoviewer",
    "🖼️",
    "GUI",
    "Gemiddeld",
    "70 min",
    "Bekijk afbeeldingen uit een map met een volgende-knop.",
    "Je leert Pillow gebruiken om afbeeldingen te schalen, en je bouwt een eenvoudige gallerij met navigatie.",
    ["tkinter", "pillow", "afbeeldingen", "navigatie"],
    [
      step("Installeer Pillow", "Pillow is de standaardbibliotheek voor afbeeldingen in Python.", `# In de terminal:
# pip install pillow

from PIL import Image, ImageTk`),
      step("Laad een afbeelding", "ImageTk maakt van een afbeelding een widget die tkinter begrijpt.", `import tkinter as tk
from PIL import Image, ImageTk

venster = tk.Tk()
label = tk.Label(venster)
label.pack()

foto = Image.open("foto.jpg")
foto.thumbnail((800, 500))
beeld = ImageTk.PhotoImage(foto)
label.config(image=beeld)
label.image = beeld

venster.mainloop()`),
      step("Lees een hele map", "Sorteer de bestanden zodat de volgorde voorspelbaar is.", `from pathlib import Path

EXTENSIES = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
fotos = sorted(p for p in Path(".").iterdir() if p.suffix.lower() in EXTENSIES)

index = 0`),
      step("Toon de volgende foto", "Verhoog de index en houd hem binnen de lijst.", `def volgende():
    global index, beeld
    if not fotos:
        return
    index = (index + 1) % len(fotos)
    foto = Image.open(fotos[index])
    foto.thumbnail((800, 500))
    beeld = ImageTk.PhotoImage(foto)
    label.config(image=beeld)
    label.image = beeld

tk.Button(venster, text="Volgende", command=volgende).pack()`),
      step("Toon de bestandsnaam", "Een label met de naam maakt de viewer af.", `naam = tk.Label(venster, text=str(fotos[index].name))
naam.pack()

# Werk naam.config(text=...) bij in volgende()`)
    ],
    ["Test met één afbeelding en met een lege map.", "Bewaar een verwijzing naar PhotoImage, anders verdwijnt de afbeelding."]
  ),
  idea(
    "boodschappen-gui",
    "Boodschappenlijst",
    "🛒",
    "GUI",
    "Beginner",
    "45 min",
    "Maak een boodschappenlijst met aantallen en een totaal.",
    "Je leert invoervelden combineren en een lijst met prijzen bijhouden. Je oefent met floats en nette bedragen.",
    ["tkinter", "floats", "lijsten", "formatteren"],
    [
      step("Maak de velden", "Naam, aantal en prijs krijgen elk een eigen invoerveld.", `import tkinter as tk

venster = tk.Tk()
venster.title("Boodschappen")

naam = tk.Entry(venster, width=24)
aantal = tk.Entry(venster, width=6)
prijs = tk.Entry(venster, width=8)

naam.grid(row=0, column=0, padx=4, pady=4)
aantal.grid(row=0, column=1)
prijs.grid(row=0, column=2)`),
      step("Voeg een product toe", "Zet de invoer om naar een getal en toon een regel.", `lijst = tk.Listbox(venster, width=46, height=10)
lijst.grid(row=1, column=0, columnspan=3, padx=4, pady=4)

def toevoegen():
    product = naam.get().strip()
    try:
        aantal_waarde = int(aantal.get())
        prijs_waarde = float(prijs.get().replace(",", "."))
    except ValueError:
        return
    if product:
        lijst.insert("end", f"{product} x{aantal_waarde} - € {prijs_waarde * aantal_waarde:.2f}")`),
      step("Bereken het totaal", "Loop door de regels en tel de bedragen op.", `import re

def totaal():
    som = 0.0
    for regel in lijst.get(0, "end"):
        match = re.search(r"€ ([0-9.]+)", regel)
        if match:
            som += float(match.group(1))
    totaal_label.config(text=f"Totaal: € {som:.2f}")`),
      step("Maak het overzicht af", "Een totaal-label en een wis-knop ronden de app af.", `totaal_label = tk.Label(venster, text="Totaal: € 0.00", font=("Segoe UI", 14, "bold"))
totaal_label.grid(row=2, column=0, columnspan=2)

tk.Button(venster, text="Bereken", command=totaal).grid(row=2, column=2)
tk.Button(venster, text="Wis", command=lambda: lijst.delete(0, "end")).grid(row=3, column=0, columnspan=3)`),
      step("Valideer de prijs", "Ondersteun zowel 1,50 als 1.50.", `def lees_prijs(tekst):
    return float(tekst.replace(",", "."))`)
    ],
    ["Test met een leeg veld en met tekst in het prijsveld.", "Rond bedragen pas op het einde af."]
  ),
  idea(
    "quiz-gui",
    "Quiz met knoppen",
    "❓",
    "GUI",
    "Gemiddeld",
    "75 min",
    "Bouw een quiz met meerkeuzevragen in een venster.",
    "Je leert een vragenlijst doorlopen, knoppen hergebruiken en de score bijhouden zonder de app opnieuw te starten.",
    ["tkinter", "lijsten", "state", "knoppen"],
    [
      step("Zet de vragen klaar", "Elke vraag heeft tekst, opties en het juiste antwoord.", `vragen = [
    {"vraag": "Wat is 2 + 2?", "opties": ["3", "4", "5"], "juist": "4"},
    {"vraag": "Welke taal is dit?", "opties": ["Python", "HTML", "CSS"], "juist": "Python"},
]`),
      step("Toon een vraag", "Verwijder oude knoppen en maak nieuwe knoppen per optie.", `import tkinter as tk

venster = tk.Tk()
vraag_label = tk.Label(venster, text="", font=("Segoe UI", 16, "bold"))
vraag_label.pack(pady=12)

knoppen_frame = tk.Frame(venster)
knoppen_frame.pack(pady=8)

score = 0
nummer = 0

def toon_vraag():
    vraag_label.config(text=vragen[nummer]["vraag"])
    for widget in knoppen_frame.winfo_children():
        widget.destroy()
    for optie in vragen[nummer]["opties"]:
        tk.Button(knoppen_frame, text=optie, width=18,
                  command=lambda o=optie: kies(o)).pack(pady=3)`),
      step("Controleer het antwoord", "Vergelijk de gekozen optie en ga verder.", `def kies(optie):
    global score, nummer
    if optie == vragen[nummer]["juist"]:
        score += 1
    nummer += 1
    if nummer < len(vragen):
        toon_vraag()
    else:
        toon_einde()`),
      step("Toon het einde", "Laat de score zien en bied opnieuw beginnen aan.", `def toon_einde():
    vraag_label.config(text=f"Klaar! Score: {score}/{len(vragen)}")
    for widget in knoppen_frame.winfo_children():
        widget.destroy()
    tk.Button(knoppen_frame, text="Opnieuw", command=opnieuw).pack()

def opnieuw():
    global score, nummer
    score = 0
    nummer = 0
    toon_vraag()`),
      step("Start de quiz", "Roep de eerste vraag aan voordat mainloop begint.", `toon_vraag()
venster.mainloop()`)
    ],
    ["Test met één vraag en met veel vragen.", "Gebruik een lambda met standaardargument voor de gekozen optie."]
  ),
  idea(
    "pixel-tekenen",
    "Pixel-tekenprogramma",
    "🟦",
    "GUI",
    "Gemiddeld",
    "90 min",
    "Teken pixel voor pixel op een raster.",
    "Je leert een Canvas gebruiken, muisklikken omzetten naar vakjes en een palet maken. Je bouwt een mini-tekenprogramma.",
    ["tkinter", "canvas", "muis", "raster"],
    [
      step("Maak een raster", "Teken een grid van vierkanten op een Canvas.", `import tkinter as tk

GROOTTE = 16
VAK = 28

venster = tk.Tk()
canvas = tk.Canvas(venster, width=GROOTTE * VAK, height=GROOTTE * VAK, bg="white")
canvas.pack()

for x in range(GROOTTE):
    for y in range(GROOTTE):
        canvas.create_rectangle(x * VAK, y * VAK, (x + 1) * VAK, (y + 1) * VAK,
                                outline="#dddddd")`),
      step("Kleur een vakje", "Bereken het vakje op basis van de muispositie.", `kleur = "#1f5eff"

def kleur_vak(event):
    x = event.x // VAK
    y = event.y // VAK
    canvas.create_rectangle(x * VAK, y * VAK, (x + 1) * VAK, (y + 1) * VAK,
                            fill=kleur, outline="#dddddd")

canvas.bind("<Button-1>", kleur_vak)`),
      step("Sleep om te tekenen", "Koppel ook de muisbeweging terwijl de knop ingedrukt is.", `def sleep(event):
    kleur_vak(event)

canvas.bind("<B1-Motion>", sleep)`),
      step("Voeg een palet toe", "Knoppen kiezen een kleur uit een kleine lijst.", `kleuren = ["#1f5eff", "#ff6b4a", "#ffd43b", "#0f9d58", "#a21caf", "#15150f"]

palet = tk.Frame(venster)
palet.pack(pady=8)

def kies(kleurwaarde):
    global kleur
    kleur = kleurwaarde

for waarde in kleuren:
    tk.Button(palet, bg=waarde, width=3, command=lambda w=waarde: kies(w)).pack(side="left", padx=3)`),
      step("Wis het canvas", "Een wis-knop maakt opnieuw beginnen mogelijk.", `tk.Button(venster, text="Wissen", command=lambda: canvas.delete("all")).pack(pady=4)`),
    ],
    ["Test op een hoge resolutie; gebruik vaste vakgroottes.", "Bewaar je tekening later als afbeelding met de canvas-postscript."]
  ),
  idea(
    "systeem-dashboard",
    "Systeemdashboard",
    "📊",
    "GUI",
    "Gevorderd",
    "2 uur",
    "Toon live je CPU, geheugen en schijfgebruik.",
    "Je leert psutil gebruiken en een dashboard bouwen dat zichzelf elke seconde ververst. Je oefent met metingen en nette visualisaties.",
    ["psutil", "tkinter", "metingen", "after"],
    [
      step("Installeer psutil", "psutil leest systeeminformatie op Windows, macOS en Linux.", `# pip install psutil
import psutil`),
      step("Lees de metingen", "Vraag CPU en geheugen op en maak ze leesbaar.", `def metingen():
    cpu = psutil.cpu_percent(interval=None)
    geheugen = psutil.virtual_memory()
    schijf = psutil.disk_usage("/")
    return {
        "cpu": cpu,
        "ram": geheugen.percent,
        "schijf": schijf.percent,
    }`),
      step("Bouw de labels", "Elke meting krijgt een label en een voortgangsbalk.", `import tkinter as tk
from tkinter import ttk

venster = tk.Tk()
venster.title("Systeem")

labels = {}
balken = {}

for rij, naam in enumerate(["cpu", "ram", "schijf"]):
    tk.Label(venster, text=naam.upper()).grid(row=rij, column=0, padx=10, pady=6, sticky="w")
    balk = ttk.Progressbar(venster, length=260, maximum=100)
    balk.grid(row=rij, column=1, padx=10)
    label = tk.Label(venster, text="0%")
    label.grid(row=rij, column=2, padx=10)
    labels[naam] = label
    balken[naam] = balk`),
      step("Ververs elke seconde", "after() houdt de GUI responsief.", `def update():
    data = metingen()
    for naam, waarde in data.items():
        balken[naam]["value"] = waarde
        labels[naam].config(text=f"{waarde:.0f}%")
    venster.after(1000, update)

update()`),
      step("Maak een waarschuwing", "Kleur rood boven 85 procent.", `def update():
    data = metingen()
    for naam, waarde in data.items():
        balken[naam]["value"] = waarde
        labels[naam].config(text=f"{waarde:.0f}%",
                            fg="#e11d48" if waarde > 85 else "#15150f")
    venster.after(1000, update)`),
    ],
    ["Gebruik interval=None alleen na de eerste meting; anders krijg je 0.", "Test op je eigen computer, niet op een gedeelde server."]
  ),

  idea(
    "turtle-schilderij",
    "Turtle-schilderij",
    "🐢",
    "Kunst & Creatief",
    "Beginner",
    "45 min",
    "Laat een schildpad een kleurrijk kunstwerk tekenen.",
    "Je leert turtle gebruiken, lussen combineren en kleuren kiezen. Kleine veranderingen in de hoek geven compleet andere kunst.",
    ["turtle", "lussen", "kleuren", "random"],
    [
      step("Start turtle", "Turtle opent een tekenvenster en tekent met een pen.", `import turtle

turtle.bgcolor("#15150f")
turtle.pensize(2)
turtle.speed(0)`),
      step("Teken een spiraal", "Een lus met een steeds grotere stap maakt een spiraal.", `kleuren = ["#ff6b4a", "#ffd43b", "#1f5eff", "#0f9d58", "#a21caf"]

for i in range(180):
    turtle.pencolor(kleuren[i % len(kleuren)])
    turtle.forward(i * 2)
    turtle.right(91)`),
      step("Voeg willekeur toe", "Random maakt elk kunstwerk uniek.", `import random

for _ in range(60):
    turtle.pencolor(random.choice(kleuren))
    turtle.forward(random.randint(20, 120))
    turtle.right(random.choice([45, 60, 90, 120]))`),
      step("Bewaar het resultaat", "Sla je kunstwerk op als afbeelding.", `turtle.done()`),
      step("Experimenteer met kleuren", "Gebruik een eigen palet in plaats van de standaardkleuren.", `palet = ["#f7f5ef", "#ff6b4a", "#ffd43b", "#0ea5a4"]
for i in range(120):
    turtle.pencolor(palet[i % len(palet)])
    turtle.circle(40 + i)
    turtle.right(24)`),
    ],
    ["Zet de snelheid op 0 voor grote tekeningen.", "Bewaar tussenversies met een screenshot voordat je verder experimenteert."]
  ),
  idea(
    "ascii-kunst",
    "ASCII-kunst",
    "🔤",
    "Kunst & Creatief",
    "Beginner",
    "40 min",
    "Maak letters en patronen met alleen teksttekens.",
    "Je leert werken met tekst, lussen en eenvoudige vormen. Je bouwt een generator die tekst omzet naar een patroon.",
    ["strings", "lussen", "print", "tekst"],
    [
      step("Teken een driehoek", "Een lus met een groeiend aantal sterren maakt een driehoek.", `for rij in range(1, 8):
    print(" " * (8 - rij) + "*" * (rij * 2 - 1))`),
      step("Maak een tekstbanner", "Herhaal elk teken en voeg een rand toe.", `def banner(tekst):
    rand = "+" + "-" * (len(tekst) * 2 + 2) + "+"
    print(rand)
    print("| " + " ".join(tekst.upper()) + " |")
    print(rand)

banner("EasyCodey")`),
      step("Lees tekst van de gebruiker", "Gebruik een korte vraag en val terug op een standaardtekst.", `tekst = input("Tekst: ").strip() or "Python"
banner(tekst)`),
      step("Maak een patroon", "Combineer meerdere tekens tot een herhaalbaar motief.", `motief = ["/\\", "\\/"]
for rij in range(6):
    print(" ".join(motief[(rij + kolom) % 2] for kolom in range(8)))`),
      step("Bewaar je kunst", "Schrijf de uitvoer naar een tekstbestand.", `from pathlib import Path

regels = ["*" * (rij + 1) for rij in range(6)]
Path("kunst.txt").write_text("\\n".join(regels), encoding="utf-8")`),
    ],
    ["Test met accenten en emoji's; niet elke console toont ze even breed.", "Gebruik een monospace-font voor het beste resultaat."]
  ),
  idea(
    "kleurenpalet",
    "Kleurenpalet-generator",
    "🎨",
    "Kunst & Creatief",
    "Beginner",
    "50 min",
    "Genereer mooie kleurenpaletten met hexcodes.",
    "Je leert RGB en hexadecimaal omrekenen en harmonieuze kleuren maken. Je krijgt een palet dat je in elke website kunt gebruiken.",
    ["rgb", "hex", "random", "formatteren"],
    [
      step("Maak een hexkleur", "Een hexcode bestaat uit drie paren: rood, groen en blauw.", `import random

def hexkleur(rood, groen, blauw):
    return f"#{rood:02x}{groen:02x}{blauw:02x}"

print(hexkleur(31, 94, 255))`),
      step("Genereer een basiskleur", "Kies willekeurige waarden tussen 0 en 255.", `def basiskleur():
    return tuple(random.randint(40, 220) for _ in range(3))

print(basiskleur())`),
      step("Maak een palet", "Verschuif de basiskleur per stap en houd de waarden binnen bereik.", `def palet(basis, aantal=5):
    kleuren = []
    for stap in range(aantal):
        deel = stap / (aantal - 1)
        kleur = tuple(round(k + (255 - k) * deel * 0.7) for k in basis)
        kleuren.append(kleur)
    return kleuren

for kleur in palet(basiskleur()):
    print(hexkleur(*kleur))`),
      step("Toon het palet", "Een blok met blokjes maakt het resultaat zichtbaar in de terminal.", `for kleur in palet(basiskleur()):
    blok = "  " * 12
    print(f"\\033[48;2;{kleur[0]};{kleur[1]};{kleur[2]}m{blok}\\033[0m {hexkleur(*kleur)}")`),
      step("Sla het palet op", "Bewaar de hexcodes in een tekstbestand.", `with open("palet.txt", "w", encoding="utf-8") as bestand:
    for kleur in palet(basiskleur()):
        bestand.write(hexkleur(*kleur) + "\\n")`),
    ],
    ["Test je palet op leesbaarheid: donkere tekst op lichte kleuren.", "Gebruik een vaste seed als je hetzelfde palet opnieuw wilt maken."]
  ),
  idea(
    "mozaiek-maker",
    "Mozaïek-maker",
    "🧩",
    "Kunst & Creatief",
    "Gemiddeld",
    "75 min",
    "Maak een mozaïek van gekleurde vierkantjes.",
    "Je leert een grid opbouwen en kleuren kiezen op basis van een patroon. Je kunt het resultaat als SVG opslaan, zonder externe bibliotheek.",
    ["svg", "grid", "kleuren", "bestanden"],
    [
      step("Kies een patroon", "Een eenvoudige functie bepaalt de kleur per vakje.", `def kleur_voor(x, y):
    if (x + y) % 3 == 0:
        return "#1f5eff"
    if (x * y) % 4 == 0:
        return "#ffd43b"
    return "#ff6b4a"`),
      step("Bouw de SVG", "SVG is tekst en werkt in elke browser.", `VAK = 40
GROOTTE = 12

delen = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{VAK * GROOTTE}" height="{VAK * GROOTTE}">']

for y in range(GROOTTE):
    for x in range(GROOTTE):
        kleur = kleur_voor(x, y)
        delen.append(
            f'<rect x="{x * VAK}" y="{y * VAK}" width="{VAK}" height="{VAK}" fill="{kleur}"/>'
        )

delen.append("</svg>")`),
      step("Schrijf het bestand", "Open het resultaat daarna in je browser.", `from pathlib import Path

Path("mozaiek.svg").write_text("".join(delen), encoding="utf-8")
print("Klaar: open mozaiek.svg")`),
      step("Maak het interessanter", "Gebruik diagonalen en afstand tot het midden.", `import math

def kleur_voor(x, y):
    afstand = math.dist((x, y), (GROOTTE / 2, GROOTTE / 2))
    if afstand < 3:
        return "#ffd43b"
    if afstand < 6:
        return "#ff6b4a"
    return "#1f5eff"`),
      step("Voeg een titel toe", "Met tekst in de SVG maak je er een poster van.", `delen.insert(1, '<rect width="100%" height="100%" fill="#15150f"/>')`),
    ],
    ["Open de SVG in Chrome of Edge om te controleren of hij klopt.", "Houd kleuren en groottes bovenaan als constanten."]
  ),
  idea(
    "fractal-kunst",
    "Fractal-kunst",
    "🌀",
    "Kunst & Creatief",
    "Gevorderd",
    "2 uur",
    "Teken de Mandelbrot-set als kleurrijke afbeelding.",
    "Je leert complexe getallen, iteraties en pixels. Je schrijft een PPM-afbeelding zonder externe bibliotheken, of gebruikt Pillow.",
    ["complexe getallen", "iteratie", "pixels", "wiskunde"],
    [
      step("Test één punt", "De Mandelbrot-set herhaalt z = z² + c en kijkt of z ontsnapt.", `def iteraties(c, maximum=50):
    z = 0
    for n in range(maximum):
        z = z * z + c
        if abs(z) > 2:
            return n
    return maximum

print(iteraties(complex(0, 0)))`),
      step("Maak een kleur", "Koppel het aantal iteraties aan een kleur.", `def kleur(n, maximum=50):
    if n == maximum:
        return (10, 10, 15)
    deel = n / maximum
    return (int(255 * deel), int(120 * (1 - deel)), int(255 * (1 - deel)))`),
      step("Bereken een klein beeld", "Een lus over pixels is genoeg voor een eerste versie.", `BREEDTE, HOOGTE = 240, 160
rijen = []

for y in range(HOOGTE):
    rij = []
    for x in range(BREEDTE):
        c = complex(-2.2 + 3.0 * x / BREEDTE, -1.2 + 2.4 * y / HOOGTE)
        rij.append(kleur(iteraties(c)))
    rijen.append(rij)`),
      step("Schrijf een PPM-bestand", "PPM is een simpel tekstformaat dat veel viewers openen.", `with open("fractal.ppm", "w", encoding="ascii") as bestand:
    bestand.write(f"P3\\n{BREEDTE} {HOOGTE}\\n255\\n")
    for rij in rijen:
        for r, g, b in rij:
            bestand.write(f"{r} {g} {b} ")
        bestand.write("\\n")`),
      step("Zoom in", "Verklein het bereik rond een interessant punt.", `# Probeer: x van -0.8 tot -0.7, y van 0.05 tot 0.15
# Meer iteraties geven meer detail, maar kosten tijd.`),
    ],
    ["Begin klein: 240 bij 160 pixels is snel genoeg.", "Verhoog het maximum aantal iteraties alleen als je meer detail nodig hebt."]
  ),
  idea(
    "pixel-art-converter",
    "Pixel-art converter",
    "👾",
    "Kunst & Creatief",
    "Gemiddeld",
    "90 min",
    "Zet een foto om naar pixel-art.",
    "Je leert afbeeldingen verkleinen en kleuren versimpelen met Pillow. Het resultaat voelt als echte game-art.",
    ["pillow", "afbeeldingen", "resize", "kleuren"],
    [
      step("Open de foto", "Pillow leest bijna elk beeldformaat.", `from PIL import Image

foto = Image.open("foto.jpg").convert("RGB")
print(foto.size)`),
      step("Verklein en vergroot", "Eerst verkleinen en daarna met nearest-neighbor vergroten geeft harde pixels.", `KLEIN = (64, 64)

pixel = foto.resize(KLEIN, Image.Resampling.LANCZOS)
pixel = pixel.resize((640, 640), Image.Resampling.NEAREST)
pixel.save("pixel-art.png")`),
      step("Beperk het aantal kleuren", "Minder kleuren maken het resultaat grafischer.", `pixel = foto.resize(KLEIN).convert("P", palette=Image.Palette.ADAPTIVE, colors=16)
pixel = pixel.resize((640, 640), Image.Resampling.NEAREST)
pixel.convert("RGB").save("pixel-art.png")`),
      step("Maak een poster", "Voeg een achtergrond en rand toe met ImageOps.", `from PIL import ImageOps

pixel = ImageOps.expand(pixel.convert("RGB"), border=24, fill="#15150f")
pixel.save("pixel-poster.png")`),
      step("Test verschillende groottes", "Kleinere tussenstappen geven grovere pixels.", `for grootte in (32, 48, 64, 96):
    klein = foto.resize((grootte, grootte), Image.Resampling.LANCZOS)
    klein.resize((640, 640), Image.Resampling.NEAREST).save(f"pixel-{grootte}.png")`),
    ],
    ["Gebruik nearest-neighbor voor het vergroten, anders wordt het wazig.", "Test met een foto met duidelijke vormen."]
  ),
  idea(
    "gedichten-generator",
    "Gedichtengenerator",
    "✒️",
    "Kunst & Creatief",
    "Beginner",
    "45 min",
    "Laat Python grappige of mooie gedichten maken.",
    "Je leert lijsten combineren en willekeurige keuzes maken. Met een kleine woordenschat maak je verrassend veel combinaties.",
    ["random", "lijsten", "strings", "creatief"],
    [
      step("Verzamel woorden", "Gebruik drie lijsten met zelfstandige naamwoorden, werkwoorden en bijvoeglijke naamwoorden.", `import random

dingen = ["maan", "rivier", "robot", "fiets", "wolk"]
werkwoorden = ["droomt", "danst", "zoekt", "vergeet", "fluistert"]
kleuren = ["zachte", "donkere", "gouden", "stille", "wilde"]`),
      step("Maak een regel", "Kies één woord uit elke lijst.", `def regel():
    return f"De {random.choice(kleuren)} {random.choice(dingen)} {random.choice(werkwoorden)}."`),
      step("Maak een gedicht", "Combineer vier regels en houd ruimte voor een titel.", `def gedicht():
    titel = f"Over {random.choice(dingen)} en {random.choice(dingen)}"
    regels = [regel() for _ in range(4)]
    return titel + "\\n\\n" + "\\n".join(regels)

print(gedicht())`),
      step("Bewaar je gedicht", "Schrijf het resultaat naar een bestand.", `from pathlib import Path

Path("gedicht.txt").write_text(gedicht(), encoding="utf-8")`),
      step("Maak het persoonlijk", "Vraag de gebruiker om een thema en filter de woorden.", `thema = input("Thema: ").strip()
if thema:
    titel = f"Over {thema}"
    print(titel + "\\n\\n" + "\\n".join(regel() for _ in range(4)))`),
    ],
    ["Bewaar een paar favorieten; dat is goede inspiratie.", "Vermijd te veel bijvoeglijke naamwoorden achter elkaar."]
  ),
  idea(
    "poster-generator",
    "Poster-generator",
    "🖼️",
    "Kunst & Creatief",
    "Gemiddeld",
    "90 min",
    "Maak een poster met tekst en vormen als PNG.",
    "Je leert Pillow gebruiken om tekst, rechthoeken en kleuren te combineren. Je bouwt een generator voor eenvoudige affiches.",
    ["pillow", "tekst", "vormen", "png"],
    [
      step("Maak een canvas", "Een leeg beeld met een achtergrondkleur is je poster.", `from PIL import Image, ImageDraw

BREEDTE, HOOGTE = 1080, 1350
beeld = Image.new("RGB", (BREEDTE, HOOGTE), "#15150f")
draw = ImageDraw.Draw(beeld)`),
      step("Teken vormen", "Rechthoeken en cirkels geven de poster ritme.", `draw.rectangle((80, 80, 1000, 1270), outline="#ffd43b", width=6)
draw.ellipse((620, 220, 980, 580), fill="#ff6b4a")
draw.rectangle((120, 760, 700, 820), fill="#1f5eff")`),
      step("Voeg tekst toe", "Gebruik een systeemfont of een eigen TTF-bestand.", `from PIL import ImageFont

font_groot = ImageFont.truetype("arial.ttf", 96)
font_klein = ImageFont.truetype("arial.ttf", 36)

draw.text((120, 880), "MAAK", font=font_groot, fill="#fffefb")
draw.text((120, 980), "IETS", font=font_groot, fill="#ffd43b")
draw.text((120, 1120), "met Python", font=font_klein, fill="#cfc9b8")`),
      step("Sla de poster op", "PNG is scherp en ondersteunt veel kleuren.", `beeld.save("poster.png")
print("Klaar: poster.png")`),
      step("Maak varianten", "Verander de kleuren en tekst per run.", `import random

kleuren = ["#ff6b4a", "#ffd43b", "#1f5eff", "#0f9d58", "#a21caf"]
accent = random.choice(kleuren)
draw.ellipse((620, 220, 980, 580), fill=accent)`),
    ],
    ["Test of het font op je systeem bestaat; gebruik anders een pad naar een TTF-bestand.", "Houd tekst binnen de veilige marge van je poster."]
  ),
  idea(
    "muziek-generator",
    "Muziek-generator",
    "🎵",
    "Kunst & Creatief",
    "Gevorderd",
    "2 uur",
    "Schrijf een kort muziekstuk als WAV-bestand.",
    "Je leert hoe geluid als getallen werkt: samples, frequenties en een WAV-header. Je genereert echte tonen zonder externe bibliotheek.",
    ["wave", "wiskunde", "frequenties", "bestanden"],
    [
      step("Maak één toon", "Een sinusgolf met een vaste frequentie klinkt als een toon.", `import math
import wave
import struct

FREQ = 440
RATE = 44100
duur = 1.0

samples = [
    int(32767 * 0.3 * math.sin(2 * math.pi * FREQ * i / RATE))
    for i in range(int(RATE * duur))
]`),
      step("Schrijf een WAV-bestand", "De wave-module schrijft de header en de samples.", `with wave.open("toon.wav", "w") as bestand:
    bestand.setnchannels(1)
    bestand.setsampwidth(2)
    bestand.setframerate(RATE)
    for sample in samples:
        bestand.writeframes(struct.pack("<h", sample))`),
      step("Maak een melodie", "Zet meerdere noten achter elkaar.", `noten = [523.25, 587.33, 659.25, 523.25]
alles = []

for freq in noten:
    for i in range(int(RATE * 0.4)):
        alles.append(int(32767 * 0.25 * math.sin(2 * math.pi * freq * i / RATE)))`),
      step("Voeg een fade toe", "Een fade voorkomt klikken aan het begin en einde.", `def met_fade(samples, lengte=2000):
    for i in range(min(lengte, len(samples))):
        samples[i] = int(samples[i] * i / lengte)
        samples[-i - 1] = int(samples[-i - 1] * i / lengte)
    return samples`),
      step("Experimenteer met akkoorden", "Tel twee frequenties op voor een rijkere klank.", `def toon(freq, duur=0.5):
    return [
        int(32767 * 0.18 * (math.sin(2 * math.pi * freq * i / RATE)
                            + math.sin(2 * math.pi * freq * 1.5 * i / RATE)))
        for i in range(int(RATE * duur))
    ]`),
    ],
    ["Houd het volume laag; harde samples kunnen vervormen.", "Gebruik een fade om klikken te voorkomen."]
  ),
  idea(
    "animatie-maker",
    "Frame-animatie",
    "🎞️",
    "Kunst & Creatief",
    "Gemiddeld",
    "90 min",
    "Maak een bewegende animatie uit losse frames.",
    "Je leert hoe animatie werkt: elk frame is een beeld en snel wisselen geeft beweging. Je schrijft de frames als PNG's.",
    ["pillow", "frames", "animatie", "wiskunde"],
    [
      step("Maak één frame", "Teken een cirkel op een canvas.", `from PIL import Image, ImageDraw

def frame(positie):
    beeld = Image.new("RGB", (400, 400), "#15150f")
    draw = ImageDraw.Draw(beeld)
    draw.ellipse((positie, 170, positie + 60, 230), fill="#ffd43b")
    return beeld

frame(150).save("frame-0.png")`),
      step("Genereer een reeks", "Verschuif de cirkel met een sinus voor een vloeiende beweging.", `import math

for nummer in range(60):
    x = 170 + int(120 * math.sin(nummer / 60 * 2 * math.pi))
    frame(x).save(f"frames/frame-{nummer:03d}.png")`),
      step("Maak een GIF", "Pillow kan frames samenvoegen tot een animatie.", `frames = [Image.open(f"frames/frame-{i:03d}.png") for i in range(60)]
frames[0].save("animatie.gif", save_all=True, append_images=frames[1:], duration=40, loop=0)`),
      step("Voeg kleur toe", "Laat de kleur meebewegen met de positie.", `kleur = (255, int(120 + 100 * math.sin(nummer / 10)), 60)`),
      step("Test de animatie", "Open de GIF in je browser of in een image viewer.", `print("Klaar: animatie.gif")`),
    ],
    ["Maak eerst 10 frames; dat is sneller testen.", "Houd de framegrootte klein voor een klein bestand."]
  ),

  idea(
    "tafels-oefenen",
    "Tafels oefenen",
    "✖️",
    "Onderwijs",
    "Beginner",
    "40 min",
    "Oefen de tafels met willekeurige vragen en feedback.",
    "Je leert random, input en een score bijhouden. Je bouwt een oefenprogramma dat fouten uitlegt in plaats van alleen te zeggen dat het fout is.",
    ["random", "input", "score", "uitleg"],
    [
      step("Stel een vraag", "Kies twee getallen en bereken het juiste antwoord.", `import random

tafel = random.randint(2, 9)
factor = random.randint(2, 9)
antwoord = int(input(f"Wat is {tafel} x {factor}? "))`),
      step("Controleer het antwoord", "Geef uitleg bij een fout antwoord.", `if antwoord == tafel * factor:
    print("Goed!")
else:
    print(f"Niet goed. {tafel} x {factor} = {tafel * factor}.")`),
      step("Maak een oefenreeks", "Herhaal tien vragen en houd de score bij.", `score = 0
for _ in range(10):
    tafel = random.randint(2, 9)
    factor = random.randint(2, 9)
    antwoord = int(input(f"{tafel} x {factor} = "))
    if antwoord == tafel * factor:
        score += 1
        print("Goed!")
    else:
        print(f"Helaas, het is {tafel * factor}.")

print(f"Score: {score}/10")`),
      step("Valideer de invoer", "Vang fouten op als iemand letters typt.", `def vraag_getal(tekst):
    while True:
        try:
            return int(input(tekst))
        except ValueError:
            print("Typ een getal.")`),
      step("Kies een moeilijkheidsgraad", "Beperk de getallen voor beginners.", `niveau = input("Makkelijk of moeilijk? ").lower()
maximum = 5 if niveau == "makkelijk" else 12`),
    ],
    ["Toon altijd het juiste antwoord na een fout.", "Gebruik een vaste seed om je test te herhalen."]
  ),
  idea(
    "spelling-quiz",
    "Spellingquiz",
    "🔠",
    "Onderwijs",
    "Beginner",
    "50 min",
    "Oefen spelling met meerkeuzevragen.",
    "Je leert een quiz bouwen met lijsten en dictionaries. Je voegt uitleg toe, zodat een fout antwoord meteen een leermoment wordt.",
    ["lijsten", "dict", "quiz", "spelling"],
    [
      step("Maak de vragen", "Bewaar het juiste woord en twee afleiders.", `vragen = [
    {"goed": "gebeurt", "fout": ["gebeurd", "gebeurt niet"], "uitleg": "Tegenwoordige tijd: gebeurt."},
    {"goed": "cadeau", "fout": ["kadeau", "cado"], "uitleg": "Cadeau schrijf je met een c."},
]`),
      step("Stel de vraag", "Schud de opties en toon ze met letters.", `import random

for vraag in vragen:
    opties = [vraag["goed"], *vraag["fout"]]
    random.shuffle(opties)
    print("Kies het juiste woord:")
    for letter, optie in zip("ABC", opties):
        print(f"{letter}. {optie}")`),
      step("Controleer het antwoord", "Vergelijk de gekozen letter met het juiste woord.", `keuze = input("Antwoord (A/B/C): ").strip().upper()
gekozen = opties["ABC".index(keuze)]
if gekozen == vraag["goed"]:
    print("Goed!")
else:
    print(f"Niet goed. {vraag['uitleg']}")`),
      step("Houd de score bij", "Tel de juiste antwoorden en toon een eindscore.", `score = 0
# In de lus:
if gekozen == vraag["goed"]:
    score += 1
print(f"Score: {score}/{len(vragen)}")`),
      step("Lees vragen uit een bestand", "Zo kun je de quiz uitbreiden zonder code te wijzigen.", `import json
from pathlib import Path

vragen = json.loads(Path("spelling.json").read_text(encoding="utf-8"))`),
    ],
    ["Gebruik verzonnen woorden of woorden uit je eigen lesstof.", "Toon de uitleg altijd, ook bij een goed antwoord."]
  ),
  idea(
    "rekenracer",
    "Rekenracer",
    "🏁",
    "Onderwijs",
    "Gemiddeld",
    "60 min",
    "Los zoveel mogelijk sommen op binnen 60 seconden.",
    "Je leert tijd meten, een lus met een deadline maken en rekenen combineren. Je bouwt een klein spel met een echte score.",
    ["time", "random", "while", "score"],
    [
      step("Start de timer", "Onthoud de starttijd en bereken de resterende seconden.", `import time

start = time.time()
LIMIET = 60
score = 0`),
      step("Stel sommen", "Kies een bewerking en twee getallen.", `import random

def som():
    a = random.randint(1, 20)
    b = random.randint(1, 20)
    bewerking = random.choice(["+", "-", "*"])
    if bewerking == "+":
        return f"{a} + {b}", a + b
    if bewerking == "-":
        return f"{a} - {b}", a - b
    return f"{a} x {b}", a * b`),
      step("Blijf vragen tot de tijd om is", "Controleer de tijd aan het begin van elke ronde.", `while time.time() - start < LIMIET:
    vraag, antwoord = som()
    try:
        gegeven = int(input(f"{vraag} = "))
    except ValueError:
        continue
    if gegeven == antwoord:
        score += 1
        print("Goed!")

print(f"Tijd! Je score is {score}.")`),
      step("Maak het eerlijker", "Gebruik een korte time-out per vraag in plaats van een harde stop.", `# Houd de tijd per vraag apart bij en stop pas na de huidige vraag.`),
      step("Bewaar je highscore", "Sla de beste score op in een bestand.", `from pathlib import Path

BESTAND = Path("highscore.txt")
oud = int(BESTAND.read_text()) if BESTAND.exists() else 0
if score > oud:
    BESTAND.write_text(str(score))
    print("Nieuwe highscore!")`),
    ],
    ["Vang ValueError op bij invoer.", "Test met een limiet van 5 seconden."]
  ),
  idea(
    "flashcards",
    "Flashcards",
    "🃏",
    "Onderwijs",
    "Beginner",
    "50 min",
    "Overhoor jezelf met digitale flashcards.",
    "Je leert een dictionary met vraag en antwoord gebruiken en een eenvoudige leerlus bouwen. Je bepaalt zelf of je het antwoord wist.",
    ["dict", "input", "leren", "lijsten"],
    [
      step("Maak kaarten", "Een dictionary koppelt een vraag aan een antwoord.", `kaarten = {
    "Wat is een variabele?": "Een naam voor een waarde in het geheugen.",
    "Wat doet print()?": "Het toont tekst in de console.",
    "Wat is een lijst?": "Een geordende verzameling waarden.",
}`),
      step("Overhoor één kaart", "Toon de vraag en wacht op de gebruiker.", `vraag = "Wat doet print()?"
print("Vraag:", vraag)
input("Druk op Enter om het antwoord te zien...")
print("Antwoord:", kaarten[vraag])`),
      step("Loop door alle kaarten", "Gebruik items() om vraag en antwoord samen te nemen.", `for vraag, antwoord in kaarten.items():
    print("\\n" + vraag)
    input("Enter voor het antwoord...")
    print(antwoord)
    if input("Wist je het? (j/n): ").lower() == "n":
        print("Herhaal deze kaart nog een keer.")`),
      step("Herhaal moeilijke kaarten", "Bewaar lastige kaarten in een nieuwe lijst.", `moeilijk = []
for vraag, antwoord in kaarten.items():
    input("Enter...")
    print(antwoord)
    if input("Wist je het? (j/n): ").lower() == "n":
        moeilijk.append(vraag)

print("Nog oefenen:", moeilijk)`),
      step("Laad kaarten uit JSON", "Zo kun je je eigen set aanpassen.", `import json
from pathlib import Path

kaarten = json.loads(Path("kaarten.json").read_text(encoding="utf-8"))`),
    ],
    ["Houd antwoorden kort en concreet.", "Herhaal alleen de kaarten die je nog niet kent."]
  ),
  idea(
    "woordjes-overhoren",
    "Woordjes overhoren",
    "🇬🇧",
    "Onderwijs",
    "Beginner",
    "45 min",
    "Overhoor Nederlandse en Engelse woordjes.",
    "Je leert een tweetalig woordenboek gebruiken en antwoorden vergelijken zonder hoofdlettergevoeligheid. Je houdt een score bij.",
    ["dict", "strings", "quiz", "talen"],
    [
      step("Maak een woordenlijst", "Bewaar Nederlandse en Engelse woorden als paren.", `woorden = {
    "appel": "apple",
    "fiets": "bicycle",
    "school": "school",
    "vriend": "friend",
}`),
      step("Stel een vraag", "Kies een willekeurig woord en vraag de vertaling.", `import random

nederlands = random.choice(list(woorden))
antwoord = input(f"Vertaal '{nederlands}' naar het Engels: ")`),
      step("Vergelijk het antwoord", "Negeer hoofdletters en extra spaties.", `juist = woorden[nederlands]
if antwoord.strip().lower() == juist.lower():
    print("Goed!")
else:
    print(f"Niet goed. Het is '{juist}'.")`),
      step("Maak een ronde", "Herhaal alle woorden en houd de score bij.", `score = 0
for nederlands, juist in woorden.items():
    antwoord = input(f"{nederlands}: ")
    if antwoord.strip().lower() == juist.lower():
        score += 1
print(f"Score: {score}/{len(woorden)}")`),
      step("Oefen beide richtingen", "Wissel Nederlands en Engels af.", `richting = random.choice(["nl-en", "en-nl"])
if richting == "en-nl":
    engels, nederlands = random.choice(list(woorden.items()))
    antwoord = input(f"{engels}: ")`),
    ],
    ["Accepteer kleine spelfouten pas als je dat bewust wilt.", "Gebruik een lijst uit je eigen lesboek."]
  ),
  idea(
    "cijfer-checker",
    "Cijfer-checker",
    "📐",
    "Onderwijs",
    "Gemiddeld",
    "60 min",
    "Bereken je gemiddelde cijfer en wat je nog nodig hebt.",
    "Je leert gewogen gemiddelden, floats en duidelijke rapportages. Je bouwt een tool die je echt kunt gebruiken voor school.",
    ["floats", "gemiddelde", "formatteren", "validatie"],
    [
      step("Bewaar cijfers en wegingen", "Gebruik een lijst met tuples.", `cijfers = [
    ("Sommen", 7.5, 2),
    ("Lezen", 6.8, 1),
    ("Project", 8.2, 3),
]`),
      step("Bereken het gewogen gemiddelde", "Deel de som van cijfer maal weging door de totale weging.", `def gemiddelde(rijen):
    totaal = sum(cijfer * weging for _, cijfer, weging in rijen)
    gewicht = sum(weging for _, _, weging in rijen)
    return totaal / gewicht

print(f"Gemiddeld: {gemiddelde(cijfers):.1f}")`),
      step("Bereken wat je nodig hebt", "Voor een doelcijfer kun je het benodigde cijfer oplossen.", `def nodig_voor_doel(rijen, doel, nieuwe_weging=1):
    huidig = sum(cijfer * weging for _, cijfer, weging in rijen)
    gewicht = sum(weging for _, _, weging in rijen)
    return (doel * (gewicht + nieuwe_weging) - huidig) / nieuwe_weging

print(f"Nodig voor een 8.0: {nodig_voor_doel(cijfers, 8.0):.1f}")`),
      step("Valideer invoer", "Controleer of cijfers tussen 1 en 10 liggen.", `def geldig(cijfer):
    return 1.0 <= cijfer <= 10.0

for naam, cijfer, weging in cijfers:
    if not geldig(cijfer):
        print(f"Let op: {naam} heeft een ongeldig cijfer.")`),
      step("Maak een rapport", "Toon per vak en het eindresultaat.", `for naam, cijfer, weging in cijfers:
    print(f"{naam:<10} {cijfer:.1f} (weging {weging})")
print(f"{'Gemiddeld':<10} {gemiddelde(cijfers):.1f}")`),
    ],
    ["Rond pas op het einde af.", "Controleer of je school dezelfde weging gebruikt."]
  ),
  idea(
    "leesbaarheid",
    "Leesbaarheid checken",
    "📖",
    "Onderwijs",
    "Gemiddeld",
    "60 min",
    "Meet hoe moeilijk een tekst is om te lezen.",
    "Je leert woorden en zinnen tellen en een eenvoudige leesbaarheidsscore berekenen. Je gebruikt tekstverwerking zonder externe libraries.",
    ["tekst", "tellen", "formules", "analyse"],
    [
      step("Tel woorden en zinnen", "Splits op spaties en op zinseinden.", `import re

def analyseer(tekst):
    woorden = re.findall(r"\\b\\w+\\b", tekst)
    zinnen = [zin for zin in re.split(r"[.!?]+", tekst) if zin.strip()]
    return len(woorden), len(zinnen)

print(analyseer("Dit is een zin. Dit is nog een zin!"))`),
      step("Tel lettergrepen", "Een ruwe schatting telt klinkergroepen.", `def lettergrepen(woord):
    groepen = re.findall(r"[aeiouy]+", woord.lower())
    return max(1, len(groepen))`),
      step("Bereken een score", "De Flesch-Douma-score werkt met gemiddelde woorden en lettergrepen per zin.", `def leesbaarheid(tekst):
    woorden = re.findall(r"\\b\\w+\\b", tekst)
    zinnen = [zin for zin in re.split(r"[.!?]+", tekst) if zin.strip()]
    if not woorden or not zinnen:
        return 0
    asl = len(woorden) / len(zinnen)
    asw = sum(lettergrepen(w) for w in woorden) / len(woorden)
    return 206.84 - 0.93 * asl - 77 * asw`),
      step("Geef een label", "Een score alleen zegt niet veel; voeg een interpretatie toe.", `score = leesbaarheid(tekst)
if score > 70:
    label = "makkelijk"
elif score > 50:
    label = "redelijk"
else:
    label = "moeilijk"

print(f"Score: {score:.0f} ({label})")`),
      step("Test met twee teksten", "Vergelijk een kinderboek met een krantenartikel.", `kort = "De hond rent. De kat slaapt."
lang = "De ingewikkelde maatschappelijke discussie vereist een zorgvuldige afweging."
print(leesbaarheid(kort), leesbaarheid(lang))`),
    ],
    ["Lettergrepen tellen blijft een benadering in het Nederlands.", "Gebruik teksten van ongeveer gelijke lengte om te vergelijken."]
  ),
  idea(
    "tijdlijn-quiz",
    "Tijdlijn-quiz",
    "🏛️",
    "Onderwijs",
    "Gemiddeld",
    "60 min",
    "Zet historische gebeurtenissen in de juiste volgorde.",
    "Je leert data sorteren, jaartallen vergelijken en een quiz maken. Je kunt dezelfde techniek gebruiken voor biologie of aardrijkskunde.",
    ["sorteren", "lijsten", "geschiedenis", "quiz"],
    [
      step("Verzamel gebeurtenissen", "Elke gebeurtenis heeft een jaar en een beschrijving.", `gebeurtenissen = [
    ("Uitvinding van de telefoon", 1876),
    ("Eerste maanlanding", 1969),
    ("Uitvinding van de boekdrukkunst", 1440),
    ("Eerste computer", 1946),
]`),
      step("Sorteer op jaar", "Sorted met een key sorteert tuples op de tweede waarde.", `juist = sorted(gebeurtenissen, key=lambda paar: paar[1])
for naam, jaar in juist:
    print(jaar, naam)`),
      step("Maak een sleepvraag", "Toon de gebeurtenissen in willekeurige volgorde.", `import random

door elkaar = gebeurtenissen[:]
random.shuffle(door elkaar)
for nummer, (naam, jaar) in enumerate(door elkaar, start=1):
    print(nummer, naam)`),
      step("Controleer de volgorde", "Vraag de gebruiker om de nummers in de juiste volgorde.", `antwoord = input("Geef de nummers van oud naar nieuw, gescheiden door komma's: ")
gekozen = [door elkaar[int(n) - 1] for n in antwoord.split(",")]
print("Goed!" if gekozen == juist else "Niet helemaal.")`),
      step("Voeg uitleg toe", "Bij elke gebeurtenis hoort een korte context.", `uitleg = {
    "Eerste maanlanding": "Apollo 11 landde in 1969 op de maan.",
}
for naam, jaar in juist:
    print(f"{jaar}: {naam} - {uitleg.get(naam, '')}")`),
    ],
    ["Test met drie gebeurtenissen voordat je er tien toevoegt.", "Controleer jaartallen met een betrouwbare bron."]
  ),
  idea(
    "dictee-generator",
    "Dictee-generator",
    "🗣️",
    "Onderwijs",
    "Gemiddeld",
    "70 min",
    "Laat Python zinnen voorlezen en controleer de spelling.",
    "Je leert tekst voorlezen met de systemen van je computer en antwoorden vergelijken. Werkt op Windows met de ingebouwde stem.",
    ["tekst-naar-spraak", "subprocess", "strings", "dictee"],
    [
      step("Lees een zin voor", "Op Windows kan PowerShell een zin uitspreken.", `import subprocess

def spreek(tekst):
    script = (
        "Add-Type -AssemblyName System.Speech; "
        "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        f"$s.Speak('{tekst}')"
    )
    subprocess.run(["powershell", "-Command", script], check=False)`),
      step("Maak een dictee", "Gebruik lastige woorden uit je eigen lijst.", `zinnen = [
    "De koe loopt door de wei.",
    "Morgen gaat de fiets naar de garage.",
    "Het feest begint om acht uur.",
]`),
      step("Spreek voor en controleer", "Vergelijk zonder hoofdletters en leestekens.", `import re

def schoon(tekst):
    return re.sub(r"[^a-z0-9 ]", "", tekst.lower()).strip()

for zin in zinnen:
    spreek(zin)
    antwoord = input("Typ wat je hoorde: ")
    if schoon(antwoord) == schoon(zin):
        print("Goed!")
    else:
        print(f"Bijna. De zin was: {zin}")`),
      step("Werk ook op andere systemen", "Op macOS bestaat say; op Linux kun je espeak gebruiken.", `# macOS: subprocess.run(["say", tekst])
# Linux: subprocess.run(["espeak", tekst])`),
      step("Bewaar de score", "Houd bij welke zinnen je nog moet oefenen.", `moeilijk = []
# Voeg de zin toe aan moeilijk als het antwoord fout is.`),
    ],
    ["Test de stem eerst met een korte zin.", "Gebruik geen persoonlijke gegevens in de zinnen."]
  ),
  idea(
    "huiswerkplanner",
    "Huiswerkplanner",
    "🗓️",
    "Onderwijs",
    "Gemiddeld",
    "75 min",
    "Plan je huiswerk op basis van deadline en moeilijkheid.",
    "Je leert datums vergelijken, taken sorteren en een weekplanning maken. Je bouwt een planner die rekening houdt met beschikbare tijd.",
    ["datetime", "sorteren", "plannen", "lijsten"],
    [
      step("Maak taken", "Elke taak heeft een vak, deadline en geschatte duur.", `from datetime import date

taken = [
    {"vak": "Wiskunde", "deadline": date(2026, 11, 12), "minuten": 60, "moeilijk": 3},
    {"vak": "Engels", "deadline": date(2026, 11, 10), "minuten": 30, "moeilijk": 1},
    {"vak": "Biologie", "deadline": date(2026, 11, 14), "minuten": 90, "moeilijk": 2},
]`),
      step("Sorteer op urgentie", "Eerst de dichtstbijzijnde deadline, daarna de moeilijkste taak.", `vandaag = date.today()
taken.sort(key=lambda taak: (taak["deadline"] - vandaag, -taak["moeilijk"]))`),
      step("Verdeel over dagen", "Plan taken tot je dagbudget vol is.", `DAGBUDGET = 90

planning = {}
for taak in taken:
    dagen = max(1, (taak["deadline"] - vandaag).days)
    per_dag = min(DAGBUDGET, max(15, taak["minuten"] // dagen))
    planning.setdefault(taak["deadline"].isoformat(), []).append((taak["vak"], per_dag))`),
      step("Toon de planning", "Maak een leesbare lijst per dag.", `for dag, items in sorted(planning.items()):
    print(f"\\n{dag}")
    for vak, minuten in items:
        print(f"  {vak}: {minuten} minuten")`),
      step("Waarschuw bij te weinig tijd", "Tel de benodigde minuten en vergelijk met je budget.", `nodig = sum(taak["minuten"] for taak in taken)
beschikbaar = DAGBUDGET * 7
print("Het past." if nodig <= beschikbaar else "Je hebt te veel taken voor één week.")`),
    ],
    ["Plan niet elke minuut vol; houd ruimte voor pauzes.", "Gebruik realistische schattingen en pas ze na een dag aan."]
  )
];

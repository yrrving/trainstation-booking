# Trainstation Bokningssystem — Demobeskrivning

## Vad du tittar på

Det här är en **interaktiv prototyp** av Trainstations bokningssystem. Allt körs i din webbläsare — det finns ingen server i bakgrunden. Data sparas bara under sessionen; laddar du om sidan börjar du om från noll.

Syftet är att visa hur systemet är tänkt att fungera, **inte** att vara ett färdigt system.

---

## Testinloggningar

| Roll       | Användarnamn | Lösenord |
|------------|-------------|----------|
| Besökare   | `test`      | `test`   |
| Admin      | `admin`     | `admin`  |

---

## Vad du kan testa

**Som besökare (`test/test`)**
- Välj plats → bokningssätt → alternativ
- Se lediga tider (genereras dynamiskt utifrån veckoschemat)
- Genomför en bokning och se bekräftelsen
- Observera att den bokade tiden försvinner som ledig direkt

**Som admin (`admin/admin`)**
- Aktivera/avaktivera bokningssätt per plats
- Skapa, redigera och ta bort bokningsalternativ (öppettider, kapacitet, regler)
- Se och filtrera alla bokningar, avboka

---

## Demots begränsningar jämfört med det riktiga systemet

| Funktion                        | Demo                        | Live-system               |
|---------------------------------|-----------------------------|---------------------------|
| Datapersistens                  | Försvinner vid omladdning   | PostgreSQL-databas        |
| Autentisering                   | Statiska testlösenord       | Riktiga användarkonton    |
| Notifikationer                  | Ej implementerat            | E-post / SMS vid bokning  |
| Inloggning via staff / learn    | Ej implementerat            | Se nedan                  |

---

## Hur det är tänkt att fungera i en live-miljö

### Staff → skapar och hanterar bokningar

Personal på respektive Trainstation-plats loggar in via **staff**-systemet (Trainstations befintliga personalportal). Därifrån kan de:

- Skapa och konfigurera bokningsalternativ för sin plats (t.ex. "Studio A", "Rita med Björn")
- Sätta öppettider, kapacitet och bokningsregler
- Se och hantera inkommande bokningar

### Learn → besökare bokar

Deltagare och besökare loggar in via **learn**-systemet (Trainstations plattform för kursdeltagare). Därifrån kan de:

- Bläddra bland tillgängliga bokningsalternativ på sin plats
- Se lediga tider i realtid
- Genomföra och hantera sina egna bokningar

### Teknisk grund

Bokningssystemet är byggt som ett separat API-lager som kopplas in i befintliga inloggningsflöden i staff och learn — inga separata inloggningar behövs för slutanvändare. All affärslogik (tillgänglighetsberäkning, buffertar, avbokningsregler) lever i API:et och delas av båda plattformarna.

---

## Teknisk stack (som det ser ut nu)

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend** (ej aktivt i demo): Node.js + Express + TypeScript
- **Lagring**: In-memory (demo) / PostgreSQL (live)
- **Tidszonshantering**: Europe/Stockholm via Luxon

---

*Frågor? Kontakta Yrrving@trainstation.se*

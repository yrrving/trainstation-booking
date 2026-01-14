# Trainstation Bokningssystem

Ett komplett bokningssystem för Trainstation med React + TypeScript frontend och Express + TypeScript backend.

## 🚀 Snabbstart

### Backend
```bash
cd backend
npm run dev
```
Backend körs på: http://localhost:3000

### Frontend
```bash
cd frontend
npm run dev
```
Frontend körs på: http://localhost:5173

## 🔑 Inloggningsuppgifter

**Besökare (visitor):**
- Användarnamn: `test`
- Lösenord: `test`

**Admin:**
- Användarnamn: `admin`
- Lösenord: `admin`

## 📋 Funktioner

### För besökare (test/test)
1. **Välj plats** - Välj mellan Vivalla, Skultuna, Karlskoga eller Jordbro
2. **Välj bokningssätt** - Handledning, Rum, Studiebesök, Grupp eller Individuell
3. **Välj bokningsalternativ** - T.ex. "Studio A" eller "Rita med Björn"
4. **Se tillgängliga tider** - KRITISK funktion: Slots visas INNAN formulär
5. **Boka** - Fyll i namn, kontaktinfo, antal personer
6. **Bekräftelse** - Bokningen bekräftas direkt

### För admin (admin/admin)
1. **Hantera platser**
   - Aktivera/avaktivera bokningssätt per plats

2. **Hantera bokningsalternativ**
   - Skapa nya alternativ med:
     - Grundinfo (namn, beskrivning, längd, kapacitet)
     - Bokningsregler (slot-inkrement, min/max framförhållning, buffers)
     - Öppettider (veckoschema med dagar och tider)
   - Redigera befintliga alternativ
   - Ta bort alternativ

3. **Hantera bokningar**
   - Se alla bokningar
   - Filtrera på plats, bokningssätt, datum, status
   - Avboka bokningar

## 🎯 Seed Data

Systemet startar med:

**4 Locations:**
- Vivalla/Örebro (alla modes aktiva)
- Skultuna/Västerås (handledning, rum, grupp, individuell)
- Karlskoga (alla modes aktiva)
- Jordbro/Haninge (handledning, rum, grupp, individuell)

**2 Exempel-alternativ:**
1. **Studio A** (Vivalla, Rum)
   - 60 minuter, max 6 personer
   - Tisdagar & Torsdagar 12:00-17:00
   - Buffers: 10 min före/efter

2. **Rita med Björn** (Vivalla, Handledning)
   - 60 minuter, max 1 person
   - Tisdagar & Torsdagar 14:00-18:00
   - Inga buffers

## 🔧 Teknisk Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Luxon** för timezone-hantering (Europe/Stockholm)
- **In-memory storage** (data försvinner vid restart - OK för prototyp)
- Session-baserad auth med cookies

### Frontend
- **React 18** + **TypeScript**
- **React Router** för routing
- **Tailwind CSS** för styling
- **Ubuntu font** (500 weight)
- **Luxon** för datumhantering

## 📁 Projektstruktur

```
trainstation-booking/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Express server
│   │   ├── types.ts                    # TypeScript interfaces
│   │   ├── storage.ts                  # In-memory storage + seed
│   │   ├── middleware/auth.ts          # Auth middleware
│   │   ├── routes/                     # API routes
│   │   ├── services/
│   │   │   └── availability.service.ts # KRITISK: Slot-algoritm
│   │   └── utils/datetime.ts           # Timezone utils
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx                     # Router + providers
    │   ├── types.ts                    # TypeScript types
    │   ├── api/client.ts               # API client
    │   ├── hooks/                      # Auth & Session contexts
    │   ├── components/
    │   │   ├── Layout/                 # Header
    │   │   ├── Visitor/                # Booking flow
    │   │   └── Admin/                  # Admin interface
    │   └── pages/                      # LoginPage, VisitorPage, AdminPage
    └── package.json
```

## 🎨 Design

- **Typografi**: Ubuntu Medium (500 weight)
- **Färgschema**: Blå accenter, grå bakgrund
- **Layout**: Responsiv med Tailwind utility classes

## ⚡ Viktiga Detaljer

### Availability-algoritm
Filen `backend/src/services/availability.service.ts` innehåller den kritiska logiken för:
1. Generera slots från `weekly_hours` + `slot_increment_minutes`
2. Filtrera på `min_advance_minutes` och `max_advance_days`
3. Markera slots som unavailable vid konflikter med:
   - Befintliga bokningar
   - Buffers (före och efter)

### Timezone
Allt använder `Europe/Stockholm` via Luxon.

### Session Management
- Sessions hanteras med `express-session`
- Cookies med 240 minuters TTL
- Selected location sparas i session

## 🧪 Test Scenarios

### Test Case 1: Besökare bokar "Rita med Björn"
1. Logga in med `test/test`
2. Välj Vivalla
3. Välj Handledning med personal
4. Välj "Rita med Björn"
5. Se lediga tider (endast Tis/Tor 14:00-18:00)
6. Välj en tid
7. Fyll i namn + kontakt
8. Bekräfta bokning
9. Verifiera att tiden inte längre är bokningsbar

### Test Case 2: Admin stänger av Studiebesök
1. Logga in med `admin/admin`
2. Gå till "Platser & Bokningsalternativ"
3. Välj Vivalla
4. Bocka ur "Studiebesök"
5. Spara
6. Logga ut och in som `test/test`
7. Välj Vivalla
8. Verifiera att Studiebesök inte syns

### Test Case 3: Admin skapar "Studio B"
1. Logga in med `admin/admin`
2. Välj Vivalla → välj "Rum"
3. Klicka "+ Nytt alternativ"
4. Fyll i:
   - Namn: Studio B
   - Beskrivning: Video-studio
   - Längd: 60 min
   - Max: 4 personer
   - Öppettider: Mån/Ons/Fre 12-17
5. Spara
6. Logga in som `test/test`
7. Verifiera att Studio B går att boka

## 🚨 Viktigt att veta

- **Data persistens**: All data är in-memory. Vid restart försvinner bokningar och nya alternativ.
- **Auth**: Använder statiska credentials. Ingen registrering.
- **Notifikationer**: Inte implementerat i prototyp-fasen.
- **Validering**: Grundläggande validering finns, men kan förbättras.

## 📝 API Endpoints

### Auth
- `POST /api/auth/login` - Logga in
- `POST /api/auth/logout` - Logga ut
- `GET /api/auth/me` - Hämta nuvarande användare

### Locations
- `GET /api/locations` - Hämta alla platser
- `PATCH /api/locations/:id/modes` - Uppdatera modes (admin)

### Booking Options
- `GET /api/booking-options` - Hämta alternativ (med filter)
- `POST /api/booking-options` - Skapa (admin)
- `PATCH /api/booking-options/:id` - Uppdatera (admin)
- `DELETE /api/booking-options/:id` - Ta bort (admin)

### Availability
- `GET /api/availability` - Hämta lediga slots

### Bookings
- `GET /api/bookings` - Hämta bokningar (med filter)
- `POST /api/bookings` - Skapa bokning
- `PATCH /api/bookings/:id/cancel` - Avboka

## 💡 Nästa Steg (Framtida Förbättringar)

1. **Databas**: Byt ut in-memory till PostgreSQL/MongoDB
2. **Notifikationer**: E-post och SMS vid bokning
3. **Kalendervy**: Visa bokningar i kalender
4. **Användarhantering**: Riktig registrering och lösenordshantering
5. **Bilduppladdning**: För booking options
6. **Statistik**: Dashboard för admin
7. **Export**: CSV/PDF-export av bokningar
8. **Återkommande bokningar**: Support för recurring bookings

## 📞 Support

För frågor eller problem, kontakta utvecklingsteamet.

---

**Byggt med ❤️ för Trainstation**

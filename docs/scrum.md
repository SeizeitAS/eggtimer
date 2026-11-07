# Utviklingsplan (Scrum) – Eggtimer

## Roller

- **Product owner:** _(navn)_ – prioriterer backlog og avgjør hva som er ferdig.
- **Scrum master:** _(navn)_ – sørger for at prosessen følges og fjerner hindringer.
- **Utviklere:** _(navn)_ – leverer inkrement i hver sprint.

## Sprintlengde

Hver sprint varer **2 uker**. Sprint 1 starter når beslutningene under er tatt.

## Beslutninger

| Dato | Beslutning |
| --- | --- |
| 2026-11-07 | «Smilende» er en mellomting mellom bløtkokt og hardkokt. Deler av plommen er stivnet, og ingenting er helt flytende. |
| 2026-11-07 | «Kaldt vann» er vann på 5–10 °C. |
| 2026-11-07 | Plattformen er web-app. |
| 2026-11-07 | Språk er norsk og engelsk. Flere språk kan legges til med egen språkfil. |
| 2026-11-07 | Kaldt vann har to moduser som brukeren velger mellom: **«vann koker»-knapp** (nedtellingen starter når brukeren trykker på knappen) og **estimat** (appen starter nedtellingen etter en tid til kok som brukeren har kalibrert). |
| 2026-11-07 | Estimat-modusen kalibreres med den kasserollen brukeren faktisk bruker. Brukeren setter kasserollen på, starter kalibrering og trykker «vann koker» når vannet koker. Tiden lagres som utgangspunkt og justeres senere av tilbakemeldinger. |
| 2026-11-07 | Tider justeres etter lokale forhold med en evalueringsmetode: brukeren gir tilbakemelding etter koking eller baking, og justeringen lagres. Se epic F. |

## Definition of Done

En oppgave er ferdig når:

- [ ] Koden er skrevet og gjennomgått (code review)
- [ ] Relevante tester er skrevet og passerer
- [ ] Tekster finnes i alle språkfiler med samme nøkler
- [ ] Dokumentasjon i `docs/` er oppdatert der det er relevant
- [ ] Endringen er merget til `main`
- [ ] Product owner har godkjent resultatet

## Milepæler

| Milepæl | Innhold | Mål |
| --- | --- | --- |
| M0: Beslutninger | Besvare åpne spørsmål i `docs/rapport.md` | Før sprint 1 |
| M1: Tider | Testserie for egg og verifisering av julebakst-tider | Slutt av sprint 1 |
| M2: Eggtimer | Eggtimer med hardhet, startmetode, pipelyd | Slutt av sprint 2 |
| M3: Bestillingsmodus | Flere grupper i samme kjele med varsler | Slutt av sprint 3 |
| M4: Julebakst og språk | Julebakst-timer, språkfiler norsk og engelsk | Slutt av sprint 4 |
| M5: Pilot | Test på mobil, rettelser og lansering | Slutt av sprint 5 |

## Backlog

Oppgavene er ikke estimert ennå. Estimat settes i sprint planning.

### Epic A: Beslutninger og testing

| # | Oppgave | Avhengig av |
| --- | --- | --- |
| A1 | Avklare «smilende», og om den har egen tid | Produkteier |
| A2 | Beslutte startmetode for kaldt vann (manuell knapp eller estimat) | Produkteier |
| A3 | Beslutte plattform (PWA eller native) | Produkteier |
| A4 | Testserie for bløtkokt, smilende og hardkokt, med kjøleskapskalde egg | A1 |
| A5 | Verifisere sirupssnipper og finne tid for lussekatter | – |

### Epic B: Eggtimer

| # | Oppgave | Avhengig av |
| --- | --- | --- |
| B1 | Grunnstruktur: HTML, CSS, JavaScript og lang/ | A3 |
| B2 | Valg av hardhet og nedtelling (kokende vann) | A4, B1 |
| B3 | Pipelyd og vibrasjon når tiden er ute, inkl. test på mobil | B1 |
| B4 | Kaldt vann-modus med valgt startmetode | A2, B2 |

### Epic C: Bestillingsmodus

| # | Oppgave | Avhengig av |
| --- | --- | --- |
| C1 | Modell for bestilling: liste med antall og hardhet | B2 |
| C2 | Varsler i rekkefølge etter klar-tid, og samlet varsel ved likt tidspunkt | C1 |
| C3 | Visning av status: hvilke grupper som er ferdige og hvilke som gjenstår | C2 |

### Epic D: Julebakst-timer

| # | Oppgave | Avhengig av |
| --- | --- | --- |
| D1 | Liste med standardtider fra `docs/julebakst.md` | A5 |
| D2 | Egne timere med navn, tid og temperatur | B1 |

### Epic E: Språk

| # | Oppgave | Avhengig av |
| --- | --- | --- |
| E1 | Språkfiler for norsk og engelsk, med test på nøkler | B1 |
| E2 | Språkvalg i appen, lagret lokalt | E1 |

## Sprintplan (foreslått)

| Sprint | Mål | Oppgaver |
| --- | --- | --- |
| Sprint 1 | Beslutninger og testing | A1–A5 |
| Sprint 2 | Eggtimer | B1–B3, E1 |
| Sprint 3 | Bestillingsmodus | C1–C3, B4 |
| Sprint 4 | Julebakst og språk | D1, D2, E2 |
| Sprint 5 | Pilot og lansering | Test på mobil, rettelser |

### Epic F: Kalibrering og tilbakemelding

| # | Oppgave | Avhengig av |
| --- | --- | --- |
| F1 | Tilbakemelding etter koking: «for kort», «passe» eller «for lang». Justering i sekunder per hardhet og startmetode | B2 |
| F2 | Tilbakemelding etter baking: samme valg per bakst, justering i sekunder per navn | D1 |
| F3 | Lagring av justeringer lokalt i nettleseren, med mulighet til å nullstille | F1, F2 |
| F4 | Kalibreringsmodus for estimat: brukeren setter kasserollen på komfyren, starter kalibrering og trykker «vann koker» når vannet koker. Tiden til kok lagres som utgangspunkt, og oppdateres etter tilbakemelding | B4, F1 |
| F4b | Flere kasseroller: kalibrering kan lagres per navngitt kasserolle, slik at brukeren kan velge riktig ved oppstart | F4 |
| F5 | Visning av gjeldende justering for hver tid, så brukeren ser hva som er lagret | F3 |

## Sprintlogg

| Sprint | Periode | Mål | Status |
| --- | --- | --- | --- |
| Sprint 1 | _(dato)_ | Beslutninger og testing | Planlagt |

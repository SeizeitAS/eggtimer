# Eggtimer – Dokumentasjon

## Om prosjektet

Eggtimer er en app for nedtelling av kokte egg og julebakst. Brukeren velger hvor hardt egget skal være, og om vannet er kaldt eller kokende. Med bestillingsmodus kan flere egg i samme kjele få hvert sitt varsel. Når tiden er ute, spilles en pipelyd. Appen har språkfiler, slik at språket kan byttes.

Prosjektet ligger i regi av SeizeitAS.

## Formål

Gi en enkel og pålitelig måte å tidsstyre koking av egg og baking, uten å gjette tider.

## Funksjoner

### 1. Eggtimer (én gruppe)

Brukeren velger hardhet og startmetode. Nedtellingen starter, og pipelyden spilles når tiden er ute.

**Kaldt vann** er vann på 5–10 °C. **Kokende vann** er vann som koker. Startmetoden for kaldt vann er ikke besluttet ennå, se `docs/scrum.md`.

| Hardhet | Beskrivelse | Status |
| --- | --- | --- |
| Bløtkokt | Flytende plomme, stivnede hvite | Tid må testes |
| Smilende | Fast hvite, delvis stivnet plomme. Ingen del av plommen er helt flytende | Tid må testes, se `docs/rapport.md` |
| Hardkokt | Fast plomme | Tid må testes |

### 2. Bestillingsmodus (flere grupper i samme kjele)

Brukeren legger inn en bestilling, for eksempel:

- 2 bløtkokte egg
- 1 smilende egg
- 3 hardkokte egg

Alle egg legges i vannet samtidig. Appen varsler for hver gruppe når den er klar, for eksempel «Ta ut 2 bløtkokte egg», og deretter videre. Gruppene varsles i rekkefølge etter når de er klare. Hvis to grupper er klare samtidig, varsles de samlet.

Dette krever at alle egg startes på samme tidspunkt. Bestillingsmodus støtter derfor ikke å legge egg i etter hvert. Det er en bevisst avgrensning.

### 3. Julebakst-timer

En vanlig timer med navngitte standardtider for julebakst, for eksempel «Pepperkaker tynne – 200 °C – 6 min». Brukeren kan også lage egne tider. Standardtidene ligger i `docs/julebakst.md`.

### 4. Pipelyd og språk

- Pipelyd når tiden er ute. Vibrasjon hvis enheten støtter det.
- Språkfiler under `lang/`, ett JSON-objekt per språk med samme nøkler. Norsk og engelsk i første versjon.

## Omfang

- **Inkludert (første versjon):** eggtimer med hardhet og startmetode, bestillingsmodus, julebakst-timer med standardtider, pipelyd, språkfiler (norsk og engelsk).
- **Ikke inkludert:** kalibrering for eggstørrelse eller høyde, temperatursensor, native app, brukerkontoer, deling, innpakking av egg i bestillinger som legges inn etter start.

## Språk

Alle tekster ligger i språkfiler under `lang/`. Foreløpig støttes norsk og engelsk. Nytt språk kan legges til ved å lage en ny språkfil med samme nøkler, uten endringer i koden. Språk velges i appen og lagres lokalt.

## Struktur

| Fil | Innhold |
| --- | --- |
| `README.md` | Kort beskrivelse |
| `docs/dokumentation.md` | Denne filen: formål, funksjoner, omfang og struktur |
| `docs/rapport.md` | Utforskning, kilder, risiko og åpne spørsmål |
| `docs/scrum.md` | Utviklingsplan, roller, sprinter og backlog |
| `docs/julebakst.md` | Standard baketider |
| `docs/tidsregnskap.md` | Registrering av medgått tid |

## Teknisk oversikt (utkast)

- Web-app: statisk, med HTML, CSS og JavaScript, uten backend. Plattformen er besluttet.
- Nedtelling basert på klokkeslett (`Date.now()`), slik at den ikke driver når fanen er i bakgrunn.
- Pipelyd via Web Audio API.
- Språkfiler som JSON, lastet ved oppstart.
- Mulig PWA-pakking senere.

Endelig teknologivalg avgjøres i sprint 1.

## Vedlikehold

Oppdater dokumentasjonen når omfang, tider, språk eller teknologi endres. Endringer gjøres i samme commit som kodeendringen når det er mulig.

# Utforskningsrapport – Eggkoker

Dato: 2026-11-07
Status: utforskning før bygging. Ingen kode er skrevet.

## 1. Sammendrag

Appen skal gi en nedtelling som gir riktig eggkoketid, basert på hvor hardt egget skal være og om man starter med kaldt eller kokende vann. Når tiden er ute, skal appen spille en pipelyd. Appen skal ha språkfiler, slik at språket kan byttes.

Det største faglige problemet er at kildene ikke er enige om koketidene. Bløtkokt varierer fra 1 til 5 minutter, og smilende fra 3 til 8 minutter. Derfor bør tidstabellen ikke låses før vi har kjørt egne tester.

Det største tekniske problemet er «kaldt vann». Tiden til vannet koker varierer mye med kjele, vannmengde og komfyr, og ingen kilde gir et tall for dette. Løsningen må derfor enten være en manuell «vann koker»-knapp eller en kalibreringsfunksjon. Dette må besluttes før bygging.

## 2. Funn fra kilder

Kilder: matoppskrift.no, klikk.no og flere internasjonale oppskrifter (søk 2026-11-07). Dette er sekundærkilder.

| Hardhet | matoppskrift.no | klikk.no | Merknad |
| --- | --- | --- | --- |
| Bløtkokt | 3–5 min | ca. 1 min (svært flytende) til ca. 1,5 min (fastere hvite) | Stor forskjell mellom kildene |
| Smilende | 6–8 min | ca. 3 min | Stivnet plomme i kantene. Begrepet er ikke entydig |
| Hardkokt | 8–10 min | ca. 6 min (smøraktig plomme) til ca. 9 min (hard, lys plomme) | Ulik definisjon av «hard» |

Kilder om kaldt eller kokende vann er også uenige:

- klikk.no anbefaler kaldt vann fra start, fordi egget varmes opp gradvis og sprekker mindre. Kokende vann gir 1–3 min ekstra koketid.
- matoppskrift.no anbefaler å koke opp vannet, slå av varmen og legge egget i. Dette er kokende vann.

Kildene oppgir heller ikke tid til kok i kaldt vann, og de nevner ikke påvirkning fra eggstørrelse, kjøleskapstemperatur eller høyde over havet.

## 3. Hva «nøyaktig» må bety

Dette er et krav som må avklares, for to tall ser ut til å trekkes sammen:

1. **Nøyaktig nedtelling**: appen teller nøyaktig og varsler presist. Dette er enkelt å oppfylle.
2. **Nøyaktig egg**: egget blir slik brukeren ønsker. Det avhenger av faktorer appen ikke kjenner, som eggstørrelse, starttemperatur og høyde.

Forslag: vi lover punkt 1 og bygger en kalibreringsmodus for punkt 2 senere.

## 4. Mulige tilnærminger

### 4.1 Kokende vann
Brukeren velger hardhet, og nedtellingen starter når eggene legges i. Dette er enklest og mest pålitelig. Tabellen må testes.

### 4.2 Kaldt vann
Alternativ A: brukeren trykker «vann koker» og nedtellingen starter da. Dette er robust, men krever at brukeren er til stede.
Alternativ B: appen estimerer tiden til kok fra vannmengde og varmeinnstilling. Dette er upålitelig uten kalibrering.
Alternativ C: en temperatursensor i kjelen. Dette krever maskinvare, så det er utenfor første versjon.

Anbefaling: alternativ A i første versjon.

### 4.3 Pipelyden
Web Audio API kan generere en pipelyd uten lydfiler. Mobil nettleser krever at lyden startes med en brukerhandling, og lyden stopper hvis fanen er i bakgrunnen. Dette må testes på iOS og Android.

### 4.4 Språk
Språkfiler som JSON-objekter (`no.json`, `en.json`) med nøkler for alle tekster. Språk velges i innstillinger og lagres lokalt. Hardhetsnavn og tider skal ikke hardkodes i språk, men vises ut fra nøkkel.

### 4.5 Plattform
Foreslått første versjon er en statisk webapp (HTML, CSS, JavaScript) uten backend. Den kan også pakkes som PWA så den kan installeres på telefon. Native app er ikke nødvendig før vi vet behovet.

## 5. Risiko

| Risiko | Konsekvens | Tiltak |
| --- | --- | --- |
| Tidstabellen er feil | Eggene blir ikke som ønsket | Testserie med målt resultat før lansering |
| Lyd stopper i bakgrunn | Brukeren hører ikke pipet | Varsel via vibrasjon og tydelig visning, og test på mobil |
| Kaldt vann-tid ukjent | Feil nedtelling | Manuell «vann koker»-knapp i første versjon |
| Språkfiler mangler nøkler | Tekst vises som nøkkel | Test som sjekker at alle språk har samme nøkler |

## 6. Åpne spørsmål til dere

1. **«Smilende»**: hva skal den bety i praksis? Skal den være mellom bløtkokt og hardkokt, eller er den et eget begrep?
2. **Tidstabell**: skal vi teste egne tider, eller bruke en av kildene? Tabellen bør testes med M-størrelse egg fra kjøleskap, slik at vi har en referanse.
3. **Kaldt vann**: godtar dere manuell «vann koker»-knapp i første versjon?
4. **Språk**: hvilke språk skal med første gang, utover norsk og engelsk?
5. **Plattform**: nettside/PWA, eller native app?
6. **Repo**: skal repoet ligge i `seizeitas`-organisasjonen, og skal det være offentlig fra start?

## 7. Forslag til neste steg

1. Dere sjekker dokumentasjonen i `docs/`.
2. Dere svarer på de åpne spørsmålene i punkt 6.
3. Vi kjører en liten testserie med egg og noterer tider. Dette kan gjøres før første kodelinje.
4. Vi bygger første versjon: kokende vann, tre hardhetsnivåer, pipelyd og norsk/engelsk.

## 8. Begrensninger i denne utforskningen

- Tallene er fra sekundærkilder, ikke målt av oss.
- Jeg har ikke sjekket primærkilder som vitenskapelige artikler om eggkoking.
- Jeg har ikke testet pipelyd på mobil.

## 9. Smilende egg: nærmere undersøkelse

**Definisjon:** Smilende egg er et kokt egg der hviten er fast, mens plommen er delvis stivnet. Det ligger mellom bløtkokt og hardkokt. Begrepet er dansk, men brukes også i norske oppskrifter. Den danske ordboken sier at hviten må være fast nok til å holde plommen på plass ([skagenonline.dk](https://www.skagenonline.dk/faq/hvad-er-et-smilende-aeg)).

**Koketider i kildene:**

| Kilde | Bløtkokt | Smilende | Hardkokt | Forutsetning |
| --- | --- | --- | --- | --- |
| [Rema](https://www.rema.no/sesong/paske/) (norsk, via søk) | – | 6 min | – | Fast hvite, bløt plomme |
| [Det Søte Liv](https://www.detsoteliv.no/print/pdf/node/24560) (dansk) | 4 min | 8 min | 10 min | Ikke oppgitt |
| [Det Søte Liv](https://www.detsoteliv.no/print/pdf/node/24014) (dansk) | 5 min | 7 min | 9 min | Svak varme |
| [Klikk.no](https://www.klikk.no/mat/spise/koke-egg-3448367) | ca. 1–1,5 min | ca. 3 min | ca. 6–9 min | Stivnet plomme i kantene |

Kildene er uenige, og forutsetningene er ofte ikke oppgitt. Den største forskjellen er trolig hva man legger i «smilende», og hvilken eggstørrelse og starttemperatur som er brukt.

**Hvordan forutsetningene påvirker tiden (kilder, ikke målt):**

- **Eggstørrelse:** Større egg trenger lengre tid. Rema sier at forskjellen mellom bløtkokt og hardkokt kan være bare ett minutt.
- **Kjøleskapskald vs. romtemperatur:** Kald start tar lengre tid. Kildene snakker om 30–45 sekunder ekstra.
- **Kaldt vann vs. kokende vann:** Klikk.no sier at kokende vann gir 1–3 min ekstra. Matoppskrift.no anbefaler kokende vann. Kildene er motstridende.
- **Høyde:** Vannet koker lavere i høyden. Én kalkulator-blogg sier ca. 93 °C ved 2000 moh. og foreslår rundt ett minutt ekstra. Formelen er ikke verifisert.
- **Avkjøling:** Restvarme fortsetter å koke egget etter at det er tatt ut. Kaldt vannbad stopper kokingen.

**Praktisk startpunkt (ikke verifisert):** For et stort egg fra kjøleskap, ved havnivå og tid fra vannet igjen koker jevnt, er ca. 6 min et rimelig utgangspunkt for smilende. Legg til 30–60 sekunder i høyden. Test med ett egg før tallet brukes i appen.

**Konsekvens for appen:** Smilende bør ha egen tid i første versjon, og testserien (A4 i `scrum.md`) bør kjøres med egg fra kjøleskap og romtemperatur. Kalibrering for høyde kommer senere.

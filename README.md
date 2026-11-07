# Eggtimer

Eggtimer gir nøyaktig nedtelling for kokte egg, og en vanlig timer for julebakst. Velg hardhet og om vannet er kaldt eller kokende. Med bestillingsmodus kan du legge flere egg i samme kjele og få varsel etter hvert som hver gruppe er ferdig. Når tiden er ute, spilles en pipelyd. Språket kan byttes.

**Status:** eggtimer for enkeltegg og bestillinger, for kokende og kaldt vann, med kalibrering og tilbakemelding. Julebakst-timer med standardtider og egen timer er laget. Tidene er foreløpige.

## Kjøre lokalt

Appen er en statisk web-app. Den må kjøres via en lokal server, fordi språkfilene lastes med `fetch`.

```bash
npm start        # starter server på http://localhost:8000
npm test         # kjører tester for språk, nedtelling, tidsdata, kalibrering og bestilling
```

## Tider

Tidene for kokende vann ligger i `data/egg-times.json`, i sekunder. De er foreløpige til testserien (A4 i `docs/scrum.md`) er gjort.

## Bestilling

I bestillingsmodus velger du antall egg per hardhet, for eksempel 2 bløtkokte, 1 smilende og 3 hardkokte. Alle egg starter samtidig. Når en gruppe er klar, piper appen, og du trykker «Tatt ut». Du kan ikke legge til egg etter at bestillingen er startet.

## Kaldt vann og kalibrering

Kaldt vann (5–10 °C) har to moduser:

- **Vann koker-knapp:** trykk Start, og trykk «Vann koker» når vannet koker.
- **Estimat:** krever kalibrering. Sett kasserollen på komfyren, trykk Start, og trykk «Vann koker» når det koker. Nedtellingen starter automatisk etter den lagrede tiden.

Etter ferdig egg velger du «For kort», «Passe» eller «For lang». Justeringen lagres i nettleseren, og kan nullstilles. Justeringen gjelder bare den gruppen og hardheten du brukte.

## Språk

Språkfilene ligger i `lang/`. Norsk er standardspråk, og engelsk brukes som reserve for manglende nøkler.

Nytt språk legges til slik:

1. Lag `lang/<kode>.json` med samme nøkler som `lang/en.json`.
2. Legg koden til i `lang/languages.json`.
3. Kjør `npm test`.

## Publisere på egen webserver

```bash
npm run build    # lager dist/ med de filene som skal ut
```

Last opp hele innholdet i `dist/` til webserveren, for eksempel med `rsync -av dist/ bruker@server:/var/www/eggtimer/`, eller med FTP/SFTP. Filene er statiske, så serveren trenger ingen egen kjøring. Alle stier er relative, så appen fungerer både i rotmappen og i en undermappe.

`dist/` er ikke med i git.

## Brukerhåndbok

Brukerhåndboken ligger i appen under «Hjelp», på norsk og engelsk. Tekstene ligger i `help/`. Nytt språk får hjelp ved å lage `help/<kode>.html`. Mangler den, brukes engelsk.

## Dokumentasjon

- [`docs/dokumentation.md`](docs/dokumentation.md): formål, funksjoner, omfang og struktur
- [`docs/rapport.md`](docs/rapport.md): utforskning, kilder og beslutninger
- [`docs/scrum.md`](docs/scrum.md): utviklingsplan, roller, sprinter og backlog
- [`docs/julebakst.md`](docs/julebakst.md): standard baketider
- [`docs/tidsregnskap.md`](docs/tidsregnskap.md): registrering av medgått tid

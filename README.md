# Eggtimer

Eggtimer gir nøyaktig nedtelling for kokte egg, og en vanlig timer for julebakst. Velg hardhet og om vannet er kaldt eller kokende. Med bestillingsmodus kan du legge flere egg i samme kjele og få varsel etter hvert som hver gruppe er ferdig. Når tiden er ute, spilles en pipelyd. Språket kan byttes.

**Status:** eggtimer for kokende vann er laget (B2, B3). Tidene er foreløpige, og kaldt vann, kalibrering, bestillingsmodus og julebakst-timer er ikke laget ennå.

## Kjøre lokalt

Appen er en statisk web-app. Den må kjøres via en lokal server, fordi språkfilene lastes med `fetch`.

```bash
npm start        # starter server på http://localhost:8000
npm test         # kjører tester for språkfiler, nedtelling og tidsdata
```

## Tider

Tidene for kokende vann ligger i `data/egg-times.json`, i sekunder. De er foreløpige til testserien (A4 i `docs/scrum.md`) er gjort.

## Språk

Språkfilene ligger i `lang/`. Norsk er standardspråk, og engelsk brukes som reserve for manglende nøkler.

Nytt språk legges til slik:

1. Lag `lang/<kode>.json` med samme nøkler som `lang/en.json`.
2. Legg koden til i `lang/languages.json`.
3. Kjør `npm test`.

## Dokumentasjon

- [`docs/dokumentation.md`](docs/dokumentation.md): formål, funksjoner, omfang og struktur
- [`docs/rapport.md`](docs/rapport.md): utforskning, kilder og beslutninger
- [`docs/scrum.md`](docs/scrum.md): utviklingsplan, roller, sprinter og backlog
- [`docs/julebakst.md`](docs/julebakst.md): standard baketider
- [`docs/tidsregnskap.md`](docs/tidsregnskap.md): registrering av medgått tid

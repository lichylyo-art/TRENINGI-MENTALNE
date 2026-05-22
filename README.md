# Trening Mentalny — system prowadzenia sesji

Aplikacja do prowadzenia indywidualnych sesji treningu mentalnego z młodymi sportowcami.
Zawodnik w centrum, kreator sesji, generator tematów, tryb prowadzenia krok po kroku
z timerem 30 min, notatki na bieżąco i trwały zapis w przeglądarce.

## Jak uruchomić na Vercel (najszybciej, prawdziwy link)

### Sposób A — bez instalowania niczego (przez stronę vercel.com)

1. Wejdź na https://vercel.com i załóż darmowe konto (możesz przez Google).
2. Zainstaluj na komputerze **Node.js** z https://nodejs.org (wersja LTS) — potrzebne tylko raz.
3. Zainstaluj **Vercel CLI**: otwórz terminal / wiersz poleceń i wpisz:
   ```
   npm install -g vercel
   ```
4. Rozpakuj folder z aplikacją, wejdź do niego w terminalu:
   ```
   cd sciezka/do/trening-app
   ```
5. Uruchom:
   ```
   vercel
   ```
   Przy pierwszym razie poprosi o zalogowanie i zada kilka pytań — na wszystkie
   możesz nacisnąć Enter (domyślne odpowiedzi są OK).
6. Po chwili dostaniesz link typu `https://trening-mentalny-xxx.vercel.app` — to Twoja
   działająca aplikacja. Otwórz go w przeglądarce.
7. Gdy zechcesz wersję „produkcyjną" (stały link), uruchom:
   ```
   vercel --prod
   ```

### Sposób B — przez GitHub (jeśli wolisz klikać niż pisać w terminalu)

1. Załóż konto na https://github.com i utwórz nowe, puste repozytorium.
2. Wgraj do niego zawartość tego folderu (przeciągnij pliki przez stronę GitHub —
   przycisk „Add file" → „Upload files"). **Nie wgrywaj folderu `node_modules`.**
3. Wejdź na https://vercel.com → „Add New Project" → wybierz swoje repozytorium.
4. Vercel sam wykryje, że to projekt Vite — kliknij „Deploy".
5. Po chwili masz link do działającej aplikacji.

## Uruchomienie lokalnie (do testów na własnym komputerze)

```
npm install
npm run dev
```
Otwórz adres, który pokaże się w terminalu (zwykle http://localhost:5173).

## Gdzie zapisują się dane

Dane (zawodnicy, sesje, notatki, baza tematów i ćwiczeń) zapisują się w pamięci
przeglądarki (localStorage) na danym urządzeniu. Zostają po zamknięciu i restarcie.
Uwaga: dane są przypisane do konkretnej przeglądarki — nie przenoszą się automatycznie
między komputerami. Czyszczenie danych przeglądarki je usuwa.

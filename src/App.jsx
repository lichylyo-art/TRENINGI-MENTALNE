import React, { useState, useEffect, useMemo, useRef } from "react";

// ============================================================
//  TRENING MENTALNY — system prowadzenia sesji 1-na-1
//  Zawodnik w centrum · kreator sesji · tryb krok po kroku
// ============================================================

const THEMES = [
  { id: "stres", label: "Stres przedstartowy", color: "#E8633A" },
  { id: "koncentracja", label: "Koncentracja", color: "#3A8DDE" },
  { id: "pewnosc", label: "Pewność siebie", color: "#F5A623" },
  { id: "motywacja", label: "Motywacja", color: "#27AE60" },
  { id: "porazka", label: "Praca z porażką", color: "#8E5BD6" },
  { id: "cele", label: "Wyznaczanie celów", color: "#16A4A4" },
  { id: "wizualizacja", label: "Wizualizacja", color: "#D6457E" },
  { id: "dialog", label: "Mowa wewnętrzna", color: "#C28A2B" },
];

const AGES = [
  { id: "dzieci", label: "Dzieci (do 12)" },
  { id: "mlodziez", label: "Młodzież (13–17)" },
];

const themeById = (id) => THEMES.find((t) => t.id === id) || { label: id, color: "#888" };
const ageLabel = (id) => AGES.find((a) => a.id === id)?.label || id;

// ROZSZERZONA BAZA TEMATÓW — ~55 haseł na sesję, 8 kategorii
// ages: ["dzieci"] (do 12) | ["mlodziez"] (13-17) | oba
const SEED_TOPICS = [
  // ===== STRES PRZEDSTARTOWY =====
  { id: "tp-stres-1", title: "Trema to paliwo, nie wróg", theme: "stres", ages: ["dzieci", "mlodziez"], hook: "Dlaczego najlepsi też się denerwują — i jak zamienić nerwy w energię." },
  { id: "tp-stres-2", title: "Mój rytuał przed startem", theme: "stres", ages: ["dzieci", "mlodziez"], hook: "Stała sekwencja czynności, która uspokaja i ustawia głowę przed występem." },
  { id: "tp-stres-3", title: "Co robić, gdy serce wali przed startem", theme: "stres", ages: ["dzieci", "mlodziez"], hook: "Rozpoznawanie sygnałów ciała i szybkie narzędzia na ich opanowanie." },
  { id: "tp-stres-4", title: "Presja rodziców i otoczenia", theme: "stres", ages: ["mlodziez"], hook: "Jak oddzielić własne cele od oczekiwań innych i zdjąć z siebie ciężar." },
  { id: "tp-stres-5", title: "Strach przed oceną i wyśmianiem", theme: "stres", ages: ["dzieci", "mlodziez"], hook: "Praca z lękiem 'co inni pomyślą', gdy coś nie wyjdzie." },
  { id: "tp-stres-6", title: "Napięcie przed ważnym meczem", theme: "stres", ages: ["mlodziez"], hook: "Jak przeżyć tydzień przed dużym startem bez wypalenia nerwów." },
  { id: "tp-stres-7", title: "Kiedy stres zamienia się w pomoc", theme: "stres", ages: ["mlodziez"], hook: "Zrozumienie 'dobrego' poziomu pobudzenia dla swojej dyscypliny." },

  // ===== KONCENTRACJA =====
  { id: "tp-konc-1", title: "Wyłączam hałas wokół", theme: "koncentracja", ages: ["dzieci", "mlodziez"], hook: "Trening skupienia mimo kibiców, presji i rozpraszaczy." },
  { id: "tp-konc-2", title: "Tu i teraz — jedna akcja na raz", theme: "koncentracja", ages: ["mlodziez"], hook: "Skupienie na bieżącym zadaniu zamiast na wyniku czy przeszłości." },
  { id: "tp-konc-3", title: "Powrót uwagi po rozproszeniu", theme: "koncentracja", ages: ["dzieci", "mlodziez"], hook: "Jak szybko wrócić do gry, gdy myśli uciekły gdzie indziej." },
  { id: "tp-konc-4", title: "Słowa-klucze, które mnie skupiają", theme: "koncentracja", ages: ["dzieci", "mlodziez"], hook: "Budowa osobistych haseł kierujących uwagę na to, co ważne." },
  { id: "tp-konc-5", title: "Koncentracja na całym treningu", theme: "koncentracja", ages: ["mlodziez"], hook: "Utrzymanie skupienia przez długą jednostkę, nie tylko przez chwilę." },
  { id: "tp-konc-6", title: "Co jest pod moją kontrolą", theme: "koncentracja", ages: ["mlodziez"], hook: "Kierowanie uwagi na rzeczy zależne ode mnie, a nie na sędziego czy pogodę." },
  { id: "tp-konc-7", title: "Uważność dla młodego sportowca", theme: "koncentracja", ages: ["dzieci"], hook: "Proste ćwiczenia bycia 'tu i teraz' w wersji dla dzieci." },

  // ===== PEWNOŚĆ SIEBIE =====
  { id: "tp-pew-1", title: "Wierzę, że potrafię", theme: "pewnosc", ages: ["dzieci", "mlodziez"], hook: "Budowanie pewności na bazie konkretnych dowodów z przeszłości." },
  { id: "tp-pew-2", title: "Mój najlepszy występ — co wtedy działało?", theme: "pewnosc", ages: ["mlodziez"], hook: "Analiza udanego startu, by móc świadomie go powtórzyć." },
  { id: "tp-pew-3", title: "Mocne strony, o których zapominam", theme: "pewnosc", ages: ["dzieci", "mlodziez"], hook: "Odkrywanie i nazywanie własnych atutów sportowych." },
  { id: "tp-pew-4", title: "Pewność siebie po słabszym okresie", theme: "pewnosc", ages: ["mlodziez"], hook: "Jak odbudować wiarę w siebie po serii niepowodzeń." },
  { id: "tp-pew-5", title: "Postawa ciała a pewność siebie", theme: "pewnosc", ages: ["dzieci", "mlodziez"], hook: "Jak sylwetka i mowa ciała wpływają na to, jak się czujemy." },
  { id: "tp-pew-6", title: "Porównywanie się do innych", theme: "pewnosc", ages: ["mlodziez"], hook: "Praca z pułapką ciągłego porównywania z rywalami i kolegami." },
  { id: "tp-pew-7", title: "Wchodzę na boisko jak zwycięzca", theme: "pewnosc", ages: ["dzieci", "mlodziez"], hook: "Budowa wewnętrznej postawy gotowości i wiary tuż przed startem." },

  // ===== MOTYWACJA =====
  { id: "tp-mot-1", title: "Po co ja to robię?", theme: "motywacja", ages: ["mlodziez"], hook: "Odkrycie własnego 'dlaczego', które napędza w trudne dni." },
  { id: "tp-mot-2", title: "Gdy nie chce mi się trenować", theme: "motywacja", ages: ["dzieci", "mlodziez"], hook: "Co robić z dniami spadku chęci i jak nie odpuścić." },
  { id: "tp-mot-3", title: "Radość z gry, nie tylko wynik", theme: "motywacja", ages: ["dzieci"], hook: "Powrót do przyjemności z uprawiania sportu u młodszych." },
  { id: "tp-mot-4", title: "Motywacja na długi sezon", theme: "motywacja", ages: ["mlodziez"], hook: "Jak utrzymać zapał, gdy do celu jest jeszcze daleko." },
  { id: "tp-mot-5", title: "Małe zwycięstwa każdego dnia", theme: "motywacja", ages: ["dzieci", "mlodziez"], hook: "Dostrzeganie codziennych postępów, nie tylko wielkich sukcesów." },
  { id: "tp-mot-6", title: "Wewnętrzna vs zewnętrzna motywacja", theme: "motywacja", ages: ["mlodziez"], hook: "Różnica między 'chcę' a 'muszę' i dlaczego to ważne." },
  { id: "tp-mot-7", title: "Mój sportowy bohater", theme: "motywacja", ages: ["dzieci"], hook: "Czerpanie motywacji z postaci, którą się podziwia." },

  // ===== PRACA Z PORAŻKĄ =====
  { id: "tp-por-1", title: "Wracam do gry po błędzie", theme: "porazka", ages: ["dzieci", "mlodziez"], hook: "Jak nie zawiesić się na pomyłce i grać dalej." },
  { id: "tp-por-2", title: "Przegrana to nie koniec, to lekcja", theme: "porazka", ages: ["mlodziez"], hook: "Co zabrać z porażki zamiast się nią obwiniać." },
  { id: "tp-por-3", title: "Złość po przegranej", theme: "porazka", ages: ["dzieci", "mlodziez"], hook: "Co zrobić z emocjami, gdy przegrana boli i wkurza." },
  { id: "tp-por-4", title: "Strach przed popełnieniem błędu", theme: "porazka", ages: ["dzieci", "mlodziez"], hook: "Jak przestać grać asekuracyjnie z lęku przed pomyłką." },
  { id: "tp-por-5", title: "Rozmowa po słabym występie", theme: "porazka", ages: ["mlodziez"], hook: "Jak przeanalizować nieudany start bez bicia się w pierś." },
  { id: "tp-por-6", title: "Porażka kolegi z drużyny", theme: "porazka", ages: ["mlodziez"], hook: "Jak reagować, gdy to ktoś inny zawalił — wsparcie zamiast oskarżeń." },
  { id: "tp-por-7", title: "Każdy mistrz kiedyś przegrywał", theme: "porazka", ages: ["dzieci"], hook: "Oswajanie porażki przez historie wielkich sportowców." },

  // ===== WYZNACZANIE CELÓW =====
  { id: "tp-cel-1", title: "Od marzenia do planu", theme: "cele", ages: ["mlodziez"], hook: "Rozbicie wielkiego celu na małe, kontrolowalne kroki." },
  { id: "tp-cel-2", title: "Cel na dziś, cel na sezon", theme: "cele", ages: ["dzieci", "mlodziez"], hook: "Różnica między celami krótko- i długoterminowymi." },
  { id: "tp-cel-3", title: "Cele procesowe zamiast wynikowych", theme: "cele", ages: ["mlodziez"], hook: "Dlaczego 'rób X dobrze' działa lepiej niż 'wygraj'." },
  { id: "tp-cel-4", title: "Mój cel na najbliższy trening", theme: "cele", ages: ["dzieci", "mlodziez"], hook: "Nauka stawiania jednego, konkretnego celu na zajęcia." },
  { id: "tp-cel-5", title: "Co jeśli nie osiągnę celu?", theme: "cele", ages: ["mlodziez"], hook: "Elastyczne podejście do celów i radzenie sobie z poślizgiem." },
  { id: "tp-cel-6", title: "Mapa moich celów", theme: "cele", ages: ["dzieci", "mlodziez"], hook: "Wizualne ułożenie celów, by widzieć kierunek." },
  { id: "tp-cel-7", title: "Świętowanie osiągniętych celów", theme: "cele", ages: ["dzieci"], hook: "Dlaczego warto zauważać i celebrować to, co się udało." },

  // ===== WIZUALIZACJA =====
  { id: "tp-wiz-1", title: "Widzę swój sukces zanim się wydarzy", theme: "wizualizacja", ages: ["dzieci", "mlodziez"], hook: "Trening udanego wykonania w wyobraźni." },
  { id: "tp-wiz-2", title: "Film z mojego najlepszego startu", theme: "wizualizacja", ages: ["mlodziez"], hook: "Odtwarzanie udanego występu w głowie, by go utrwalić." },
  { id: "tp-wiz-3", title: "Wyobrażam sobie trudną sytuację", theme: "wizualizacja", ages: ["mlodziez"], hook: "Mentalny trening reakcji na presję i nieoczekiwane zdarzenia." },
  { id: "tp-wiz-4", title: "Wszystkie zmysły w wyobraźni", theme: "wizualizacja", ages: ["dzieci", "mlodziez"], hook: "Jak uczynić wizualizację żywą — obraz, dźwięk, czucie." },
  { id: "tp-wiz-5", title: "Moje bezpieczne miejsce", theme: "wizualizacja", ages: ["dzieci"], hook: "Wyobrażanie miejsca spokoju, do którego można wracać." },
  { id: "tp-wiz-6", title: "Próba generalna w głowie", theme: "wizualizacja", ages: ["mlodziez"], hook: "Przejście całego występu w wyobraźni dzień przed startem." },

  // ===== MOWA WEWNĘTRZNA =====
  { id: "tp-dia-1", title: "Mój wewnętrzny trener", theme: "dialog", ages: ["mlodziez"], hook: "Zamiana krytyka w głowie na głos, który pomaga." },
  { id: "tp-dia-2", title: "Słowa, które dodają mi siły", theme: "dialog", ages: ["dzieci", "mlodziez"], hook: "Budowa osobistych haseł na trudne momenty." },
  { id: "tp-dia-3", title: "Co mówię sobie po błędzie", theme: "dialog", ages: ["dzieci", "mlodziez"], hook: "Świadomość i zmiana automatycznych myśli po pomyłce." },
  { id: "tp-dia-4", title: "Stop myśli — jak przerwać spiralę", theme: "dialog", ages: ["mlodziez"], hook: "Technika zatrzymywania natłoku negatywnych myśli." },
  { id: "tp-dia-5", title: "Rozmowa z samym sobą przed startem", theme: "dialog", ages: ["mlodziez"], hook: "Świadome ustawianie myśli tuż przed wejściem do gry." },
  { id: "tp-dia-6", title: "Dwa głosy w głowie", theme: "dialog", ages: ["dzieci"], hook: "Metafora dwóch postaci — pomocnika i marudy — dla dzieci." },
  { id: "tp-dia-7", title: "Jak mówiłbym do przyjaciela", theme: "dialog", ages: ["dzieci", "mlodziez"], hook: "Traktowanie siebie z taką samą życzliwością jak kolegi." },
];


// ROZSZERZONA BAZA ĆWICZEŃ — ~28 narzędzi
const SEED_EXERCISES = [
  // ===== ODDECH / WYCISZENIE =====
  {
    id: "ex-box-breathing", title: "Oddech kwadratowy (box breathing)",
    themes: ["stres", "koncentracja"], ages: ["dzieci", "mlodziez"], duration: 3,
    goal: "Szybkie wyciszenie układu nerwowego przed startem lub w stresującej sytuacji.",
    steps: [
      "Usiądź wygodnie, plecy proste, dłonie na kolanach.",
      "Wdech nosem licząc do 4.",
      "Zatrzymaj powietrze licząc do 4.",
      "Wydech ustami licząc do 4.",
      "Pauza bez powietrza licząc do 4. Powtórz 4–6 razy.",
    ],
    tip: "Dla młodszych dzieci: rysuj palcem kwadrat w powietrzu w rytm oddechu — bok = jedna faza.",
  },
  {
    id: "ex-oddech-przeponowy", title: "Oddech przeponowy 4-6",
    themes: ["stres"], ages: ["mlodziez"], duration: 4,
    goal: "Aktywacja reakcji rozluźnienia przez wydłużony wydech.",
    steps: [
      "Połóż dłoń na brzuchu.",
      "Wdech nosem na 4 — brzuch unosi dłoń.",
      "Wydech ustami na 6 — dłoń opada.",
      "Powtarzaj przez 2–3 minuty, skupiając się na ruchu brzucha.",
    ],
    tip: "Dłuższy wydech niż wdech to klucz — to on uspokaja ciało.",
  },
  {
    id: "ex-oddech-balonik", title: "Oddech balonika",
    themes: ["stres", "koncentracja"], ages: ["dzieci"], duration: 3,
    goal: "Nauka spokojnego oddechu u dzieci przez prostą wyobraźnię.",
    steps: [
      "Wyobraź sobie, że w brzuchu masz kolorowy balonik.",
      "Wdech — balonik powoli się napełnia.",
      "Wydech — balonik powoli się opróżnia.",
      "Powtórz 5 razy, za każdym razem inny kolor balonika.",
    ],
    tip: "Można położyć pluszaka na brzuchu — dziecko patrzy, jak unosi się i opada.",
  },

  // ===== UWAGA / GROUNDING =====
  {
    id: "ex-5-4-3-2-1", title: "Kotwica zmysłów 5-4-3-2-1",
    themes: ["stres", "koncentracja"], ages: ["dzieci", "mlodziez"], duration: 4,
    goal: "Sprowadzenie uwagi do teraźniejszości, gdy myśli uciekają lub narasta napięcie.",
    steps: [
      "Wymień 5 rzeczy, które widzisz.",
      "4 rzeczy, które słyszysz.",
      "3 rzeczy, które czujesz dotykiem.",
      "2 rzeczy, które czujesz węchem.",
      "1 rzecz, którą czujesz smakiem (lub jedną rzecz, za którą jesteś wdzięczny).",
    ],
    tip: "Świetne tuż przed wejściem na boisko/matę — można zrobić w 30 sekund w skróconej wersji.",
  },
  {
    id: "ex-slowo-klucz", title: "Słowo-klucz skupienia",
    themes: ["koncentracja", "dialog"], ages: ["dzieci", "mlodziez"], duration: 6,
    goal: "Stworzenie krótkiego hasła, które natychmiast kieruje uwagę na właściwą rzecz.",
    steps: [
      "Zastanówcie się: na czym sportowiec ma się skupić w kluczowym momencie?",
      "Skróćcie to do jednego słowa ('teraz', 'lekko', 'oddech', 'patrz').",
      "Przećwiczcie wypowiadanie słowa i kierowanie uwagi.",
      "Połączcie słowo z gestem lub oddechem.",
      "Ustal, kiedy dokładnie sportowiec go użyje.",
    ],
    tip: "Słowo musi być krótkie i pozytywne — mówi co robić, nie czego unikać.",
  },
  {
    id: "ex-uwaga-reflektor", title: "Reflektor uwagi",
    themes: ["koncentracja"], ages: ["mlodziez"], duration: 8,
    goal: "Nauka świadomego przenoszenia i zawężania uwagi jak światła reflektora.",
    steps: [
      "Wyobraź sobie, że uwaga to reflektor, którym sterujesz.",
      "Skup go szeroko — obejmij całe otoczenie (całe boisko).",
      "Zawęź na jeden punkt (piłka, cel, przeciwnik).",
      "Poćwiczcie przełączanie szeroki ↔ wąski na komendę.",
      "Omówcie, kiedy w grze potrzebny jest który tryb.",
    ],
    tip: "W większości dyscyplin sukces zależy od umiejętności szybkiego przełączania szerokości uwagi.",
  },
  {
    id: "ex-powrot-uwagi", title: "Powrót uwagi (zauważ–wróć)",
    themes: ["koncentracja"], ages: ["dzieci", "mlodziez"], duration: 7,
    goal: "Trening szybkiego powrotu do zadania, gdy myśli uciekły.",
    steps: [
      "Skup się na jednym punkcie lub oddechu.",
      "Gdy zauważysz, że myśli odpłynęły — to dobrze, że zauważyłeś.",
      "Bez oceniania powiedz w myślach 'wracam'.",
      "Łagodnie wróć uwagą do punktu.",
      "Powtarzaj — to właśnie zauważanie i powrót jest treningiem.",
    ],
    tip: "Sednem nie jest brak rozproszeń, tylko szybki powrót. Każdy powrót to 'powtórzenie' dla mózgu.",
  },

  // ===== WIZUALIZACJA =====
  {
    id: "ex-wizualizacja-sukcesu", title: "Film sukcesu (wizualizacja)",
    themes: ["wizualizacja", "pewnosc"], ages: ["dzieci", "mlodziez"], duration: 8,
    goal: "Budowanie ścieżek nerwowych udanego wykonania i redukcja lęku przed występem.",
    steps: [
      "Zamknij oczy, weź 3 spokojne oddechy.",
      "Wyobraź sobie konkretną sytuację z zawodów/treningu — jak najbardziej szczegółowo.",
      "Dodaj zmysły: co widzisz, słyszysz, czujesz w ciele.",
      "Odtwórz wykonanie technicznie poprawnie, od początku do końca, w realnym tempie.",
      "Zakończ obrazem udanego finiszu i emocją, która mu towarzyszy.",
    ],
    tip: "Kluczowe: perspektywa z własnych oczu, nie 'z trybun'. Krótko, ale codziennie działa lepiej niż raz a długo.",
  },
  {
    id: "ex-proba-generalna", title: "Próba generalna w wyobraźni",
    themes: ["wizualizacja"], ages: ["mlodziez"], duration: 10,
    goal: "Mentalne przejście całego występu dzień przed startem, by zmniejszyć niepewność.",
    steps: [
      "Wyobraź sobie poranek startu — od pobudki.",
      "Przejdź przez rozgrzewkę, wejście na arenę, pierwsze chwile.",
      "Odtwórz kluczowe momenty występu tak, jak chcesz, by wyglądały.",
      "Wpleć jeden moment trudności i swoją spokojną reakcję na niego.",
      "Zakończ obrazem zadowolenia po dobrze wykonanej pracy.",
    ],
    tip: "Dodanie jednej trudności i poradzenia sobie z nią buduje odporność na niespodzianki.",
  },
  {
    id: "ex-bezpieczne-miejsce", title: "Moje bezpieczne miejsce",
    themes: ["wizualizacja", "stres"], ages: ["dzieci"], duration: 6,
    goal: "Stworzenie wyobrażonego miejsca spokoju, do którego dziecko może wracać przy stresie.",
    steps: [
      "Zamknij oczy i pomyśl o miejscu, gdzie czujesz się świetnie i bezpiecznie.",
      "Co tam widzisz? Jakie są kolory?",
      "Co słyszysz i czujesz?",
      "Nadaj temu miejscu nazwę.",
      "Poćwiczcie 'przenoszenie się' tam w 10 sekund, gdy potrzeba spokoju.",
    ],
    tip: "Niech dziecko narysuje to miejsce — rysunek wzmacnia obraz w pamięci.",
  },

  // ===== CELE =====
  {
    id: "ex-smart-cele", title: "Cel SMART — proces zamiast wyniku",
    themes: ["cele", "motywacja"], ages: ["mlodziez"], duration: 15,
    goal: "Przełożenie marzenia sportowca na konkretny, kontrolowalny cel procesowy.",
    steps: [
      "Zapytaj o duży cel ('co chcesz osiągnąć?').",
      "Rozłóż go: Specyficzny, Mierzalny, Atrakcyjny, Realny, Terminowy.",
      "Zamień cel wynikowy ('wygrać') na procesowy ('robić X na każdym treningu').",
      "Ustal 1–2 działania na najbliższy tydzień.",
      "Zapisz i umów się na sprawdzenie na kolejnym spotkaniu.",
    ],
    tip: "Sportowcy, którzy zapisują i dzielą się celami, częściej je realizują. Cel procesowy daje poczucie kontroli.",
  },
  {
    id: "ex-mapa-celow", title: "Mapa celów (drabina)",
    themes: ["cele"], ages: ["dzieci", "mlodziez"], duration: 12,
    goal: "Wizualne ułożenie celów od najbliższego do marzenia, by widzieć kierunek.",
    steps: [
      "Na górze drabiny zapiszcie wielki cel / marzenie.",
      "Na samym dole — gdzie sportowiec jest dzisiaj.",
      "Wypełnijcie szczeble po drodze: małe, osiągalne kroki.",
      "Zaznaczcie najbliższy szczebel do zdobycia.",
      "Ustalcie, co konkretnie przybliży do niego w tym tygodniu.",
    ],
    tip: "U dzieci użyjcie kolorowego rysunku drabiny lub ścieżki — wizualizacja celu mocno motywuje.",
  },
  {
    id: "ex-cel-na-trening", title: "Jeden cel na trening",
    themes: ["cele", "koncentracja"], ages: ["dzieci", "mlodziez"], duration: 5,
    goal: "Nauka wyznaczania jednego, konkretnego celu przed każdą jednostką.",
    steps: [
      "Przed treningiem zapytaj: 'na czym dziś najbardziej Ci zależy?'",
      "Zawęźcie do jednej, konkretnej rzeczy.",
      "Sformułujcie ją jako działanie, nie wynik.",
      "Po treningu wróćcie: czy się udało? co pomogło?",
    ],
    tip: "Jeden cel na trening uczy intencjonalności — sportowiec przestaje 'tylko być' na treningu.",
  },

  // ===== PORAŻKA / RESET =====
  {
    id: "ex-reset-bledu", title: "Rytuał resetu po błędzie",
    themes: ["porazka", "koncentracja"], ages: ["dzieci", "mlodziez"], duration: 6,
    goal: "Nauczenie szybkiego 'odpuszczenia' błędu i powrotu do gry.",
    steps: [
      "Nazwij błąd bez oceniania ('przegrana piłka, ok').",
      "Wykonaj fizyczny gest resetu (klaśnięcie, otrzepanie rąk, dotknięcie linii).",
      "Jedno słowo-kotwica skupiające na następnej akcji ('teraz', 'dalej').",
      "Głęboki oddech i powrót do gry.",
      "Przećwiczcie sekwencję kilka razy na sucho.",
    ],
    tip: "Gest musi być krótki i ten sam za każdym razem — z czasem staje się automatyczny.",
  },
  {
    id: "ex-lekcja-z-porazki", title: "Trzy pytania po porażce",
    themes: ["porazka"], ages: ["mlodziez"], duration: 12,
    goal: "Zamiana nieudanego występu w konkretną naukę zamiast w samobiczowanie.",
    steps: [
      "Co zadziałało dobrze mimo wszystko? (zacznij od pozytywów)",
      "Co konkretnie nie zadziałało — fakty, nie oceny?",
      "Co zrobię inaczej następnym razem — jedna rzecz?",
      "Zapiszcie tę jedną rzecz jako cel na najbliższy trening.",
    ],
    tip: "Pierwsze pytanie o pozytywy jest kluczowe — chroni przed spiralą obwiniania się.",
  },
  {
    id: "ex-skala-bledu", title: "Jak duży jest ten błąd?",
    themes: ["porazka", "dialog"], ages: ["dzieci", "mlodziez"], duration: 7,
    goal: "Urealnienie wagi błędu, gdy sportowiec robi z drobiazgu katastrofę.",
    steps: [
      "Narysujcie skalę 0–10.",
      "Sportowiec zaznacza, jak duży 'czuje' ten błąd.",
      "Zapytaj: czy za miesiąc to nadal będzie 8/10?",
      "Co byłoby naprawdę 10/10? (urealnienie skali)",
      "Gdzie więc realnie jest ten błąd?",
    ],
    tip: "Dzieci i nastolatki często czują drobne błędy jako katastrofy — skala pomaga to urealnić.",
  },
  {
    id: "ex-zlosc-po-przegranej", title: "Co robić ze złością po przegranej",
    themes: ["porazka", "stres"], ages: ["dzieci", "mlodziez"], duration: 9,
    goal: "Nauka zdrowego rozładowania emocji po przegranej zamiast tłumienia lub wybuchu.",
    steps: [
      "Nazwij emocję ('jestem wkurzony, i to jest ok').",
      "Gdzie czujesz ją w ciele?",
      "Wybierzcie sposób rozładowania (oddech, ruch, rozmowa).",
      "Ustalcie zasadę: emocja teraz, analiza później (na spokojnie).",
      "Co pomaga Ci ochłonąć w 5 minut?",
    ],
    tip: "Przyzwolenie na emocję ('to ok, że jestem zły') działa lepiej niż 'nie złość się'.",
  },

  // ===== MOWA WEWNĘTRZNA =====
  {
    id: "ex-dialog-trener", title: "Wewnętrzny trener kontra krytyk",
    themes: ["dialog", "pewnosc", "porazka"], ages: ["mlodziez"], duration: 12,
    goal: "Rozpoznanie negatywnej mowy wewnętrznej i przekształcenie jej we wspierającą.",
    steps: [
      "Wypiszcie razem 3 zdania, które sportowiec mówi sobie po błędzie.",
      "Oznaczcie, które to 'krytyk' (osądza), a które 'trener' (pomaga).",
      "Do każdego zdania krytyka ułóżcie wersję trenera.",
      "Wybierzcie 1 zdanie-hasło na trudne momenty.",
      "Ćwiczenie domowe: zauważać krytyka przez tydzień i zamieniać go.",
    ],
    tip: "U młodszych dzieci użyj metafory dwóch postaci/zwierzaków zamiast 'trener/krytyk'.",
  },
  {
    id: "ex-dwa-glosy", title: "Dwa głosy w głowie (dla dzieci)",
    themes: ["dialog", "pewnosc"], ages: ["dzieci"], duration: 8,
    goal: "Pokazanie dziecku, że można wybierać, którego 'głosu' słucha.",
    steps: [
      "Wymyślcie dwie postacie: Pomocnika i Marudę.",
      "Co mówi Maruda, gdy coś nie wychodzi?",
      "Co na to samo powiedziałby Pomocnik?",
      "Narysujcie obie postacie.",
      "Umówcie się: gdy słyszysz Marudę, zawołaj Pomocnika.",
    ],
    tip: "Personifikacja sprawia, że abstrakcyjne 'negatywne myśli' stają się dla dziecka konkretne i 'do ogarnięcia'.",
  },
  {
    id: "ex-stop-mysli", title: "Stop myśli",
    themes: ["dialog", "koncentracja"], ages: ["mlodziez"], duration: 7,
    goal: "Technika przerywania spirali natrętnych negatywnych myśli.",
    steps: [
      "Gdy łapiesz się na natłoku negatywnych myśli — w myślach powiedz 'STOP'.",
      "Weź jeden głęboki oddech.",
      "Skieruj uwagę na coś konkretnego w otoczeniu lub na słowo-klucz.",
      "Zastąp myśl jednym przygotowanym zdaniem wspierającym.",
      "Przećwiczcie sekwencję na konkretnym przykładzie.",
    ],
    tip: "Działa najlepiej, gdy zdanie zastępcze jest przygotowane WCZEŚNIEJ, nie wymyślane w stresie.",
  },
  {
    id: "ex-jak-do-przyjaciela", title: "Jak mówiłbym do przyjaciela",
    themes: ["dialog", "pewnosc"], ages: ["dzieci", "mlodziez"], duration: 8,
    goal: "Nauka życzliwości wobec siebie przez zmianę perspektywy.",
    steps: [
      "Przypomnij sytuację, gdy sportowiec był dla siebie surowy.",
      "Co dokładnie sobie powiedział?",
      "Co powiedziałbyś koledze w tej samej sytuacji?",
      "Zauważcie różnicę w tonie.",
      "Ułóżcie 'przyjazną' wersję zdania do siebie.",
    ],
    tip: "Większość sportowców mówi do siebie znacznie ostrzej niż do kolegów — to ćwiczenie to uświadamia.",
  },

  // ===== PEWNOŚĆ SIEBIE =====
  {
    id: "ex-mocne-strony", title: "Bank dowodów pewności siebie",
    themes: ["pewnosc"], ages: ["dzieci", "mlodziez"], duration: 9,
    goal: "Zbudowanie konkretnej listy sukcesów, do której można wracać przed startem.",
    steps: [
      "Wypiszcie 5 sytuacji, w których sportowcowi coś się udało.",
      "Przy każdej: co konkretnie zrobił dobrze?",
      "Jakie cechy/umiejętności to pokazuje?",
      "Wybierzcie jedno zdanie podsumowujące ('jestem zawodnikiem, który…').",
      "Zapiszcie listę — to 'bank dowodów' na trudne chwile.",
    ],
    tip: "Pewność siebie budujemy na faktach, nie na pustych afirmacjach. Konkret z przeszłości działa najlepiej.",
  },
  {
    id: "ex-postawa-ciala", title: "Postawa mocy",
    themes: ["pewnosc", "stres"], ages: ["dzieci", "mlodziez"], duration: 5,
    goal: "Wykorzystanie mowy ciała do wzmocnienia poczucia pewności przed startem.",
    steps: [
      "Pokaż, jak wygląda ciało osoby niepewnej (skulone, opuszczona głowa).",
      "A teraz ciało osoby pewnej (wyprostowane, otwarte, głowa w górze).",
      "Sportowiec przyjmuje 'postawę mocy' na 30 sekund.",
      "Zauważcie, jak zmienia się samopoczucie.",
      "Ustalcie 'pozę gotowości' tuż przed wejściem do gry.",
    ],
    tip: "Ciało wpływa na głowę tak samo jak głowa na ciało — wyprostowana sylwetka realnie zmienia nastawienie.",
  },
  {
    id: "ex-rytual-startowy", title: "Mój rytuał przed startem",
    themes: ["stres", "pewnosc", "koncentracja"], ages: ["dzieci", "mlodziez"], duration: 10,
    goal: "Zbudowanie stałej, powtarzalnej sekwencji, która ustawia ciało i głowę przed występem.",
    steps: [
      "Wypiszcie, co sportowiec już teraz robi przed startem.",
      "Dodajcie element ciała (oddech, rozluźnienie), głowy (słowo-klucz) i ruchu.",
      "Ułóżcie z tego stałą kolejność — krótką, 30–60 sekund.",
      "Przećwiczcie ją na sucho 2–3 razy.",
      "Ustalcie, że będzie taka sama na każdym starcie.",
    ],
    tip: "Stały rytuał daje poczucie kontroli i znajomości sytuacji nawet w nowych, stresujących miejscach.",
  },

  // ===== MOTYWACJA =====
  {
    id: "ex-dlaczego", title: "Moje 'dlaczego'",
    themes: ["motywacja", "cele"], ages: ["mlodziez"], duration: 10,
    goal: "Odkrycie wewnętrznej motywacji, która utrzymuje zaangażowanie w trudne dni.",
    steps: [
      "Zapytaj: 'Dlaczego uprawiasz ten sport?' Zapisz pierwszą odpowiedź.",
      "Dopytaj 'a dlaczego to ważne?' jeszcze 3–4 razy (technika 5x dlaczego).",
      "Dotrzyjcie do prawdziwego, głębokiego powodu.",
      "Zapiszcie go jednym zdaniem.",
      "Gdzie sportowiec może to zdanie zobaczyć codziennie?",
    ],
    tip: "Prawdziwe 'dlaczego' często nie jest o medalach, tylko o emocji albo relacji. Nie naciskaj na 'poprawną' odpowiedź.",
  },
  {
    id: "ex-dziennik-postepu", title: "Dziennik małych zwycięstw",
    themes: ["motywacja", "pewnosc"], ages: ["dzieci", "mlodziez"], duration: 7,
    goal: "Nauka dostrzegania codziennych postępów, by utrzymać motywację.",
    steps: [
      "Ustalcie, że po każdym treningu sportowiec zapisuje 1 rzecz, która poszła dobrze.",
      "Może być malutka ('lepiej przyjąłem piłkę').",
      "Raz w tygodniu przeczytajcie listę razem.",
      "Zauważcie, ile drobnych postępów się uzbierało.",
    ],
    tip: "Skupienie na małych zwycięstwach przeciwdziała poczuciu 'stoję w miejscu', które zabija motywację.",
  },
  {
    id: "ex-energia-skala", title: "Skala energii i chęci",
    themes: ["motywacja", "stres"], ages: ["dzieci", "mlodziez"], duration: 6,
    goal: "Rozpoznawanie poziomu energii i świadome wpływanie na niego.",
    steps: [
      "Oceń swoją energię/chęć dziś od 0 do 10.",
      "Co podnosi Ci energię? (muzyka, ruch, cel)",
      "Co ją obniża?",
      "Wybierz 1 rzecz, która podniesie energię o jeden punkt teraz.",
      "Wypróbujcie ją od razu.",
    ],
    tip: "Sportowiec, który umie świadomie podnieść energię, nie jest zdany na 'humor dnia'.",
  },

  // ===== EMOCJE (dzieci) =====
  {
    id: "ex-termometr-napiecia", title: "Termometr napięcia",
    themes: ["stres", "koncentracja"], ages: ["dzieci"], duration: 7,
    goal: "Pomoc dziecku w rozpoznawaniu i nazywaniu poziomu stresu.",
    steps: [
      "Narysujcie termometr 0–10.",
      "Dziecko zaznacza, gdzie jest 'teraz' i gdzie bywa przed zawodami.",
      "Co czuje w ciele na każdym poziomie?",
      "Jaki jest 'dobry' poziom do startu (zwykle 4–6)?",
      "Wybierzcie 1 narzędzie obniżające napięcie (np. oddech kwadratowy).",
    ],
    tip: "Wizualna skala działa znacznie lepiej u dzieci niż abstrakcyjne pytania o uczucia.",
  },
  {
    id: "ex-kolory-emocji", title: "Kolory emocji",
    themes: ["stres", "dialog"], ages: ["dzieci"], duration: 6,
    goal: "Nauka rozpoznawania i nazywania emocji u najmłodszych sportowców.",
    steps: [
      "Przypiszcie kolory do emocji (czerwony=złość, żółty=radość, niebieski=spokój...).",
      "Jaki kolor masz teraz?",
      "Jaki kolor pojawia się przed zawodami?",
      "Co pomaga zmienić kolor na spokojniejszy?",
      "Narysujcie 'mapę kolorów' na dzień zawodów.",
    ],
    tip: "Kolory dają dzieciom język do mówienia o emocjach, zanim potrafią je nazwać wprost.",
  },
];


// ---- STRUKTURA SCENARIUSZA SESJI ----
const SESSION_STAGES = [
  { key: "wejscie", label: "Wejście / rozmowa", desc: "Sprawdzenie jak minął tydzień, nawiązanie kontaktu, podsumowanie zadania domowego.", suggestMin: 5 },
  { key: "temat", label: "Wprowadzenie tematu", desc: "Wprowadzenie tematu dnia w formie rozmowy lub historii dopasowanej do wieku.", suggestMin: 7 },
  { key: "cwiczenie", label: "Ćwiczenia praktyczne", desc: "Główna część — sportowiec doświadcza narzędzi w praktyce.", suggestMin: 14 },
  { key: "podsumowanie", label: "Podsumowanie + zadanie", desc: "Co zabieram z dziś, jedno zadanie do domu, umówienie kolejnego kroku.", suggestMin: 4 },
];

// ============================================================
//  TRWAŁY ZAPIS (localStorage)
// ============================================================
const STORAGE_PREFIX = "trening-mentalny:";
function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveStored(key, value) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); } catch (e) { console.error("Zapis nieudany:", e); }
}

// ============================================================
//  APP
// ============================================================
export default function App() {
  const [view, setView] = useState({ name: "home" });
  const [athletes, setAthletes] = useState(() => loadStored("athletes", []));
  const [topics, setTopics] = useState(() => loadStored("topics", SEED_TOPICS));
  const [exercises, setExercises] = useState(() => loadStored("exercises", SEED_EXERCISES));

  // każda zmiana danych natychmiast trafia do localStorage
  useEffect(() => { saveStored("athletes", athletes); }, [athletes]);
  useEffect(() => { saveStored("topics", topics); }, [topics]);
  useEffect(() => { saveStored("exercises", exercises); }, [exercises]);

  const loading = false;

  const upsertAthlete = (data) => setAthletes((prev) => {
    if (data.id && prev.some((p) => p.id === data.id)) return prev.map((p) => p.id === data.id ? data : p);
    return [{ ...data, id: data.id || "ath-" + Date.now(), sessions: data.sessions || [] }, ...prev];
  });
  const removeAthlete = (id) => setAthletes((prev) => prev.filter((p) => p.id !== id));
  const getAthlete = (id) => athletes?.find((a) => a.id === id);

  const saveSessionToAthlete = (athleteId, session) => {
    setAthletes((prev) => prev.map((a) =>
      a.id === athleteId ? { ...a, sessions: [session, ...(a.sessions || [])] } : a));
  };

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.brandRow} onClick={() => setView({ name: "home" })}>
            <div style={S.mark}><span style={S.markDot} /></div>
            <div>
              <h1 style={S.h1}>TRENING MENTALNY</h1>
              <p style={S.sub}>Prowadzenie sesji 1-na-1</p>
            </div>
          </div>
          <nav style={S.nav}>
            <button className="navbtn" style={{ ...S.navBtn, ...(view.name === "home" ? S.navBtnActive : {}) }}
              onClick={() => setView({ name: "home" })}>Zawodnicy</button>
            <button className="navbtn" style={{ ...S.navBtn, ...(view.name === "library" ? S.navBtnActive : {}) }}
              onClick={() => setView({ name: "library" })}>Baza</button>
          </nav>
        </div>
      </header>

      {loading ? <div style={S.loading}>Wczytuję…</div> : (
        <>
          {view.name === "home" && (
            <HomeView athletes={athletes} onOpen={(id) => setView({ name: "athlete", id })} onUpsert={upsertAthlete} />
          )}
          {view.name === "athlete" && (
            <AthleteView athlete={getAthlete(view.id)}
              onBack={() => setView({ name: "home" })}
              onStart={() => setView({ name: "builder", id: view.id })}
              onUpsert={upsertAthlete} onRemove={(id) => { removeAthlete(id); setView({ name: "home" }); }} />
          )}
          {view.name === "builder" && (
            <SessionBuilder athlete={getAthlete(view.id)} topics={topics} exercises={exercises}
              onCancel={() => setView({ name: "athlete", id: view.id })}
              onLaunch={(plan) => setView({ name: "running", id: view.id, plan })} />
          )}
          {view.name === "running" && (
            <SessionRunner athlete={getAthlete(view.id)} plan={view.plan} exercises={exercises}
              onFinish={(session) => { saveSessionToAthlete(view.id, session); setView({ name: "athlete", id: view.id }); }}
              onAbort={() => setView({ name: "athlete", id: view.id })} />
          )}
          {view.name === "library" && (
            <LibraryView topics={topics} setTopics={setTopics} exercises={exercises} setExercises={setExercises} />
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
//  HOME — lista zawodników
// ============================================================
function HomeView({ athletes, onOpen, onUpsert }) {
  const [adding, setAdding] = useState(false);
  return (
    <main style={S.main}>
      <div style={S.pageHead}>
        <div>
          <h2 style={S.pageTitle}>Moi zawodnicy</h2>
          <p style={S.pageSub}>Wybierz zawodnika, by rozpocząć sesję</p>
        </div>
        <button style={S.addBtn} className="addbtn" onClick={() => setAdding(true)}>+ Nowy zawodnik</button>
      </div>

      <div style={S.grid}>
        {athletes.map((a) => {
          const last = a.sessions?.[0];
          return (
            <article key={a.id} style={S.athCard} className="card" onClick={() => onOpen(a.id)}>
              <div style={S.athTop}>
                <div style={S.avatar}>{(a.name || "?").charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={S.athName}>{a.name}</h3>
                  <p style={S.athMeta}>{[a.sport, a.age ? a.age + " lat" : ""].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              {a.focus && <p style={S.athFocus}>{a.focus}</p>}
              <div style={S.athFoot}>
                <span style={S.sessCount}>{a.sessions?.length || 0} sesji</span>
                {last && <span style={S.lastSess}>ostatnia: {last.date}</span>}
              </div>
            </article>
          );
        })}
        {athletes.length === 0 && <Empty text="Brak zawodników. Dodaj pierwszego, by zacząć." />}
      </div>

      {adding && (
        <AthleteEditModal athlete={null} onClose={() => setAdding(false)} onSave={(d) => { onUpsert(d); setAdding(false); }} />
      )}
    </main>
  );
}

// ============================================================
//  ATHLETE — panel zawodnika
// ============================================================
function AthleteView({ athlete, onBack, onStart, onUpsert, onRemove }) {
  const [editing, setEditing] = useState(false);
  if (!athlete) return <main style={S.main}><Empty text="Nie znaleziono zawodnika." /></main>;

  return (
    <main style={S.main}>
      <button style={S.backBtn} className="addbtn" onClick={onBack}>← Wszyscy zawodnicy</button>

      <div style={S.athHero}>
        <div style={S.avatarLg}>{(athlete.name || "?").charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <h2 style={S.athHeroName}>{athlete.name}</h2>
          <p style={S.athHeroMeta}>{[athlete.sport, athlete.age ? athlete.age + " lat" : "", ageLabel(athlete.ageGroup)].filter(Boolean).join(" · ")}</p>
          {athlete.focus && <p style={S.athHeroFocus}>🎯 {athlete.focus}</p>}
        </div>
        <div style={S.athHeroActions}>
          <button style={S.editBtnSm} className="addbtn" onClick={() => setEditing(true)}>Edytuj</button>
        </div>
      </div>

      <button style={S.startSessionBtn} className="startbtn" onClick={onStart}>
        ▶ Rozpocznij sesję (30 min)
      </button>

      <h3 style={S.sectionH}>Historia sesji</h3>
      {(athlete.sessions || []).length === 0 && <p style={S.muted}>Jeszcze brak sesji. Po pierwszej pojawi się tutaj automatycznie.</p>}
      {(athlete.sessions || []).map((s, i) => {
        const th = themeById(s.themeId);
        return (
          <div key={i} style={{ ...S.sessRow, borderLeftColor: th.color }}>
            <div style={S.sessHead}>
              <span style={S.sessDate}>{s.date}</span>
              <span style={{ ...S.sessTheme, background: th.color }}>{th.label}</span>
              <span style={S.sessTopic}>{s.topicTitle}</span>
              {s.durationMin != null && <span style={S.sessDur}>{s.durationMin} min</span>}
            </div>
            {s.exercises?.length > 0 && <p style={S.sessEx}>Ćwiczenia: {s.exercises.join(", ")}</p>}
            {s.note && (
              <div style={S.sessWrapNote}>
                <strong style={S.sessWrapLabel}>Wnioski</strong>
                <p style={S.blockText}>{s.note}</p>
              </div>
            )}
            {s.stepNotes?.length > 0 && (
              <details style={S.sessNotesDetails}>
                <summary style={S.sessNotesSummary}>📝 Notatki z przebiegu ({s.stepNotes.length})</summary>
                <div style={S.sessNotesList}>
                  {s.stepNotes.map((n, j) => (
                    <div key={j} style={S.sessNoteItem}>
                      <span style={{ ...S.sessNoteItemLabel, color: th.color }}>{n.label}</span>
                      <span style={S.sessNoteItemText}>{n.text}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })}

      <div style={S.dangerZone}>
        <button style={S.btnDanger} className="addbtn" onClick={() => onRemove(athlete.id)}>Usuń zawodnika</button>
      </div>

      {editing && (
        <AthleteEditModal athlete={athlete} onClose={() => setEditing(false)} onSave={(d) => { onUpsert(d); setEditing(false); }} />
      )}
    </main>
  );
}

// ============================================================
//  SESSION BUILDER — kreator sesji przed startem
// ============================================================
function SessionBuilder({ athlete, topics, exercises, onCancel, onLaunch }) {
  const [topic, setTopic] = useState(null);
  const [activeCat, setActiveCat] = useState(null); // wybrana kategoria w kroku 1
  const [pickedEx, setPickedEx] = useState([]);
  const [rollAnim, setRollAnim] = useState(false);

  const ageMatch = (arr) => !athlete?.ageGroup || arr.includes(athlete.ageGroup);
  const eligibleTopics = useMemo(() => topics.filter((t) => ageMatch(t.ages)), [topics, athlete]);

  // kategorie z liczbą pasujących (do wieku) tematów — pokazujemy tylko niepuste
  const catsWithCount = useMemo(() =>
    THEMES.map((th) => ({ ...th, count: eligibleTopics.filter((t) => t.theme === th.id).length }))
      .filter((c) => c.count > 0),
    [eligibleTopics]);

  // tematy w wybranej kategorii
  const catTopics = useMemo(() =>
    activeCat ? eligibleTopics.filter((t) => t.theme === activeCat) : [],
    [activeCat, eligibleTopics]);

  const rollTopic = () => {
    // jeśli kategoria wybrana — losuj z niej; inaczej ze wszystkich pasujących
    const pool = (activeCat ? catTopics : eligibleTopics);
    const src = pool.length ? pool : eligibleTopics.length ? eligibleTopics : topics;
    setRollAnim(true);
    let ticks = 0;
    const iv = setInterval(() => {
      const picked = src[Math.floor(Math.random() * src.length)];
      setTopic(picked);
      if (++ticks > 8) { clearInterval(iv); setRollAnim(false); setActiveCat(picked.theme); }
    }, 80);
  };

  const suggestedEx = useMemo(() => {
    if (!topic) return [];
    return exercises.filter((e) => e.themes.includes(topic.theme) && ageMatch(e.ages));
  }, [topic, exercises, athlete]);

  const otherEx = useMemo(() => {
    if (!topic) return exercises;
    return exercises.filter((e) => !e.themes.includes(topic.theme));
  }, [topic, exercises]);

  const toggleEx = (id) => setPickedEx((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const totalExMin = pickedEx.reduce((sum, id) => sum + (exercises.find((e) => e.id === id)?.duration || 0), 0);
  const canLaunch = topic && pickedEx.length > 0;

  return (
    <main style={S.main}>
      <button style={S.backBtn} className="addbtn" onClick={onCancel}>← Anuluj</button>
      <div style={S.builderHead}>
        <h2 style={S.pageTitle}>Sesja: {athlete?.name}</h2>
        <p style={S.pageSub}>Złóż dzisiejszą sesję — wybierz temat i ćwiczenia, potem rozpocznij prowadzenie.</p>
      </div>

      <div style={S.builderStep}>
        <div style={S.stepBadge}>1</div>
        <div style={{ flex: 1 }}>
          <h3 style={S.builderStepTitle}>Temat dnia</h3>
          <div style={S.topicPickArea}>
            <button style={S.rollBtn} className="startbtn" onClick={rollTopic}>
              🎲 {topic ? "Losuj ponownie" : "Wylosuj temat"}
            </button>
            <span style={S.orText}>{activeCat ? "lub wybierz z kategorii poniżej" : "lub wybierz kategorię poniżej"}</span>
          </div>

          {topic && (
            <div style={{ ...S.chosenTopic, borderColor: themeById(topic.theme).color, ...(rollAnim ? { opacity: .6 } : {}) }}>
              <span style={{ ...S.themeTag, background: themeById(topic.theme).color, alignSelf: "flex-start" }}>{themeById(topic.theme).label}</span>
              <h4 style={S.chosenTopicTitle}>{topic.title}</h4>
              <p style={S.chosenTopicHook}>{topic.hook}</p>
            </div>
          )}

          {!activeCat ? (
            // widok kategorii
            <div style={S.catGrid}>
              {catsWithCount.map((c) => (
                <button key={c.id} className="card" onClick={() => setActiveCat(c.id)}
                  style={{ ...S.catTile, borderColor: c.color }}>
                  <span style={{ ...S.catDot, background: c.color }} />
                  <span style={S.catLabel}>{c.label}</span>
                  <span style={S.catCount}>{c.count} {c.count === 1 ? "temat" : c.count < 5 ? "tematy" : "tematów"}</span>
                </button>
              ))}
            </div>
          ) : (
            // widok tematów wybranej kategorii
            <div>
              <div style={S.catHeader}>
                <button style={S.catBack} className="addbtn" onClick={() => setActiveCat(null)}>← Kategorie</button>
                <span style={{ ...S.themeTag, background: themeById(activeCat).color }}>{themeById(activeCat).label}</span>
              </div>
              <div style={S.topicList}>
                {catTopics.map((t) => (
                  <button key={t.id} className="chip" onClick={() => setTopic(t)}
                    style={{ ...S.topicChip, ...(topic?.id === t.id ? { borderColor: themeById(t.theme).color, boxShadow: "0 0 0 2px " + themeById(t.theme).color } : {}) }}>
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...S.builderStep, ...(topic ? {} : S.stepDisabled) }}>
        <div style={S.stepBadge}>2</div>
        <div style={{ flex: 1 }}>
          <h3 style={S.builderStepTitle}>Ćwiczenia {topic && <span style={S.minBadge}>{totalExMin} min wybrane</span>}</h3>
          {!topic ? <p style={S.muted}>Najpierw wybierz temat.</p> : (
            <>
              <p style={S.suggestLabel}>Pasujące do tematu „{topic.title}":</p>
              <div style={S.exPickGrid}>
                {suggestedEx.map((e) => <ExPickCard key={e.id} e={e} picked={pickedEx.includes(e.id)} onToggle={() => toggleEx(e.id)} highlight />)}
                {suggestedEx.length === 0 && <p style={S.muted}>Brak dopasowanych ćwiczeń — wybierz z pozostałych poniżej.</p>}
              </div>
              <details style={S.otherExWrap}>
                <summary style={S.otherExSummary}>Pozostałe ćwiczenia z bazy ({otherEx.length})</summary>
                <div style={{ ...S.exPickGrid, marginTop: 12 }}>
                  {otherEx.map((e) => <ExPickCard key={e.id} e={e} picked={pickedEx.includes(e.id)} onToggle={() => toggleEx(e.id)} />)}
                </div>
              </details>
            </>
          )}
        </div>
      </div>

      <div style={S.launchBar}>
        <div>
          {canLaunch
            ? <span style={S.launchInfo}>Gotowe: <strong>{topic.title}</strong> · {pickedEx.length} ćwiczeń · ~{totalExMin} min ćwiczeń</span>
            : <span style={S.muted}>Wybierz temat i przynajmniej jedno ćwiczenie</span>}
        </div>
        <button style={{ ...S.launchBtn, ...(canLaunch ? {} : S.launchBtnOff) }} className={canLaunch ? "startbtn" : ""}
          disabled={!canLaunch} onClick={() => onLaunch({ topic, exerciseIds: pickedEx })}>
          ▶ Rozpocznij prowadzenie
        </button>
      </div>
    </main>
  );
}

function ExPickCard({ e, picked, onToggle, highlight }) {
  return (
    <button onClick={onToggle}
      style={{ ...S.exPick, ...(picked ? { borderColor: "#1B2F4E", background: "#1B2F4E", color: "#fff" } : (highlight ? { borderColor: "#F5A623" } : {})) }}>
      <div style={S.exPickTop}>
        <span style={{ ...S.exPickCheck, ...(picked ? { background: "#F5A623", borderColor: "#F5A623" } : {}) }}>{picked ? "✓" : ""}</span>
        <span style={{ ...S.exPickDur, ...(picked ? { color: "rgba(255,255,255,.7)" } : {}) }}>{e.duration} min</span>
      </div>
      <strong style={S.exPickTitle}>{e.title}</strong>
      <span style={{ ...S.exPickGoal, ...(picked ? { color: "rgba(255,255,255,.8)" } : {}) }}>{e.goal}</span>
    </button>
  );
}

// ============================================================
//  SESSION RUNNER — tryb prowadzenia krok po kroku + timer 30 min
// ============================================================
function SessionRunner({ athlete, plan, exercises, onFinish, onAbort }) {
  const TOTAL = 30 * 60;
  const [secs, setSecs] = useState(TOTAL);
  const [paused, setPaused] = useState(false);
  const [note, setNote] = useState("");          // ogólne wnioski z sesji
  const [stepNotes, setStepNotes] = useState({}); // { stepKey: tekst }
  const tickRef = useRef(null);

  const flow = useMemo(() => {
    const picked = plan.exerciseIds.map((id) => exercises.find((e) => e.id === id)).filter(Boolean);
    const arr = [];
    arr.push({ kind: "stage", stage: "wejscie", key: "stage-wejscie", label: "Wejście / rozmowa" });
    arr.push({ kind: "stage", stage: "temat", topic: plan.topic, key: "stage-temat", label: "Wprowadzenie tematu: " + plan.topic.title });
    picked.forEach((ex) => {
      arr.push({ kind: "exIntro", ex, key: "ex-" + ex.id + "-intro", label: ex.title + " — wprowadzenie" });
      ex.steps.forEach((st, i) => arr.push({ kind: "exStep", ex, stepIndex: i, step: st, total: ex.steps.length, key: "ex-" + ex.id + "-step-" + i, label: ex.title + " — krok " + (i + 1) }));
      if (ex.tip) arr.push({ kind: "exTip", ex, key: "ex-" + ex.id + "-tip", label: ex.title + " — wskazówka" });
    });
    arr.push({ kind: "stage", stage: "podsumowanie", key: "stage-podsumowanie", label: "Podsumowanie + zadanie" });
    arr.push({ kind: "wrap", key: "wrap", label: "Wnioski z sesji" });
    return arr;
  }, [plan, exercises]);

  const [step, setStep] = useState(0);
  const cur = flow[step];
  const progress = (step / (flow.length - 1)) * 100;

  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tickRef.current);
  }, [paused]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const timeLow = secs <= 300;
  const th = themeById(plan.topic.theme);

  const setNoteFor = (key, val) => setStepNotes((p) => ({ ...p, [key]: val }));

  // liczba zapisanych notatek krokowych (do licznika w nagłówku)
  const noteCount = Object.values(stepNotes).filter((v) => v && v.trim()).length;

  const finish = () => {
    const collected = flow
      .filter((f) => stepNotes[f.key] && stepNotes[f.key].trim())
      .map((f) => ({ label: f.label, text: stepNotes[f.key].trim() }));
    onFinish({
      date: new Date().toLocaleDateString("pl-PL"),
      themeId: plan.topic.theme,
      topicTitle: plan.topic.title,
      exercises: plan.exerciseIds.map((id) => exercises.find((e) => e.id === id)?.title).filter(Boolean),
      durationMin: Math.round((TOTAL - secs) / 60),
      note,
      stepNotes: collected,
    });
  };

  return (
    <div style={S.runner}>
      <div style={{ ...S.runTop, background: th.color }}>
        <button style={S.runExit} onClick={onAbort}>✕ Przerwij</button>
        <div style={S.runAthlete}>
          {athlete?.name} · {plan.topic.title}
          {noteCount > 0 && <span style={S.noteCountBadge}>📝 {noteCount}</span>}
        </div>
        <div style={{ ...S.timer, ...(timeLow ? S.timerLow : {}) }}>⏱ {mm}:{ss}</div>
      </div>
      <div style={S.progressTrack}><div style={{ ...S.progressFill, width: progress + "%", background: th.color }} /></div>

      <div style={S.runBody}>
        <div style={S.runCard} className="runcard" key={step}>
          {cur.kind === "stage" && <StageStep stage={cur.stage} topic={cur.topic} accent={th.color} />}
          {cur.kind === "exIntro" && <ExIntroStep ex={cur.ex} accent={th.color} />}
          {cur.kind === "exStep" && <ExStepView ex={cur.ex} step={cur.step} idx={cur.stepIndex} total={cur.total} accent={th.color} />}
          {cur.kind === "exTip" && <ExTipStep ex={cur.ex} />}
          {cur.kind === "wrap" && <WrapStep note={note} setNote={setNote} accent={th.color} stepNotes={flow.filter((f) => stepNotes[f.key] && stepNotes[f.key].trim()).map((f) => ({ label: f.label, text: stepNotes[f.key].trim() }))} />}

          {/* notatka per krok — na każdym kroku oprócz ekranu wniosków */}
          {cur.kind !== "wrap" && (
            <StepNote accent={th.color} value={stepNotes[cur.key] || ""} onChange={(v) => setNoteFor(cur.key, v)} />
          )}
        </div>
      </div>

      <div style={S.runNav}>
        <button style={{ ...S.navArrow, ...(step === 0 ? S.navArrowOff : {}) }} disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}>← Wstecz</button>
        <button style={S.pauseBtn} onClick={() => setPaused((p) => !p)}>{paused ? "▶ Wznów" : "⏸ Pauza"}</button>
        <span style={S.stepCounter}>{step + 1} / {flow.length}</span>
        {cur.kind === "wrap"
          ? <button style={{ ...S.navArrow, ...S.finishBtn }} className="startbtn" onClick={finish}>✓ Zakończ i zapisz</button>
          : <button style={{ ...S.navArrow, ...S.navArrowNext, background: th.color }} onClick={() => setStep((s) => Math.min(flow.length - 1, s + 1))}>Dalej →</button>}
      </div>
    </div>
  );
}

// notatka rozwijana przyciskiem "+ notatka", widoczna na każdym kroku
function StepNote({ accent, value, onChange }) {
  const [open, setOpen] = useState(false);
  const hasText = value && value.trim();
  // pokaż pole od razu, jeśli już jest jakiś tekst (np. wracamy do kroku)
  const show = open || hasText;
  return (
    <div style={S.stepNoteWrap}>
      {!show ? (
        <button style={{ ...S.addNoteBtn, color: accent, borderColor: accent }} onClick={() => setOpen(true)}>
          + notatka
        </button>
      ) : (
        <div style={S.stepNoteBox}>
          <div style={S.stepNoteHead}>
            <span style={{ ...S.stepNoteLabel, color: accent }}>📝 Notatka do tego kroku</span>
            <span style={S.stepNoteHint}>zapisuje się automatycznie</span>
          </div>
          <textarea autoFocus={open && !hasText} style={S.stepNoteArea} value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Co odpowiedział zawodnik? Na co się umawiacie? Obserwacje…" />
        </div>
      )}
    </div>
  );
}

function StageStep({ stage, topic, accent }) {
  const meta = SESSION_STAGES.find((s) => s.key === stage);
  return (
    <>
      <span style={{ ...S.runKindTag, background: accent }}>ETAP SESJI · ~{meta.suggestMin} min</span>
      <h2 style={S.runTitle}>{meta.label}</h2>
      <p style={S.runDesc}>{meta.desc}</p>
      {stage === "temat" && topic && (
        <div style={{ ...S.runTopicBox, borderColor: accent }}>
          <strong style={S.runTopicTitle}>{topic.title}</strong>
          <p style={S.runTopicHook}>{topic.hook}</p>
        </div>
      )}
      {stage === "wejscie" && (
        <ul style={S.runPrompts}>
          <li>Jak minął tydzień? Co dobrego, co trudnego?</li>
          <li>Jak poszło zadanie domowe z ostatniej sesji?</li>
          <li>Z czym dzisiaj przyszedłeś?</li>
        </ul>
      )}
      {stage === "podsumowanie" && (
        <ul style={S.runPrompts}>
          <li>Co najważniejszego zabierasz z dzisiejszej sesji?</li>
          <li>Jedno konkretne zadanie do domu na ten tydzień.</li>
          <li>Kiedy i jak to przećwiczysz?</li>
        </ul>
      )}
    </>
  );
}

function ExIntroStep({ ex, accent }) {
  return (
    <>
      <span style={{ ...S.runKindTag, background: accent }}>ĆWICZENIE · {ex.duration} min</span>
      <h2 style={S.runTitle}>{ex.title}</h2>
      <div style={{ ...S.runGoalBox, borderColor: accent }}>
        <strong style={S.runGoalLabel}>Po co to robimy</strong>
        <p style={S.runGoalText}>{ex.goal}</p>
      </div>
      <p style={S.runHint}>Za chwilę przejdziemy przez {ex.steps.length} kroków. Kliknij „Dalej", gdy będziecie gotowi.</p>
    </>
  );
}

function ExStepView({ ex, step, idx, total, accent }) {
  return (
    <>
      <span style={{ ...S.runKindTag, background: accent }}>{ex.title} · krok {idx + 1}/{total}</span>
      <div style={S.bigStepRow}>
        <div style={{ ...S.bigStepNum, background: accent }}>{idx + 1}</div>
        <h2 style={S.bigStepText}>{step}</h2>
      </div>
      <div style={S.stepDots}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{ ...S.stepDot, ...(i <= idx ? { background: accent } : {}) }} />
        ))}
      </div>
    </>
  );
}

function ExTipStep({ ex }) {
  return (
    <>
      <span style={{ ...S.runKindTag, background: "#C28A2B" }}>WSKAZÓWKA</span>
      <h2 style={S.runTitle}>{ex.title}</h2>
      <div style={S.runTipBox}>💡 {ex.tip}</div>
    </>
  );
}

function WrapStep({ note, setNote, stepNotes }) {
  return (
    <>
      <span style={{ ...S.runKindTag, background: "#27AE60" }}>KONIEC SESJI</span>
      <h2 style={S.runTitle}>Wnioski z sesji</h2>

      {stepNotes && stepNotes.length > 0 && (
        <div style={S.wrapNotesPreview}>
          <strong style={S.wrapNotesPreviewLabel}>📝 Notatki z tej sesji ({stepNotes.length})</strong>
          {stepNotes.map((n, i) => (
            <div key={i} style={S.wrapNoteItem}>
              <span style={S.wrapNoteItemLabel}>{n.label}</span>
              <span style={S.wrapNoteItemText}>{n.text}</span>
            </div>
          ))}
        </div>
      )}

      <p style={S.runDesc}>Zapisz ogólne wnioski z całego treningu — postępy, nastawienie, na co zwrócić uwagę następnym razem. Razem z notatkami powyżej trafi do historii zawodnika.</p>
      <textarea autoFocus style={S.wrapNote} value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Np. Dobra energia dzisiaj. Najlepiej zadziałał oddech kwadratowy. Następnym razem wrócić do pewności siebie." />
    </>
  );
}

// ============================================================
//  LIBRARY — baza tematów i ćwiczeń
// ============================================================
function LibraryView({ topics, setTopics, exercises, setExercises }) {
  const [sub, setSub] = useState("topics");
  const [openTopic, setOpenTopic] = useState(null);
  const [openEx, setOpenEx] = useState(null);

  return (
    <main style={S.main}>
      <div style={S.pageHead}>
        <div>
          <h2 style={S.pageTitle}>Baza</h2>
          <p style={S.pageSub}>Tematy do generatora i ćwiczenia do sesji</p>
        </div>
      </div>

      <div style={S.subTabs}>
        <button style={{ ...S.subTab, ...(sub === "topics" ? S.subTabActive : {}) }} onClick={() => setSub("topics")}>Tematy ({topics.length})</button>
        <button style={{ ...S.subTab, ...(sub === "ex" ? S.subTabActive : {}) }} onClick={() => setSub("ex")}>Ćwiczenia ({exercises.length})</button>
      </div>

      {sub === "topics" && (
        <>
          <button style={{ ...S.addBtn, marginBottom: 16 }} className="addbtn" onClick={() => setOpenTopic({ __new: true })}>+ Nowy temat</button>
          <div style={S.grid}>
            {topics.map((t) => {
              const th = themeById(t.theme);
              return (
                <article key={t.id} style={{ ...S.card, borderTopColor: th.color }} className="card" onClick={() => setOpenTopic(t)}>
                  <span style={{ ...S.themeTag, background: th.color, alignSelf: "flex-start" }}>{th.label}</span>
                  <h3 style={S.cardTitle}>{t.title}</h3>
                  <p style={S.cardObj}>{t.hook}</p>
                  <div style={S.ageRow}>{t.ages.map((a) => <span key={a} style={S.ageBadge}>{ageLabel(a)}</span>)}</div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {sub === "ex" && (
        <>
          <button style={{ ...S.addBtn, marginBottom: 16 }} className="addbtn" onClick={() => setOpenEx({ __new: true })}>+ Nowe ćwiczenie</button>
          <div style={S.grid}>
            {exercises.map((e) => (
              <article key={e.id} style={S.card} className="card" onClick={() => setOpenEx(e)}>
                <div style={S.exThemes}>
                  {e.themes.map((t) => { const th = themeById(t); return <span key={t} style={{ ...S.miniTag, background: th.color }}>{th.label}</span>; })}
                </div>
                <h3 style={S.cardTitle}>{e.title}</h3>
                <p style={S.cardObj}>{e.goal}</p>
                <div style={S.cardFoot}>
                  <div style={S.ageRow}>{e.ages.map((a) => <span key={a} style={S.ageBadge}>{ageLabel(a)}</span>)}</div>
                  <span style={S.exCount}>{e.duration} min · {e.steps.length} kr.</span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {openTopic && (
        <TopicModal topic={openTopic.__new ? null : openTopic} onClose={() => setOpenTopic(null)}
          onSave={(d) => {
            setTopics((prev) => d.id && prev.some((p) => p.id === d.id) ? prev.map((p) => p.id === d.id ? d : p) : [{ ...d, id: d.id || "tp-" + Date.now() }, ...prev]);
            setOpenTopic(null);
          }}
          onDelete={(id) => { setTopics((prev) => prev.filter((p) => p.id !== id)); setOpenTopic(null); }} />
      )}
      {openEx && (
        <ExerciseModal exercise={openEx.__new ? null : openEx} onClose={() => setOpenEx(null)}
          onSave={(d) => {
            setExercises((prev) => d.id && prev.some((p) => p.id === d.id) ? prev.map((p) => p.id === d.id ? d : p) : [{ ...d, id: d.id || "ex-" + Date.now() }, ...prev]);
            setOpenEx(null);
          }}
          onDelete={(id) => { setExercises((prev) => prev.filter((p) => p.id !== id)); setOpenEx(null); }} />
      )}
    </main>
  );
}

// ============================================================
//  MODALS
// ============================================================
function AthleteEditModal({ athlete, onClose, onSave }) {
  const [form, setForm] = useState(() => athlete || { name: "", sport: "", age: "", ageGroup: "mlodziez", focus: "" });
  return (
    <Modal onClose={onClose} accent="#1B2F4E">
      <h2 style={S.modalTitle}>{athlete ? "Edytuj zawodnika" : "Nowy zawodnik"}</h2>
      <Field label="Imię / pseudonim">
        <input style={S.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <div style={S.twoCol}>
        <Field label="Sport"><input style={S.input} value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} /></Field>
        <Field label="Wiek"><input type="number" style={S.input} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Field>
      </div>
      <Field label="Grupa wiekowa" hint="Generator tematów i podpowiedzi ćwiczeń filtrują po tym">
        <div style={S.chipsRow}>
          {AGES.map((a) => (
            <button key={a.id} className="chip" onClick={() => setForm({ ...form, ageGroup: a.id })}
              style={{ ...S.chip, ...(form.ageGroup === a.id ? { background: "#1B2F4E", color: "#fff", borderColor: "#1B2F4E" } : {}) }}>{a.label}</button>
          ))}
        </div>
      </Field>
      <Field label="Główny obszar pracy (opcjonalnie)">
        <textarea style={S.textarea} value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} />
      </Field>
      <div style={S.modalActions}>
        <button style={S.btnPrimary} className="addbtn" onClick={() => form.name.trim() && onSave(form)}>Zapisz</button>
        <button style={S.btnGhost} className="addbtn" onClick={onClose}>Anuluj</button>
      </div>
    </Modal>
  );
}

function TopicModal({ topic, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(() => topic || { title: "", theme: "stres", ages: ["mlodziez"], hook: "" });
  const toggleAge = (a) => setForm((f) => ({ ...f, ages: f.ages.includes(a) ? f.ages.filter((x) => x !== a) : [...f.ages, a] }));
  return (
    <Modal onClose={onClose} accent={themeById(form.theme).color}>
      <h2 style={S.modalTitle}>{topic ? "Edytuj temat" : "Nowy temat"}</h2>
      <Field label="Tytuł tematu"><input style={S.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
      <Field label="Obszar">
        <select style={S.input} value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
          {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Field>
      <Field label="Wiek">
        <div style={S.chipsRow}>
          {AGES.map((a) => (
            <button key={a.id} className="chip" onClick={() => toggleAge(a.id)}
              style={{ ...S.chip, ...(form.ages.includes(a.id) ? { background: "#1B2F4E", color: "#fff", borderColor: "#1B2F4E" } : {}) }}>{a.label}</button>
          ))}
        </div>
      </Field>
      <Field label="Hook / o czym to jest"><textarea style={S.textarea} value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} /></Field>
      <div style={S.modalActions}>
        <button style={S.btnPrimary} className="addbtn" onClick={() => form.title.trim() && onSave(form)}>Zapisz</button>
        <button style={S.btnGhost} className="addbtn" onClick={onClose}>Anuluj</button>
        {topic && <button style={S.btnDanger} className="addbtn" onClick={() => onDelete(form.id)}>Usuń</button>}
      </div>
    </Modal>
  );
}

function ExerciseModal({ exercise, onClose, onSave, onDelete }) {
  const [edit, setEdit] = useState(!exercise);
  const [form, setForm] = useState(() => exercise || { title: "", themes: ["stres"], ages: ["mlodziez"], duration: 5, goal: "", steps: [""], tip: "" });
  const toggleTheme = (t) => setForm((f) => ({ ...f, themes: f.themes.includes(t) ? f.themes.filter((x) => x !== t) : [...f.themes, t] }));
  const toggleAge = (a) => setForm((f) => ({ ...f, ages: f.ages.includes(a) ? f.ages.filter((x) => x !== a) : [...f.ages, a] }));
  const setStep = (i, v) => setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? v : s) }));
  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, ""] }));
  const rmStep = (i) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  return (
    <Modal onClose={onClose} accent="#1B2F4E">
      {!edit ? (
        <>
          <div style={S.exThemes}>{form.themes.map((t) => { const th = themeById(t); return <span key={t} style={{ ...S.miniTag, background: th.color }}>{th.label}</span>; })}</div>
          <h2 style={S.modalTitle}>{form.title}</h2>
          <div style={S.metaRow}>
            <span style={S.metaItem}>⏱ {form.duration} min</span>
            <span style={S.metaItem}>👤 {form.ages.map(ageLabel).join(", ")}</span>
          </div>
          <div style={S.objBox}><strong style={S.objLabel}>Po co to ćwiczenie</strong><p style={S.objText}>{form.goal}</p></div>
          <h4 style={S.sectionH}>Jak przeprowadzić</h4>
          <ol style={S.stepsList}>{form.steps.filter(Boolean).map((s, i) => <li key={i} style={S.stepItem}>{s}</li>)}</ol>
          {form.tip && <div style={S.tipBox}><strong>💡 Wskazówka:</strong> {form.tip}</div>}
          <div style={S.modalActions}>
            <button style={S.btnGhost} className="addbtn" onClick={() => setEdit(true)}>Edytuj</button>
            {exercise && <button style={S.btnDanger} className="addbtn" onClick={() => onDelete(form.id)}>Usuń</button>}
          </div>
        </>
      ) : (
        <>
          <h2 style={S.modalTitle}>{exercise ? "Edytuj ćwiczenie" : "Nowe ćwiczenie"}</h2>
          <Field label="Tytuł"><input style={S.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Obszary">
            <div style={S.chipsRow}>
              {THEMES.map((t) => (
                <button key={t.id} className="chip" onClick={() => toggleTheme(t.id)}
                  style={{ ...S.chip, ...(form.themes.includes(t.id) ? { background: themeById(t.id).color, color: "#fff", borderColor: themeById(t.id).color } : {}) }}>{t.label}</button>
              ))}
            </div>
          </Field>
          <div style={S.twoCol}>
            <Field label="Wiek">
              <div style={S.chipsRow}>
                {AGES.map((a) => (
                  <button key={a.id} className="chip" onClick={() => toggleAge(a.id)}
                    style={{ ...S.chip, ...(form.ages.includes(a.id) ? { background: "#1B2F4E", color: "#fff", borderColor: "#1B2F4E" } : {}) }}>{a.label}</button>
                ))}
              </div>
            </Field>
            <Field label="Czas (min)"><input type="number" style={S.input} value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} /></Field>
          </div>
          <Field label="Po co to ćwiczenie"><textarea style={S.textarea} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></Field>
          <Field label="Kroki">
            {form.steps.map((s, i) => (
              <div key={i} style={S.stepEditRow}>
                <span style={S.stepNum}>{i + 1}</span>
                <input style={{ ...S.input, flex: 1 }} value={s} onChange={(e) => setStep(i, e.target.value)} />
                <button style={S.rmBtn} onClick={() => rmStep(i)}>×</button>
              </div>
            ))}
            <button style={S.btnGhostSm} className="addbtn" onClick={addStep}>+ Dodaj krok</button>
          </Field>
          <Field label="Wskazówka (opcjonalnie)"><textarea style={S.textarea} value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value })} /></Field>
          <div style={S.modalActions}>
            <button style={S.btnPrimary} className="addbtn" onClick={() => form.title.trim() && onSave({ ...form, steps: form.steps.filter(Boolean) })}>Zapisz</button>
            <button style={S.btnGhost} className="addbtn" onClick={onClose}>Anuluj</button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ============================================================
//  SHARED UI
// ============================================================
function Modal({ children, onClose, accent }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, borderTopColor: accent }} className="modal" onClick={(e) => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
function Field({ label, hint, children }) {
  return (
    <div style={S.field}>
      <label style={S.fieldLabel}>{label}</label>
      {hint && <span style={S.fieldHint}>{hint}</span>}
      {children}
    </div>
  );
}
function Empty({ text }) { return <div style={S.empty}>{text}</div>; }

// ============================================================
//  STYLES
// ============================================================
const NAVY = "#1B2F4E", ORANGE = "#F5A623", PAPER = "#F4F1EA", INK = "#15202E";

const S = {
  root: { minHeight: "100vh", background: PAPER, color: INK, fontFamily: "'Inter', system-ui, sans-serif" },
  header: { background: NAVY, color: "#fff", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 2px 20px rgba(0,0,0,.15)" },
  headerInner: { maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  brandRow: { display: "flex", alignItems: "center", gap: 13, cursor: "pointer" },
  mark: { width: 42, height: 42, borderRadius: 11, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,166,35,.4)" },
  markDot: { width: 15, height: 15, borderRadius: "50%", background: NAVY },
  h1: { margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "2px", fontFamily: "'Bebas Neue','Arial Narrow',sans-serif" },
  sub: { margin: 0, fontSize: 11.5, opacity: .7, letterSpacing: ".5px" },
  nav: { display: "flex", gap: 6, background: "rgba(255,255,255,.08)", padding: 5, borderRadius: 12 },
  navBtn: { border: "none", background: "transparent", color: "rgba(255,255,255,.7)", padding: "9px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .2s" },
  navBtnActive: { background: "#fff", color: NAVY },
  main: { maxWidth: 1100, margin: "0 auto", padding: 24 },
  loading: { textAlign: "center", padding: 80, color: "#888" },

  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 },
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 800 },
  pageSub: { margin: "4px 0 0", fontSize: 14, color: "#7a8494" },
  addBtn: { background: NAVY, color: "#fff", border: "none", padding: "11px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" },
  backBtn: { background: "transparent", border: "none", color: NAVY, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "4px 0", marginBottom: 16 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 },

  athCard: { background: "#fff", borderRadius: 16, padding: 18, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,.05)", transition: "transform .18s, box-shadow .18s", display: "flex", flexDirection: "column", gap: 10, borderTop: "4px solid " + ORANGE },
  athTop: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 12, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, flexShrink: 0 },
  athName: { margin: 0, fontSize: 18, fontWeight: 800 },
  athMeta: { margin: "2px 0 0", fontSize: 13, color: "#7a8494" },
  athFocus: { margin: 0, fontSize: 13.5, color: "#5a6472", lineHeight: 1.45 },
  athFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0ECE2", paddingTop: 10 },
  sessCount: { fontSize: 12.5, color: ORANGE, fontWeight: 700 },
  lastSess: { fontSize: 12, color: "#aaa" },

  athHero: { display: "flex", gap: 18, alignItems: "center", background: "#fff", borderRadius: 18, padding: 22, marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,.05)", flexWrap: "wrap" },
  avatarLg: { width: 64, height: 64, borderRadius: 16, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, flexShrink: 0 },
  athHeroName: { margin: 0, fontSize: 26, fontWeight: 800 },
  athHeroMeta: { margin: "3px 0 0", fontSize: 14, color: "#7a8494" },
  athHeroFocus: { margin: "8px 0 0", fontSize: 14, color: "#5a6472" },
  athHeroActions: { display: "flex", gap: 8 },
  editBtnSm: { background: PAPER, border: "1.5px solid #E2DDD2", color: NAVY, padding: "9px 16px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer" },

  startSessionBtn: { width: "100%", background: ORANGE, color: NAVY, border: "none", padding: "18px", borderRadius: 14, fontSize: 18, fontWeight: 800, cursor: "pointer", marginBottom: 28, boxShadow: "0 6px 20px rgba(245,166,35,.4)", letterSpacing: ".3px" },

  sessRow: { borderLeft: "4px solid " + ORANGE, marginBottom: 14, background: "#fff", borderRadius: "0 12px 12px 0", padding: "12px 16px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" },
  sessHead: { display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap", marginBottom: 5 },
  sessDate: { fontSize: 12.5, fontWeight: 800, color: NAVY },
  sessTheme: { fontSize: 10.5, color: "#fff", padding: "2px 8px", borderRadius: 5, fontWeight: 700 },
  sessTopic: { fontSize: 13.5, fontWeight: 700 },
  sessDur: { fontSize: 11.5, color: "#aaa", marginLeft: "auto", fontWeight: 600 },
  sessEx: { margin: "2px 0 4px", fontSize: 12.5, color: "#8a94a0", fontStyle: "italic" },

  dangerZone: { marginTop: 36, paddingTop: 18, borderTop: "1px dashed #ddd" },

  builderHead: { marginBottom: 20 },
  builderStep: { display: "flex", gap: 16, background: "#fff", borderRadius: 16, padding: 22, marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,.05)" },
  stepDisabled: { opacity: .55 },
  stepBadge: { width: 34, height: 34, borderRadius: 10, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, flexShrink: 0 },
  builderStepTitle: { margin: "3px 0 14px", fontSize: 19, fontWeight: 800 },
  minBadge: { fontSize: 12, fontWeight: 700, color: ORANGE, marginLeft: 8 },
  topicPickArea: { display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" },
  rollBtn: { background: NAVY, color: "#fff", border: "none", padding: "12px 22px", borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  orText: { fontSize: 13, color: "#aaa" },
  chosenTopic: { border: "2px solid", borderRadius: 14, padding: "16px 18px", marginBottom: 16, background: PAPER, transition: "opacity .1s", display: "flex", flexDirection: "column", gap: 6 },
  chosenTopicTitle: { margin: 0, fontSize: 21, fontWeight: 800 },
  chosenTopicHook: { margin: 0, fontSize: 14, color: "#5a6472", lineHeight: 1.5 },
  topicList: { display: "flex", flexWrap: "wrap", gap: 8 },
  topicChip: { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 22, border: "1.5px solid #E2DDD2", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: INK, transition: "all .15s" },

  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 },
  catTile: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, padding: "14px 16px", borderRadius: 13, border: "2px solid", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all .15s", color: INK, font: "inherit" },
  catDot: { width: 14, height: 14, borderRadius: "50%" },
  catLabel: { fontSize: 14.5, fontWeight: 800, lineHeight: 1.2 },
  catCount: { fontSize: 12, color: "#8a94a0", fontWeight: 600 },
  catHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  catBack: { background: PAPER, border: "1.5px solid #E2DDD2", color: NAVY, padding: "7px 14px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer" },

  suggestLabel: { margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#5a6472" },
  exPickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12, marginBottom: 8 },
  exPick: { textAlign: "left", border: "2px solid #E2DDD2", borderRadius: 13, padding: 14, background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, transition: "all .15s", color: INK, font: "inherit" },
  exPickTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  exPickCheck: { width: 22, height: 22, borderRadius: 7, border: "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: NAVY },
  exPickDur: { fontSize: 12, fontWeight: 700, color: "#aaa" },
  exPickTitle: { fontSize: 15, fontWeight: 800, lineHeight: 1.2 },
  exPickGoal: { fontSize: 12.5, color: "#7a8494", lineHeight: 1.4 },
  otherExWrap: { marginTop: 10 },
  otherExSummary: { cursor: "pointer", fontSize: 13, fontWeight: 700, color: NAVY, padding: "6px 0" },

  launchBar: { position: "sticky", bottom: 0, background: "#fff", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, boxShadow: "0 -4px 20px rgba(0,0,0,.1)", flexWrap: "wrap", marginTop: 8 },
  launchInfo: { fontSize: 14, color: "#3a4451" },
  launchBtn: { background: ORANGE, color: NAVY, border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" },
  launchBtnOff: { background: "#E2DDD2", color: "#aaa", cursor: "not-allowed" },

  runner: { position: "fixed", inset: 0, background: PAPER, display: "flex", flexDirection: "column", zIndex: 100 },
  runTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", color: "#fff", gap: 12 },
  runExit: { background: "rgba(255,255,255,.2)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  runAthlete: { fontSize: 14, fontWeight: 700, opacity: .95, textAlign: "center", flex: 1 },
  timer: { fontSize: 22, fontWeight: 800, fontVariantNumeric: "tabular-nums", background: "rgba(0,0,0,.18)", padding: "6px 14px", borderRadius: 10, letterSpacing: "1px" },
  timerLow: { background: "#D6453F", animation: "pulse 1s infinite" },
  progressTrack: { height: 5, background: "rgba(0,0,0,.08)" },
  progressFill: { height: "100%", transition: "width .3s" },

  runBody: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" },
  runCard: { background: "#fff", borderRadius: 22, padding: "40px 44px", maxWidth: 640, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,.1)", display: "flex", flexDirection: "column", gap: 14 },
  runKindTag: { alignSelf: "flex-start", color: "#fff", fontSize: 12, fontWeight: 800, padding: "5px 13px", borderRadius: 7, textTransform: "uppercase", letterSpacing: ".5px" },
  runTitle: { margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.15 },
  runDesc: { margin: 0, fontSize: 16, color: "#5a6472", lineHeight: 1.6 },
  runTopicBox: { border: "2px solid", borderRadius: 14, padding: 18, background: PAPER },
  runTopicTitle: { fontSize: 20, fontWeight: 800, display: "block", marginBottom: 5 },
  runTopicHook: { margin: 0, fontSize: 15, color: "#5a6472", lineHeight: 1.5 },
  runPrompts: { margin: "4px 0 0", paddingLeft: 22, fontSize: 17, lineHeight: 1.9, color: "#2a3441" },
  runGoalBox: { borderLeft: "4px solid", borderRadius: "0 12px 12px 0", padding: "12px 16px", background: PAPER },
  runGoalLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: ORANGE, fontWeight: 800 },
  runGoalText: { margin: "5px 0 0", fontSize: 16, lineHeight: 1.55 },
  runHint: { margin: 0, fontSize: 14, color: "#aaa", fontStyle: "italic" },
  bigStepRow: { display: "flex", gap: 18, alignItems: "flex-start" },
  bigStepNum: { width: 48, height: 48, borderRadius: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 },
  bigStepText: { margin: 0, fontSize: 26, fontWeight: 700, lineHeight: 1.3 },
  stepDots: { display: "flex", gap: 8, marginTop: 6 },
  stepDot: { width: 12, height: 12, borderRadius: "50%", background: "#E2DDD2", transition: "background .2s" },
  runTipBox: { background: "#FFF6E5", border: "1.5px solid #FBE0A6", borderRadius: 14, padding: "18px 20px", fontSize: 17, lineHeight: 1.6, color: "#7a5e1a" },
  wrapNote: { width: "100%", minHeight: 140, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #E2DDD2", fontSize: 16, fontFamily: "inherit", lineHeight: 1.5, outline: "none", resize: "vertical" },

  runNav: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 22px", background: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,.06)", flexWrap: "wrap" },
  navArrow: { border: "1.5px solid #E2DDD2", background: "#fff", color: NAVY, padding: "13px 24px", borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  navArrowNext: { border: "none", color: "#fff" },
  navArrowOff: { opacity: .4, cursor: "not-allowed" },
  pauseBtn: { border: "1.5px solid #E2DDD2", background: PAPER, color: NAVY, padding: "13px 20px", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  stepCounter: { fontSize: 13, color: "#aaa", fontWeight: 700, minWidth: 60, textAlign: "center" },
  finishBtn: { background: "#27AE60", color: "#fff", border: "none" },

  subTabs: { display: "flex", gap: 8, marginBottom: 18 },
  subTab: { border: "1.5px solid #E2DDD2", background: "#fff", color: "#7a8494", padding: "9px 18px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  subTabActive: { background: NAVY, color: "#fff", borderColor: NAVY },

  card: { background: "#fff", borderRadius: 16, padding: 18, cursor: "pointer", borderTop: "4px solid " + NAVY, boxShadow: "0 2px 10px rgba(0,0,0,.05)", transition: "transform .18s, box-shadow .18s", display: "flex", flexDirection: "column", gap: 9 },
  cardTitle: { margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.2 },
  cardObj: { margin: 0, fontSize: 13, color: "#5a6472", lineHeight: 1.5, flex: 1 },
  cardFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0ECE2", paddingTop: 9, marginTop: 2 },
  themeTag: { color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: ".5px" },
  exThemes: { display: "flex", gap: 5, flexWrap: "wrap" },
  miniTag: { color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5 },
  ageRow: { display: "flex", gap: 5, flexWrap: "wrap" },
  ageBadge: { fontSize: 10.5, background: PAPER, color: "#7a8494", padding: "3px 8px", borderRadius: 5, fontWeight: 600 },
  exCount: { fontSize: 12, color: ORANGE, fontWeight: 700 },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#bbb", fontSize: 15 },

  overlay: { position: "fixed", inset: 0, background: "rgba(21,32,46,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", zIndex: 50, overflowY: "auto" },
  modal: { background: "#fff", borderRadius: 18, padding: "30px 28px", maxWidth: 600, width: "100%", borderTop: "5px solid " + NAVY, position: "relative", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 20px 60px rgba(0,0,0,.3)" },
  closeBtn: { position: "absolute", top: 14, right: 16, border: "none", background: PAPER, width: 34, height: 34, borderRadius: "50%", fontSize: 22, lineHeight: 1, cursor: "pointer", color: "#888" },
  modalTitle: { margin: "4px 0 10px", fontSize: 24, fontWeight: 800, lineHeight: 1.15 },
  metaRow: { display: "flex", gap: 16, marginBottom: 6, flexWrap: "wrap" },
  metaItem: { fontSize: 13, color: "#7a8494", fontWeight: 600 },
  objBox: { background: PAPER, borderRadius: 12, padding: "13px 15px", margin: "6px 0" },
  objLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: ORANGE, fontWeight: 800 },
  objText: { margin: "5px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "#2a3441" },
  sectionH: { margin: "16px 0 10px", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", color: NAVY, fontWeight: 800, borderBottom: "2px solid " + PAPER, paddingBottom: 6 },
  blockText: { margin: "3px 0 0", fontSize: 14, lineHeight: 1.55, color: "#3a4451" },
  muted: { color: "#b0b0b0", fontSize: 14 },
  stepsList: { margin: "0 0 8px", paddingLeft: 0, listStyle: "none", counterReset: "step" },
  stepItem: { position: "relative", paddingLeft: 38, marginBottom: 12, fontSize: 14.5, lineHeight: 1.55, counterIncrement: "step" },
  tipBox: { background: "#FFF6E5", border: "1.5px solid #FBE0A6", borderRadius: 12, padding: "12px 15px", fontSize: 14, lineHeight: 1.55, marginTop: 6, color: "#7a5e1a" },
  modalActions: { display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" },
  btnPrimary: { background: NAVY, color: "#fff", border: "none", padding: "12px 26px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnGhost: { background: "transparent", color: NAVY, border: "1.5px solid " + NAVY, padding: "12px 26px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnGhostSm: { background: "transparent", color: NAVY, border: "1.5px dashed #C9D2DE", padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 4 },
  btnDanger: { background: "transparent", color: "#D6453F", border: "1.5px solid #F0C4C2", padding: "11px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", marginLeft: "auto" },
  field: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 13 },
  fieldLabel: { fontSize: 13, fontWeight: 700, color: NAVY },
  fieldHint: { fontSize: 12, color: "#9aa4b0", marginTop: -2, marginBottom: 2 },
  input: { padding: "10px 13px", borderRadius: 9, border: "1.5px solid #E2DDD2", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" },
  textarea: { padding: "10px 13px", borderRadius: 9, border: "1.5px solid #E2DDD2", fontSize: 14, outline: "none", fontFamily: "inherit", minHeight: 70, resize: "vertical", lineHeight: 1.5, background: "#fff" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  chipsRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, border: "1.5px solid #E2DDD2", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: INK, transition: "all .15s" },
  chipDot: { width: 8, height: 8, borderRadius: "50%" },
  stepEditRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  stepNum: { width: 24, height: 24, borderRadius: 6, background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: NAVY, flexShrink: 0 },
  rmBtn: { border: "none", background: "#FBE9E8", color: "#D6453F", width: 30, height: 30, borderRadius: 7, fontSize: 18, cursor: "pointer", flexShrink: 0 },

  // notatka per krok w runnerze
  noteCountBadge: { marginLeft: 10, fontSize: 12, fontWeight: 700, background: "rgba(0,0,0,.2)", padding: "3px 9px", borderRadius: 20 },
  stepNoteWrap: { marginTop: 18, paddingTop: 16, borderTop: "1px dashed #E2DDD2" },
  addNoteBtn: { background: "transparent", border: "1.5px dashed", padding: "9px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  stepNoteBox: { display: "flex", flexDirection: "column", gap: 8 },
  stepNoteHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
  stepNoteLabel: { fontSize: 13, fontWeight: 800 },
  stepNoteHint: { fontSize: 11.5, color: "#aaa" },
  stepNoteArea: { width: "100%", minHeight: 80, padding: "12px 14px", borderRadius: 11, border: "1.5px solid #E2DDD2", fontSize: 15, fontFamily: "inherit", lineHeight: 1.5, outline: "none", resize: "vertical" },

  // podgląd notatek na ekranie wniosków
  wrapNotesPreview: { background: PAPER, borderRadius: 13, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 },
  wrapNotesPreviewLabel: { fontSize: 13, fontWeight: 800, color: NAVY },
  wrapNoteItem: { display: "flex", flexDirection: "column", gap: 2, paddingLeft: 12, borderLeft: "3px solid #E2DDD2" },
  wrapNoteItemLabel: { fontSize: 11.5, fontWeight: 700, color: "#8a94a0" },
  wrapNoteItemText: { fontSize: 14, color: "#2a3441", lineHeight: 1.45 },

  // historia: wnioski + notatki krokowe
  sessWrapNote: { marginTop: 4 },
  sessWrapLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: ORANGE, fontWeight: 800 },
  sessNotesDetails: { marginTop: 8 },
  sessNotesSummary: { cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: NAVY, padding: "4px 0" },
  sessNotesList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  sessNoteItem: { display: "flex", flexDirection: "column", gap: 2, paddingLeft: 11, borderLeft: "3px solid #E2DDD2" },
  sessNoteItemLabel: { fontSize: 11.5, fontWeight: 700 },
  sessNoteItemText: { fontSize: 13.5, color: "#3a4451", lineHeight: 1.45 },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(27,47,78,.13) !important; }
.navbtn:hover { color: #fff !important; }
.chip:hover { border-color: #1B2F4E !important; }
.addbtn, .startbtn { transition: all .15s; }
.addbtn:hover, .startbtn:hover { opacity: .9; transform: translateY(-1px); }
.runcard { animation: slideIn .25s ease; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
.modal ol li::before {
  content: counter(step); position: absolute; left: 0; top: 0;
  width: 26px; height: 26px; border-radius: 7px; background: #1B2F4E; color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800;
}
input:focus, textarea:focus, select:focus { border-color: #1B2F4E !important; }
summary::-webkit-details-marker { color: #1B2F4E; }
`;

# Weryfikacja aktualizacji Premium — 29.09.2026

## Testy automatyczne: 8/8

`node --test --test-isolation=none tests/model.test.cjs tests/i18n.test.cjs`

Walidacja, daty, sortowanie, filtry, liczniki, format zapisu, kompletność siedmiu słowników i zachowanie treści użytkownika. Składnia app.js poprawna.

## Sprawdzone w przeglądarce

- Kliknięcia kart podsumowania i zakładki Zaplanowane zmieniają listę, tytuł oraz aktywne przełączniki.
- Dodanie zadania z widoku Dzisiaj, edycja notatki i priorytetu; zapis zachowany po odświeżeniu.
- Ukończenie zadania i odnalezienie go w Ukończonych.
- Usunięcie oraz cofnięcie usunięcia z zachowaniem danych.
- Brak wyników wyszukiwania oraz przywrócenie listy przez Wyczyść filtry.
- Aktywacja karty klawiszem Enter i powrót do wcześniejszego widoku przez historię przeglądarki.
- Siedem języków na szerokości 375 px: bez poziomego przewijania.
- Oględziny formularza na telefonie i układu komputerowego.
- Brak zarejestrowanych błędów konsoli podczas tych scenariuszy.

Zadanie utworzone do sprawdzenia zostało usunięte z lokalnego podglądu. Paczka nie zawiera danych użytkownika z przeglądarki. Wdrożenie na GitHub Pages nie zostało wykonane. Starszy QA-REPORT.md dokumentuje weryfikację poprzedniej wersji.

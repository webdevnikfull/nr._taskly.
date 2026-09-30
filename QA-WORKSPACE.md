# Weryfikacja Workspace v4

Data: 2026-09-30. Testy na lokalnym serwerze HTTP, z syntetycznym profilem i zadaniami. Dane testowe nie są częścią paczki aplikacji.

## Automatycznie: 12/12 testów zaliczonych

Walidacja i zapis zadań, filtry, sortowanie, zgodność siedmiu języków, kalendarz z rokiem przestępnym, wybór zadań do raportu, wykluczanie przykładów, haszowanie haseł, odrzucenie błędnego logowania i osobne klucze zapisu profili.

## Przeglądarka

- Rejestracja lokalnego profilu, wylogowanie, błąd przy złym haśle i poprawne ponowne logowanie.
- Zachowanie profilu i zapisanych zadań po odświeżeniu strony.
- Dodanie dwóch zadań z kalendarza i ukończenie jednego; zachowanie widoku kalendarza.
- Przejście do następnego miesiąca i powrót przyciskiem Dzisiaj.
- Raport: dwa zadania, jedno ukończone, jedno pozostałe, 50% realizacji. Wybór pustego miesiąca daje zera.
- Pobranie i wizualna kontrola rzeczywistego PNG 1400 × 1150.
- Zegar zmienia wyświetlany czas.
- Widoki kalendarza i raportu na ekranie 375 × 812; brak poziomego przepełnienia strony. Siedem wersji językowych raportu.
- Brak błędów JavaScript w konsoli podczas tych scenariuszy.

## Zakres

Przycisk Drukuj / PDF używa systemowego drukowania przeglądarki i dedykowanych stylów druku. Fizycznego wydruku ani zapisu PDF w oknie systemowym nie testowano. Nie testowano wszystkich przeglądarek, prywatnego trybu przeglądania ani publikacji na GitHub Pages. Starsze pliki QA opisują poprzednie wersje.

# Weryfikacja Taskly — 20.09.2026

## Testy jednostkowe: 6/6 zaliczonych

Uruchomienie: `node tests/model.test.cjs` (alternatywnie `node --test tests/model.test.cjs`).

Sprawdzono: puste nazwy i same spacje, niepoprawne daty i priorytety, rok przestępny, przycinanie tekstu, zachowanie tekstu przypominającego HTML, liczniki aktywnych/dzisiejszych/zaległych/ukończonych, łączenie wyszukiwania z filtrami, sortowanie oraz walidację zapisu i duplikatów ID.

## Testy wykonane w przeglądarce

- Dodanie zadania i zachowanie go po odświeżeniu.
- Edycja nazwy, notatki, terminu i priorytetu.
- Tekst przypominający HTML w notatce wyświetla się jako tekst.
- Kończenie zadania, widok Ukończone i przywrócenie do aktywnych.
- Usunięcie oraz cofnięcie z zachowaniem treści.
- Odrzucenie nazwy składającej się ze spacji.
- Filtr priorytetu, wyszukiwanie, pusty wynik i czyszczenie filtrów.
- Usunięcie przykładów zachowuje własne zadania; cofnięcie przywraca przykłady.
- Brak poziomego przepełnienia przy szerokości 320, 390 i 768 px; obejrzany również widok desktop.
- Brak błędów JavaScript w konsoli podczas tych scenariuszy.

## Zakres i ograniczenia

Testy interakcji wykonano w przeglądarce wbudowanej w Codex. Nie jest to pełna macierz Chrome/Firefox/Safari ani audyt WCAG. Eksport używa pliku Blob i atrybutu download; wbudowana przeglądarka nie potwierdziła zdarzenia pobrania. Pobieranie należy dodatkowo sprawdzić w docelowej przeglądarce. Nie symulowano pełnego limitu localStorage ani równoczesnych konfliktujących zapisów między kartami. Funkcja obsługi błędów zapisu i synchronizacji między kartami jest zaimplementowana.

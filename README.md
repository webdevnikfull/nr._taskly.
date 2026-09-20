# Taskly — personal task manager

Projekt portfolio Nikity Rysieva. HTML, CSS i JavaScript bez zewnętrznych bibliotek, fontów i usług. Interfejs po polsku, responsywny układ w granatowej stylistyce portfolio.

## Uruchomienie

Otwórz `index.html` albo umieść cały folder na hostingu statycznym. Dla stabilnego działania localStorage użyj serwera HTTP, np. `python -m http.server 8080`, i otwórz http://localhost:8080.

## Funkcje

- Dodawanie, edycja, kończenie, przywracanie i usuwanie zadań.
- Cofanie usunięcia przez 15 sekund.
- Notatki, terminy i trzy priorytety.
- Widoki aktywnych, dzisiejszych, zaplanowanych i ukończonych zadań.
- Wyszukiwanie po nazwie i notatce, filtrowanie oraz sortowanie.
- Zapis w localStorage, synchronizacja otwartych kart, eksport JSON.
- Przykładowe zadania oznaczone w UI, możliwe do usunięcia niezależnie od własnych zadań.
- Klawiatura: N — nowe zadanie, / — wyszukiwanie, Escape — zamknięcie formularza.

Widok „Wszystkie” pokazuje zadania aktywne; ukończone mają własną zakładkę. „Zaplanowane” obejmuje wszystkie aktywne zadania z terminem, również zaległe. Termin jest datą lokalną bez godziny.

Dane są lokalne dla przeglądarki i adresu strony. Nie ma konta użytkownika, serwera, synchronizacji między urządzeniami ani powiadomień o terminach. Usunięcie danych przeglądarki usuwa zapis — eksport JSON służy jako kopia. Przy równoczesnych zapisach z wielu kart obowiązuje ostatni zapis.

## Kod i testy

- `model.js`: walidacja, filtry, sortowanie i format zapisu.
- `app.js`: interakcje, DOM i localStorage. Nazwy i notatki są renderowane przez textContent, bez wykonywania HTML użytkownika.
- `styles.css`: wygląd oraz breakpointy.
- `tests/model.test.cjs`: testy regresji. Uruchom `node --test tests/model.test.cjs`.

## Scenariusze manualne QA

1. Dodaj zadanie, odśwież stronę, sprawdź treść i liczniki.
2. Spróbuj zapisać pustą nazwę i same spacje; zapis powinien być odrzucony.
3. Zmień nazwę, notatkę, priorytet i termin. Sprawdź odpowiednie filtry.
4. Ukończ zadanie; przejdź do Ukończonych i przywróć je.
5. Usuń zadanie i cofnij; treść i stan powinny zostać zachowane.
6. Wyszukaj nieistniejącą frazę i wyczyść filtry z pustego widoku.
7. Usuń przykłady; własne zadania powinny pozostać.
8. Obsłuż formularz klawiaturą, sprawdź Escape i powrót fokusu.
9. Sprawdź układ na telefonie i eksport JSON.

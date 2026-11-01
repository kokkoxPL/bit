# Projekt na rekrutację do BIT Web

### Backend

**Wymaga wersji Node.js 26**

Napisany w Node.js przy pomocy express, wykorzystuje:

- jwt, cors, cookie-parser
- wbudowany w node.js sqlite i crypto
- nowy api do dat **Temporal**

Chciałem sie pobawić nowymi rzeczami dodane do najnowszych wersji node dlatego zamiast wykorzystywać różne paczki, probowałem wykorzystać wbudowane rzeczy w node. Wykorzystałem sqlite ponieważ nie widziałem sensu mieć bazy postgres do prostego projektu i crypto do hashowania hasła i uuid.

### Frontend

Napisany w React z pomocą react-router. Na początku miał być sam react ale po zobaczeniu react-router w najnowszej wersji (v8) ma ciekawe zmiany, chciałem spróbować jedną z nowych funkcjonalności (Data mode).
Po za tym też wykorzystałem **Temporal** o którym słyszałem parę lat a dopiero w tym roku większość przeglądarek zaczęła wspierać. Po za tym wpadłem na okropny pomysł żeby samemu zaimplementować działajacy kalendarz co nie było dobrym pomysłem, gdyż zajeło to mi za dużo czas, a działa średnio.

### Setup

Backend jest na porcie 3000, a frontend na 5173

Głównie do każdego folderu trzeba

1. zainstalować paczki npm
2. zamień nazwę .env.example na .env (można zmienić defaultowe wartości bo nie powinno to nic zepsuć(chyba))
3. odpalić npm run dev w każdym folderze do szybkiego przetestowania

### AI

AI był głównie wykorzystany do szukania informacji o różnych modułach lub paczkach w celu jak to działa i prosty przykład (umiem czytać docsy ale nie zawsze chce mi się szukać godzinę jak korzystać z rzeczy jak 'crypto' w node, a wiele tutoriali do node.js ma stare informacje).
Był też wykorzystany do zrobienia kalendarza w React (rzeczy związane z tym kalendarzem są tak pokomplikowane, gdyż moje idea jak to ma działać zmieniała się czesto co ostatecznie doprowadziło, że większość rzeczy na stronie to kalendarz i dialogi).

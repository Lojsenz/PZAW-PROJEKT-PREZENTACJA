# Blog

Aplikacja blogowa z podziałem na role (użytkownik / administrator)
## Funkcjonalności

- Rejestracja i logowanie użytkowników 
- Hasła **argon2**.
- Role użytkowników: `user` oraz `admin`.
- Tworzenie, przeglądanie i usuwanie własnych wpisów.
- Panel administratora:
  - statystyki (liczba użytkowników, liczba wpisów, czas działania serwera),
  - lista użytkowników i zmiana ich roli,
  - usuwanie dowolnych wpisów.

## Stos technologiczny

| Warstwa  | Technologie |
|----------|-------------|
| Backend  | Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL, argon2, cookie-parser |
| Frontend | React 19, Vite 7, TypeScript, React Router 7, TailwindCSS 4, shadcn/ui, Radix UI, Zod |

## Wymagania

- **Node.js** w wersji 20 lub nowszej
- **PostgreSQL** (docker/podman/lokalna instalka)
- **npm**


### 1. Backend (`api/`)

```bash
cd api
npm install

# utworzenie pliku .env 
npm run env:init
```

Uzupełnij plik `api/.env`:

```env
DATABASE_URL="postgresql://użytkownik:hasło@localhost:5432/blog"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="haslo"
```



```bash
npm run db      # prisma migrate dev + prisma generate
npm run seed    # tworzy/aktualizuje konto administratora z .env
npm run dev     # serwer dev na http://localhost:3000
```

### 2. Frontend (`web/`)

```bash
cd web
npm install
npm run dev     # aplikacja dostępna domyślnie na http://localhost:5173
```

Otwórz aplikację w przeglądarce i zaloguj się kontem administratora utworzonym
podczas seedowania lub zarejestruj nowego użytkownika.

## Dostępne skrypty

### `api/`

| Skrypt              | Opis |
|---------------------|------|
| `npm run dev`       | Serwer deweloperski z auto-przeładowaniem (tsx watch) |
| `npm run build`     | Kompilacja TypeScript do `dist/` |
| `npm run start`     | Uruchomienie zbudowanej aplikacji (`node dist/index.js`) |
| `npm run db`        | Migracje + generowanie klienta Prisma |
| `npm run seed`      | Utworzenie konta administratora z `.env` |
| `npm run prisma`    | Prisma Studio (podgląd bazy) |
| `npm run env:init`  | Utworzenie `.env` z `.env.example` |

### `web/`

| Skrypt              | Opis |
|---------------------|------|
| `npm run dev`       | Serwer deweloperski Vite |
| `npm run build`     | Build produkcyjny (`tsc -b && vite build`) |


## API

Bazowy adres: `http://localhost:3000`

### Uwierzytelnianie – `/api/auth`

| Metoda | Ścieżka     | Opis |
|--------|-------------|------|
| POST   | `/register` | Rejestracja użytkownika (`email`, `password`) |
| POST   | `/login`    | Logowanie, ustawia ciasteczko sesji `sid` |
| POST   | `/logout`   | Wylogowanie i usunięcie sesji |
| GET    | `/me`       | Dane zalogowanego użytkownika |

### Wpisy – `/api/posts` (wymaga logowania)

| Metoda | Ścieżka   | Opis |
|--------|-----------|------|
| GET    | `/`       | Lista własnych wpisów |
| POST   | `/`       | Utworzenie wpisu (`title`, `content`) |
| GET    | `/random` | 8 losowych wpisów |
| DELETE | `/:id`    | Usunięcie własnego wpisu |

### Administracja – `/api/admin` (wymaga roli `admin`)

| Metoda | Ścieżka           | Opis |
|--------|-------------------|------|
| GET    | `/stats`          | Statystyki aplikacji |
| GET    | `/users`          | Lista użytkowników |
| PATCH  | `/users/:id/role` | Zmiana roli użytkownika (`user` / `admin`) |
| DELETE | `/posts/:id`      | Usunięcie dowolnego wpisu |


## Model danych

- **User** – `id`, `email` (unikalny), `password` (hash), `role`, `createdAt`.
- **Post** – `id`, `userId`, `title`, `content`, `createdAt`.
- **Session** – `id`, `userId`, `expiresAt`, `createdAt`.

Sesje przechowywane są w bazie danych, a identyfikator sesji w `httpOnly` 

## Struktura projektu

```
.
├── api/                 # backend (Express + Prisma)
│   ├── prisma/          # schema, migracje, seed
│   └── src/
│       ├── routes/      # auth.ts, posts.ts, admin.ts
│       ├── db.ts        # klient Prisma
│       └── index.ts     # punkt wejścia serwera
└── web/                 # frontend (React + Vite)
    └── src/
        ├── components/  # widoki i komponenty UI
        ├── lib/
        └── main.tsx
```

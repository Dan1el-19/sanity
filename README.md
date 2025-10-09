# Sanity Studio – MyReflection

Sanity Studio dla projektu MyReflection – zarządzanie treścią oraz customowe narzędzia do obsługi wizyt, grafików i blokad. Integracja z Appwrite Cloud Function zapewnia bezpieczne pobieranie danych o rezerwacjach, inteligentne cachowanie i szybkie działanie.

---

## 📁 Struktura projektu

```
package.json
pnpm-lock.yaml
sanity.cli.ts
sanity.config.ts
schemaTypes/
    index.ts
    services.ts
scripts/
  back.js
  hist.js
  app.css
  vite-env.d.ts
  components/
    AuthGuard.tsx
    ErrorPanel.tsx
    LoadingSkeleton.tsx
    appointments/
    blockedSlots/
    shedules/
  hooks/
    useAppwriteAuth.ts
  lib/
    appwrite.ts
    services/
  tools/
    appointments.tsx
    blockedSlots.tsx
    shedules.tsx
```

---

## 🚀 Funkcjonalności

- Integracja z Appwrite Cloud Function (Node.js)
- Custom tool do zarządzania wizytami (`src/tools/appointments.tsx`)
- Inteligentne cachowanie po stronie przeglądarki (instant load, mniej API calls)
- Obsługa filtrów statusów, force refresh, czyszczenie cache
- Bezpieczne logowanie przez Appwrite (Google, GitHub)
- Pełna obsługa typów TypeScript

---

## 🔧 Instalacja

```bash
```

## ▶️ Development

pnpm build
```

---

## 🌍 Wymagane zmienne środowiskowe

Dodaj do `.env.local`

```
SANITY_STUDIO_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
SANITY_STUDIO_APPWRITE_PROJECT_ID=your_project_id
SANITY_STUDIO_APPWRITE_DATABASE_ID=id_of_your_database
SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID=your_get_cloud_function_id
SANITY_STUDIO_PROJECT_ID=project_id_here
SANITY_STUDIO_APP_ID=app_id_here
```

---
## 💡 Rozszerzenia

- Więcej filtrów, sortowanie, wyszukiwanie, paginacja
- Edycja statusów, notatek, eksport CSV/PDF
- Widok kalendarza miesięcznego/tygodniowego

---

## 🆘 Pomoc

- Appwrite Docs: https://appwrite.io/docs
- Sanity Docs: https://www.sanity.io/docs

---
---

# Sanity Studio – MyReflection
---
## 📁 Project Structure

```
eslint.config.mjs
pnpm-lock.yaml
sanity.cli.ts
sanity.config.ts
tsconfig.json
tsconfig.tsbuildinfo
.sanity/
  runtime/
    app.js
    index.html
api/
  schemaTypes/
    index.ts
    services.ts
scripts/
  back.js
  hist.js
src/
  app.css
  vite-env.d.ts
  components/
    AuthGuard.tsx
    ErrorPanel.tsx
    LoadingSkeleton.tsx
    appointments/
    blockedSlots/
    shedules/
  hooks/
    useAppwriteAuth.ts
  lib/
    appwrite.ts
    services/
  tools/
    appointments.tsx
    ...
static/
  .gitkeep
```

---

## 🚀 Features

- Appwrite Cloud Function integration (Node.js)
- Custom appointments tool (`src/tools/appointments.tsx`)
- Smart browser-side caching (instant load, fewer API calls)
- Status filters, force refresh, cache clearing
- Secure login via Appwrite (Google, GitHub)
- Full TypeScript support
- Extensive documentation (`QUICK_START.md`, `src/lib/services/README.md`)

---

## 🔧 Installation

```bash
pnpm install
```

## ▶️ Development

```bash
pnpm dev
```

## 🏗️ Build

```bash
pnpm build
```

---

## 🌍 Required Environment Variables

Add to `.env.local` or `sanity.config.ts`:

```
SANITY_STUDIO_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
SANITY_STUDIO_APPWRITE_PROJECT_ID=your_project_id
SANITY_STUDIO_APPWRITE_DATABASE_ID=id_of_your_database
SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID=your_get_cloud_function_id
SANITY_STUDIO_PROJECT_ID=project_id_here
SANITY_STUDIO_APP_ID=app_id_here
```

---

## 💡 Extensions

- More filters, sorting, search, pagination
- Status/note editing, CSV/PDF export
- Monthly/weekly calendar view

---

## 🆘 Help

- Appwrite Docs: https://appwrite.io/docs
- Sanity Docs: https://www.sanity.io/docs

---
# Sanity Studio - MyReflection

Sanity Studio dla projektu MyReflection, zarządzanie treścią + custom tool do zarządzania terminami, grafikiem itd.

## 🚀 Nowa funkcjonalność: Appwrite Cloud Function Integration

Projekt został zintegrowany z Appwrite Cloud Function do pobierania danych o rezerwacjach/terminach.

### ⚡ Quick Start

**Chcesz szybko uruchomić?** Zobacz: **[QUICK_START.md](QUICK_START.md)** 📖

### Pliki projektu

- `src/lib/services/appointmentsCloudFunction.ts` - Serwis do komunikacji z Cloud Function
- `src/tools/appointments.tsx` - Custom tool w Sanity Studio (zaktualizowany)
- `api/CLOUD_FUNCTION_EXAMPLE.md` - Przykład implementacji Cloud Function
- `src/lib/services/README.md` - Dokumentacja serwisów
- `TODO.md` - Szczegółowe TODO i status projektu
- `QUICK_START.md` - 🎯 **Szybki przewodnik uruchomienia**

### Wymagane zmienne środowiskowe

```env
# Istniejące
SANITY_STUDIO_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
SANITY_STUDIO_APPWRITE_PROJECT_ID=your_project_id

# Nowe - do dodania
SANITY_STUDIO_APPWRITE_FUNCTION_ID=your_cloud_function_id
```

### Quick Start

1. **Wdróż Cloud Function w Appwrite**
   - Zobacz `api/CLOUD_FUNCTION_EXAMPLE.md` dla kodu
   - Ustaw zmienne środowiskowe w funkcji
   - Deploy i skopiuj Function ID

2. **Dodaj Function ID do projektu**
   ```bash
   # Dodaj do .env lub sanity.config.ts
   SANITY_STUDIO_APPWRITE_FUNCTION_ID=your_function_id
   ```

3. **Uruchom Sanity Studio**
   ```bash
   pnpm dev
   ```

4. **Otwórz Appointments Tool**
   - Przejdź do Tools → Appointments
   - Zobaczysz rezerwacje z Cloud Function

### Więcej informacji

- 🎯 **[Quick Start Guide](QUICK_START.md)** - Przewodnik krok po kroku
- 📚 [Dokumentacja serwisów](src/lib/services/README.md)
- 🔧 [Przykład Cloud Function](api/CLOUD_FUNCTION_EXAMPLE.md)
- ✅ [TODO i status projektu](TODO.md)

---

## Instalacja

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```
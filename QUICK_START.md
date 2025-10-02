# 🎯 Szybki Start - Appwrite Cloud Function Integration

## Co zostało zrobione?

✅ Stworzono nowy serwis TypeScript do komunikacji z Appwrite Cloud Function  
✅ Zaktualizowano komponent Appointments w Sanity Studio  
✅ **Dodano mechanizm cachowania po stronie przeglądarki** 🚀  
✅ Dodano pełną dokumentację i przykłady  
✅ Wszystko działa bez błędów kompilacji  

## 🚀 Nowa funkcjonalność: Inteligentne Cachowanie

Aplikacja używa **cachowania po stronie przeglądarki** (w pamięci JavaScript):

### Jak to działa?

- ✅ **Automatyczne**: Każde zapytanie jest automatycznie cachowane na 2 minuty
- ✅ **Per filter**: Osobny cache dla każdej kombinacji filtrów (All, Pending, Confirmed, Cancelled)
- ✅ **Szybkie przełączanie**: Zmiana filtru nie wymaga API call jeśli dane są w cache
- ✅ **Force refresh**: Przycisk z ikoną bazy danych wymusza pobranie świeżych danych
- ✅ **Clear cache**: Przycisk pokazuje liczbę wpisów cache i pozwala je wyczyścić

### Przykład użycia:

1. **Kliknij "All"** → API call ✅, dane zapisane w cache
2. **Kliknij "Pending"** → API call ✅, dane zapisane w cache
3. **Kliknij "All" ponownie** → ⚡ **Natychmiastowe** ładowanie z cache! (brak API call)
4. **Kliknij "Confirmed"** → API call ✅, dane zapisane w cache
5. **Kliknij "Pending" ponownie** → ⚡ Ładowanie z cache! (brak API call)

**Rezultat**: Zamiast 5 API calls masz tylko 3! 🎉

### Kontrole w UI:

- **🔄 Odśwież** - Odświeża dane (używa cache jeśli jest świeży)
- **💾 Force Refresh** (ikona bazy danych) - Wymusza pobranie nowych danych (bypass cache)
- **❌ Wyczyść cache (N)** - Pokazuje liczbę wpisów w cache, pozwala wyczyścić wszystko

### Debug w Console (F12):

Otwórz konsolę przeglądarki i zobacz:
```
[Cache HIT] Używam danych z cache dla: all
[Cache SAVE] Zapisuję do cache: status:pending
[API CALL] Pobieranie danych z Cloud Function dla: status:confirmed
[Cache EXPIRED] Cache wygasł dla: all
[Force Refresh] Pomijam cache, pobieram świeże dane
```

---

## Co musisz zrobić teraz?

### Krok 1: Wdróż Cloud Function w Appwrite ☁️

1. **Otwórz Appwrite Console** → Functions → Create Function
2. **Wybierz runtime**: Node.js 18+ (lub 20+)
3. **Skopiuj kod** z pliku `api/CLOUD_FUNCTION_EXAMPLE.md`
4. **Ustaw zmienne środowiskowe funkcji**:
   ```
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_FUNCTION_PROJECT_ID=<twój_project_id>
   APPWRITE_API_KEY=<api_key_z_uprawnieniami_read>
   APPWRITE_DATABASE_ID=<database_id>
   APPWRITE_COLLECTION_ID=<collection_id_appointments>
   ```
5. **Deploy funkcji** (Build & Deploy button)
6. **Skopiuj Function ID** (będzie wyglądać jak: `6501a1b2c3d4e5f6g7h8`)

### Krok 2: Dodaj Function ID do projektu 🔧

**Opcja A: Przez plik `.env`**
```bash
# Skopiuj .env.example do .env
cp .env.example .env

# Edytuj .env i dodaj:
SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID=6501a1b2c3d4e5f6g7h8
```

**Opcja B: Przez sanity.config.ts** (jeśli używasz)
```typescript
env: {
  SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID: '6501a1b2c3d4e5f6g7h8'
}
```

### Krok 3: Uruchom projekt 🚀

```bash
pnpm dev
```

### Krok 4: Przetestuj 🧪

1. Otwórz Sanity Studio w przeglądarce (domyślnie: http://localhost:3333)
2. Przejdź do **Tools → Appointments**
3. **Przetestuj cache**:
   - Kliknij "Pending" → Zobacz API call w console
   - Kliknij "All" → Zobacz API call w console
   - Kliknij "Pending" ponownie → Zobacz "[Cache HIT]" w console! ⚡
   - Kliknij ikonę bazy danych (💾) → Zobacz "Force Refresh" i nowy API call
   - Jeśli cache ma wpisy, zobaczysz przycisk ❌ z liczbą - kliknij aby wyczyścić
4. **Sprawdź filtry** (All, Pending, Confirmed, Cancelled)
5. **Kliknij przycisk "Odśwież"** (🔄)

## ✅ Weryfikacja

Jeśli wszystko działa poprawnie, zobaczysz:

- 📋 Listę rezerwacji w formie kart
- 🎨 Kolorowe statusy (Pending/Confirmed/Cancelled)
- 📧 Dane klientów (imię, nazwisko, email)
- 📅 Daty i godziny terminów
- 💰 Ceny (z pokazaniem rabatu jeśli jest)
- 📝 Notatki użytkownika i admina
- 🔄 **Przycisk odświeżania** (używa cache)
- 💾 **Przycisk Force Refresh** (ikona bazy danych) - wymusza nowe dane
- ❌ **Przycisk czyszczenia cache** (pokazuje liczbę wpisów, pojawia się gdy cache > 0)
- 📊 **Console logs** pokazujące cache hits/misses

### Metryki wydajności:

Otwórz DevTools (F12) → Network i zobacz:
- **Z cache**: 0 network requests, instant load ⚡
- **Bez cache**: 1 request do Cloud Function

## 🐛 Rozwiązywanie problemów

### Problem: "Brak zmiennej środowiskowej: SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID"
**Rozwiązanie**: Dodaj Function ID do `.env` lub `sanity.config.ts` (Krok 2)

### Problem: Cache nie działa / zawsze widać API calls
**Rozwiązanie**:
1. Sprawdź console - powinny być logi `[Cache SAVE]` i `[Cache HIT]`
2. Sprawdź czy TTL nie wygasł (domyślnie 2 min)
3. Spróbuj wyczyścić i załadować ponownie
4. Sprawdź czy używasz tej samej kombinacji filtrów

### Problem: Dane nie są aktualne po edycji
**Rozwiązanie**:
1. Użyj przycisku Force Refresh (💾)
2. Lub kliknij przycisk Clear Cache (❌)
3. Lub poczekaj 2 minuty aż cache wygaśnie
4. Możesz zmniejszyć TTL w kodzie jeśli dane często się zmieniają

### Problem: "Cloud Function nie zakończyła się pomyślnie"
**Rozwiązanie**:
1. Sprawdź logs w Appwrite Console (Functions → Twoja funkcja → Executions)
2. Upewnij się, że API Key ma uprawnienia do odczytu
3. Sprawdź czy DATABASE_ID i COLLECTION_ID są poprawne

### Problem: Błąd kompilacji TypeScript
**Rozwiązanie**:
```bash
# Wyczyść cache
pnpm clean
rm -rf node_modules
pnpm install

# Zbuduj ponownie
pnpm build
```

## 📚 Dodatkowe zasoby

- **Dokumentacja cache**: `src/lib/services/README.md` (szczegółowa dokumentacja API cache)
- **Przykład Cloud Function**: `api/CLOUD_FUNCTION_EXAMPLE.md`
- **Pełne TODO**: `TODO.md`
- **Główny README**: `README.md`

## 🎓 Zaawansowane użycie cache

### Custom TTL (Time To Live)

Możesz zmienić czas życia cache w `appointmentsCloudFunction.ts`:

```typescript
// Domyślnie 2 minuty
const DEFAULT_CACHE_TTL = 2 * 60 * 1000;

// Zmień na 5 minut:
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// Lub 30 sekund:
const DEFAULT_CACHE_TTL = 30 * 1000;
```

### Programowe czyszczenie cache

W `appointments.tsx` możesz dodać automatyczne czyszczenie:

```typescript
// Po zapisie/edycji rekordu
await saveAppointment(data);
clearCache(); // Wyczyść cały cache
// lub
clearCache('status:pending'); // Wyczyść tylko dla pending
```

### Monitorowanie cache

```typescript
const stats = getCacheStats();
console.log(`Cache entries: ${stats.size}`);
console.log(`Cache keys:`, stats.keys);
// Output: Cache entries: 4
// Cache keys: ['all', 'status:pending', 'status:confirmed', 'status:cancelled']
```

## 🎉 Gotowe!

Jeśli wszystko działa - gratuluję! Masz teraz:
- ✅ Bezpieczną integrację z Appwrite (credentials ukryte w Cloud Function)
- ✅ **Inteligentne cachowanie** - szybsze ładowanie, mniej API calls
- ✅ Szybkie przełączanie między filtrami (instant load z cache)
- ✅ Kontrolę nad cache (force refresh, clear cache)
- ✅ Łatwe rozszerzanie funkcjonalności
- ✅ Silne typowanie TypeScript
- ✅ Kompletną dokumentację

## 💡 Następne kroki (opcjonalne)

### Optymalizacje cache:
1. **Persistent cache**: Użyj localStorage/IndexedDB zamiast pamięci
2. **Smart invalidation**: Auto-refresh przy focus na window
3. **Selective clearing**: Wyczyść tylko related cache entries
4. **Background refresh**: Odśwież cache w tle przed wygaśnięciem

### Nowe funkcjonalności:
1. **Więcej filtrów**: data, zakres dat, typ usługi
2. **Sorting**: sortowanie po dacie, cenie, nazwisku
3. **Search**: wyszukiwanie po imieniu/emailu
4. **Pagination**: obsługa dużej liczby rekordów
5. **Edycja**: możliwość zmiany statusu, notatek
6. **Export**: CSV/PDF z listą rezerwacji
7. **Kalendarz**: widok miesięczny/tygodniowy

---

**Potrzebujesz pomocy?** Sprawdź:
- Cache API docs: `src/lib/services/README.md`
- Appwrite Docs: https://appwrite.io/docs
- Sanity Docs: https://www.sanity.io/docs

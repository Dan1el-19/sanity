# Przykładowa Cloud Function dla Appwrite

Ten plik zawiera przykładową implementację Cloud Function, która powinna być wdrożona w Appwrite.

## Struktura projektu Cloud Function

```
appwrite-function/
├── src/
│   └── main.js (lub main.ts)
├── package.json
└── .env
```

## Implementacja (JavaScript/Node.js)

```javascript
import { Client, Databases, Query } from 'node-appwrite';

/**
 * Appwrite Cloud Function - Pobieranie rezerwacji/terminów
 * 
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
export default async ({ req, res, log, error }) => {
  try {
    // Pobierz filtry z request body (opcjonalne)
    const { status, date } = req.body ? JSON.parse(req.body) : {};
    
    log(`Fetching appointments with filters - status: ${status}, date: ${date}`);

    // Konfiguracja klienta Appwrite
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY); // API Key z uprawnieniami do odczytu

    const databases = new Databases(client);
    
    // Pobierz ID bazy i kolekcji ze zmiennych środowiskowych
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_COLLECTION_ID;

    // Przygotuj queries z filtrami
    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(100)
    ];

    if (status) {
      queries.push(Query.equal('status', status));
    }

    if (date) {
      queries.push(Query.equal('date', date));
    }

    // Pobierz dokumenty z bazy
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      queries
    );

    // Transformuj dane do wymaganego formatu
    const appointments = response.documents.map(doc => ({
      id: doc.$id,
      client: {
        firstName: doc.firstName || '',
        lastName: doc.lastName || '',
        fullName: `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
        email: doc.clientEmail || ''
      },
      service: {
        type: doc.serviceType || 'Nie określono',
        status: doc.status || 'pending'
      },
      schedule: {
        date: doc.date || '',
        time: doc.time || ''
      },
      pricing: {
        base: doc.basePrice || 0,
        final: doc.finalPrice || doc.basePrice || 0
      },
      notes: {
        user: doc.userNotes || '',
        admin: doc.adminNotes || ''
      },
      meta: {
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }
    }));

    // Zwróć odpowiedź w wymaganym formacie
    return res.json({
      success: true,
      data: {
        count: appointments.length,
        total: response.total,
        filters: {
          status: status || null,
          date: date || null
        },
        appointments
      }
    });

  } catch (err) {
    error(`Error fetching appointments: ${err.message}`);
    
    // Zwróć błąd w wymaganym formacie
    return res.json({
      success: false,
      data: {
        count: 0,
        total: 0,
        filters: {
          status: null,
          date: null
        },
        appointments: []
      },
      error: err.message || 'Nieznany błąd serwera'
    }, 500);
  }
};
```

## package.json dla Cloud Function

```json
{
  "name": "appwrite-appointments-function",
  "version": "1.0.0",
  "description": "Cloud Function do pobierania rezerwacji/terminów",
  "main": "src/main.js",
  "type": "module",
  "scripts": {
    "start": "node src/main.js"
  },
  "dependencies": {
    "node-appwrite": "^13.0.0"
  }
}
```

## Zmienne środowiskowe w Appwrite

W panelu Appwrite Function ustaw następujące zmienne środowiskowe:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key_with_read_permissions
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_COLLECTION_ID=your_appointments_collection_id
```

## Wymagania dla struktury bazy danych

Collection `appointments` powinna mieć następujące atrybuty:

- `firstName` (string)
- `lastName` (string)
- `clientEmail` (email/string)
- `serviceType` (string)
- `status` (enum: pending, confirmed, cancelled)
- `date` (string/datetime)
- `time` (string)
- `basePrice` (integer/float)
- `finalPrice` (integer/float) - opcjonalne
- `userNotes` (string) - opcjonalne
- `adminNotes` (string) - opcjonalne

Uprawnienia:
- Read access dla API Key użytego w funkcji

## Testowanie Cloud Function

### Z poziomu Appwrite Console

1. Przejdź do Functions → Twoja funkcja → Execute
2. W Body wpisz:
```json
{
  "status": "pending"
}
```
3. Kliknij Execute

### Z poziomu CLI

```bash
appwrite functions createExecution \
  --functionId=[YOUR_FUNCTION_ID] \
  --body='{"status":"pending"}'
```

## Deployment

### Przez Appwrite Console

1. Utwórz nową funkcję w Functions
2. Wybierz runtime: Node.js 18+
3. Wgraj kod (zip z folderem zawierającym `src/main.js` i `package.json`)
4. Ustaw zmienne środowiskowe
5. Deploy

### Przez CLI

```bash
appwrite deploy function \
  --functionId=[YOUR_FUNCTION_ID]
```

## Rozwiązywanie problemów

### Błąd: "Invalid API Key"
- Sprawdź czy API Key ma uprawnienia do odczytu collection
- Sprawdź czy zmienna APPWRITE_API_KEY jest ustawiona

### Błąd: "Collection not found"
- Sprawdź czy APPWRITE_DATABASE_ID i APPWRITE_COLLECTION_ID są poprawne
- Sprawdź czy collection istnieje

### Timeout
- Zwiększ timeout funkcji w ustawieniach (domyślnie 15s)
- Ogranicz liczbę zwracanych dokumentów (Query.limit)

## Optymalizacje

1. **Caching**: Dodaj Redis do cache'owania wyników
2. **Pagination**: Dodaj parametry `offset` i `limit`
3. **Sorting**: Dodaj możliwość sortowania po różnych polach
4. **Search**: Dodaj full-text search
5. **Rate limiting**: Ogranicz liczbę wywołań na użytkownika

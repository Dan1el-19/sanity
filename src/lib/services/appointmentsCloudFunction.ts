import { Client, Functions } from "appwrite";

// ============ TYPY/INTERFEJSY ============

export interface AppointmentClient {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface AppointmentService {
  type: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface AppointmentSchedule {
  date: string;
  time: string;
}

export interface AppointmentPricing {
  base: number;
  final: number;
}

export interface AppointmentNotes {
  user: string;
  admin: string;
}

export interface AppointmentMeta {
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  client: AppointmentClient;
  service: AppointmentService;
  schedule: AppointmentSchedule;
  pricing: AppointmentPricing;
  notes: AppointmentNotes;
  meta: AppointmentMeta;
}

export interface AppointmentsFilters {
  status: string | null;
  date: string | null;
}

export interface AppointmentsData {
  count: number;
  total: number;
  filters: AppointmentsFilters;
  appointments: Appointment[];
}

export interface AppointmentsResponse {
  success: boolean;
  data: AppointmentsData;
  error?: string;
}

// ============ CACHOWANIE ============

interface CacheEntry {
  data: AppointmentsResponse;
  timestamp: number;
}

// Cache w pamięci przeglądarki
const cache = new Map<string, CacheEntry>();

// Domyślny TTL (Time To Live) w milisekundach - 10 minut
const DEFAULT_CACHE_TTL = 10 * 60 * 1000;

/**
 * Generuje klucz cache na podstawie filtrów
 */
function getCacheKey(filters?: { status?: string; date?: string }): string {
  if (!filters) return 'all';
  const parts: string[] = [];
  if (filters.status) parts.push(`status:${filters.status}`);
  if (filters.date) parts.push(`date:${filters.date}`);
  return parts.length > 0 ? parts.join('|') : 'all';
}

/**
 * Sprawdza czy dane w cache są świeże
 */
function isCacheValid(entry: CacheEntry, ttl: number): boolean {
  return Date.now() - entry.timestamp < ttl;
}

/**
 * Pobiera dane z cache jeśli są świeże
 */
function getFromCache(
  cacheKey: string, 
  ttl: number = DEFAULT_CACHE_TTL
): AppointmentsResponse | null {
  const entry = cache.get(cacheKey);
  if (entry && isCacheValid(entry, ttl)) {
    console.log(`[Cache HIT] Używam danych z cache dla: ${cacheKey}`);
    return entry.data;
  }
  if (entry) {
    console.log(`[Cache EXPIRED] Cache wygasł dla: ${cacheKey}`);
    cache.delete(cacheKey);
  }
  return null;
}

/**
 * Zapisuje dane do cache
 */
function saveToCache(cacheKey: string, data: AppointmentsResponse): void {
  console.log(`[Cache SAVE] Zapisuję do cache: ${cacheKey}`);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Czyści cache (wszystkie wpisy lub dla konkretnego klucza)
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    console.log(`[Cache CLEAR] Czyszczę cache dla: ${cacheKey}`);
    cache.delete(cacheKey);
  } else {
    console.log('[Cache CLEAR] Czyszczę cały cache');
    cache.clear();
  }
}

/**
 * Wyświetla statystyki cache (do debugowania)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

// ============ KONFIGURACJA APPWRITE ============

function getAppwriteClient(): Client {
  const endpoint = process.env.SANITY_STUDIO_APPWRITE_ENDPOINT;
  const projectId = process.env.SANITY_STUDIO_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error(
      "Brak wymaganych zmiennych środowiskowych: SANITY_STUDIO_APPWRITE_ENDPOINT lub SANITY_STUDIO_APPWRITE_PROJECT_ID"
    );
  }

  const client = new Client();
  client.setEndpoint(endpoint).setProject(projectId);

  return client;
}

// ============ GŁÓWNA FUNKCJA ============

/**
 * Pobiera listę rezerwacji/terminów z Appwrite Cloud Function
 * @param functionId - ID Cloud Function w Appwrite
 * @param filters - Opcjonalne filtry (status, data)
 * @param useCache - Czy używać cache (domyślnie: true)
 * @param cacheTTL - Czas życia cache w milisekundach (domyślnie: 2 minuty)
 * @returns Promise z danymi terminów
 */
export async function fetchAppointmentsFromCloudFunction(
  functionId: string,
  filters?: { status?: string; date?: string },
  useCache: boolean = true,
  cacheTTL: number = DEFAULT_CACHE_TTL
): Promise<AppointmentsResponse> {
  // Generuj klucz cache
  const cacheKey = getCacheKey(filters);

  // Sprawdź cache jeśli włączony
  if (useCache) {
    const cachedData = getFromCache(cacheKey, cacheTTL);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const client = getAppwriteClient();
    const functions = new Functions(client);

    // Przygotuj payload z filtrami (jeśli są)
    const payload = filters ? JSON.stringify(filters) : undefined;

    console.log(`[API CALL] Pobieranie danych z Cloud Function dla: ${cacheKey}`);

    // Wywołaj Cloud Function
    const execution = await functions.createExecution(
      functionId,
      payload,
      false // async = false, czekamy na wynik
    );

    // Sprawdź status wykonania
    if (execution.status !== "completed") {
      throw new Error(
        `Cloud Function nie zakończyła się pomyślnie. Status: ${execution.status}`
      );
    }

    // Parsuj odpowiedź
    const response: AppointmentsResponse = JSON.parse(
      execution.responseBody || "{}"
    );

    if (!response.success) {
      throw new Error(
        response.error || "Cloud Function zwróciła błąd bez szczegółów"
      );
    }

    // Zapisz do cache jeśli włączony
    if (useCache) {
      saveToCache(cacheKey, response);
    }

    return response;
  } catch (error) {
    console.error("Błąd podczas pobierania danych z Cloud Function:", error);

    // Zwróć obiekt błędu w formacie odpowiedzi
    return {
      success: false,
      data: {
        count: 0,
        total: 0,
        filters: {
          status: filters?.status || null,
          date: filters?.date || null,
        },
        appointments: [],
      },
      error: error instanceof Error ? error.message : "Nieznany błąd",
    };
  }
}

/**
 * Wrapper używający domyślnego ID funkcji z zmiennych środowiskowych
 * @param filters - Opcjonalne filtry (status, data)
 * @param useCache - Czy używać cache (domyślnie: true)
 * @param cacheTTL - Czas życia cache w milisekundach (domyślnie: 2 minuty)
 */
export async function fetchAppointments(
  filters?: { status?: string; date?: string },
  useCache: boolean = true,
  cacheTTL?: number
): Promise<AppointmentsResponse> {
  const functionId = process.env.SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID;

  if (!functionId) {
    throw new Error(
      "Brak zmiennej środowiskowej: SANITY_STUDIO_APPWRITE_GET_FUNCTION_ID"
    );
  }

  return fetchAppointmentsFromCloudFunction(functionId, filters, useCache, cacheTTL);
}

import { tablesDB } from '../appwrite';

// ============ TYPES ============

export interface SchedulePreset {
  $id?: string;
  name?: string;
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
  assignedMonths: string[]; // Format: "MM-YYYY"
  createdAt?: string;
  updatedAt?: string;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const WEEKDAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  monday: 'Poniedziałek',
  tuesday: 'Wtorek',
  wednesday: 'Środa',
  thursday: 'Czwartek',
  friday: 'Piątek',
  saturday: 'Sobota',
  sunday: 'Niedziela',
};

// Generate time slots from 8:00 to 21:00 with 30-minute steps
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 21; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();

// ============ CACHOWANIE ============

interface CacheEntry {
  data: SchedulePreset[];
  timestamp: number;
}

// Cache w pamięci przeglądarki
const cache = new Map<string, CacheEntry>();

// Domyślny TTL (Time To Live) w milisekundach - 10 minut
const DEFAULT_CACHE_TTL = 10 * 60 * 1000;

/**
 * Generuje klucz cache
 */
function getCacheKey(): string {
  return 'schedules-all';
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
): SchedulePreset[] | null {
  const entry = cache.get(cacheKey);
  if (entry && isCacheValid(entry, ttl)) {
    console.log(`[Schedules Cache HIT] Używam danych z cache`);
    return entry.data;
  }
  if (entry) {
    console.log(`[Schedules Cache EXPIRED] Cache wygasł`);
    cache.delete(cacheKey);
  }
  return null;
}

/**
 * Zapisuje dane do cache
 */
function saveToCache(cacheKey: string, data: SchedulePreset[]): void {
  console.log(`[Schedules Cache SAVE] Zapisuję do cache`);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Czyści cache
 */
export function clearSchedulesCache(): void {
  console.log('[Schedules Cache CLEAR] Czyszczę cache');
  cache.clear();
}

/**
 * Wyświetla statystyki cache (do debugowania)
 */
export function getSchedulesCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

// ============ SERVICE FUNCTIONS ============

const getTableId = (): string => {
  const tableId = "schedules";
  if (!tableId) {
    throw new Error('Wrong or missing tableId for schedules');
  }
  return tableId;
};

/**
 * Fetch all schedule presets
 * @param useCache - Czy używać cache (domyślnie: true)
 * @param cacheTTL - Czas życia cache w milisekundach (domyślnie: 10 minut)
 */
export async function fetchSchedulePresets(
  useCache: boolean = true,
  cacheTTL: number = DEFAULT_CACHE_TTL
): Promise<SchedulePreset[]> {
  const cacheKey = getCacheKey();
  
  // Sprawdź cache jeśli włączony
  if (useCache) {
    const cachedData = getFromCache(cacheKey, cacheTTL);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    
    console.log('[Schedules API CALL] Pobieranie danych z API');
    const response = await tablesDB.listRows({ databaseId: dbId, tableId });
    const data = response.rows as unknown as SchedulePreset[];
    
    // Zapisz do cache jeśli włączony
    if (useCache) {
      saveToCache(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching schedule presets:', error);
    throw new Error('Failed to fetch schedule presets');
  }
}

/**
 * Fetch single schedule preset by ID
 */
export async function fetchSchedulePreset(rowId: string): Promise<SchedulePreset> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    const response = await tablesDB.getRow({ databaseId: dbId, tableId, rowId });
    return response as unknown as SchedulePreset;
  } catch (error) {
    console.error('Error fetching schedule preset:', error);
    throw new Error('Failed to fetch schedule preset');
  }
}

/**
 * Create new schedule preset
 */
export async function createSchedulePreset(data: Omit<SchedulePreset, '$id' | 'createdAt' | 'updatedAt'>): Promise<SchedulePreset> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    // Generate a unique ID for the new row
    const rowId = `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const response = await tablesDB.createRow({ databaseId: dbId, tableId, rowId, data: data as any });
    
    // Wyczyść cache po utworzeniu
    clearSchedulesCache();
    
    return response as unknown as SchedulePreset;
  } catch (error) {
    console.error('Error creating schedule preset:', error);
    throw new Error('Failed to create schedule preset');
  }
}

/**
 * Update existing schedule preset
 */
export async function updateSchedulePreset(rowId: string, data: Partial<SchedulePreset>): Promise<SchedulePreset> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    const response = await tablesDB.updateRow({ databaseId: dbId, tableId, rowId, data: data as any });
    
    // Wyczyść cache po aktualizacji
    clearSchedulesCache();
    
    return response as unknown as SchedulePreset;
  } catch (error) {
    console.error('Error updating schedule preset:', error);
    throw new Error('Failed to update schedule preset');
  }
}

/**
 * Delete schedule preset
 */
export async function deleteSchedulePreset(rowId: string): Promise<void> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    await tablesDB.deleteRow({ databaseId: dbId, tableId, rowId });
    
    // Wyczyść cache po usunięciu
    clearSchedulesCache();
  } catch (error) {
    console.error('Error deleting schedule preset:', error);
    throw new Error('Failed to delete schedule preset');
  }
}

/**
 * Generate months list for current and next year
 */
export function generateMonthsList(): string[] {
  const months: string[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Generate months for current and next year
  for (let year = currentYear; year <= currentYear + 1; year++) {
    for (let month = 1; month <= 12; month++) {
      // Skip past months in current year
      if (year === currentYear && month < currentDate.getMonth() + 1) {
        continue;
      }
      const monthStr = month.toString().padStart(2, '0');
      months.push(`${monthStr}-${year}`);
    }
  }
  
  return months;
}

/**
 * Format month string for display
 */
export function formatMonthLabel(monthStr: string): string {
  const [month, year] = monthStr.split('-');
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}

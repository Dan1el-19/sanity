import { tablesDB } from '../appwrite';

// ============ TYPES ============

export interface BlockedSlot {
  $id?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============ CACHOWANIE ============

interface CacheEntry {
  data: BlockedSlot[];
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
  return 'blocked-slots-all';
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
): BlockedSlot[] | null {
  const entry = cache.get(cacheKey);
  if (entry && isCacheValid(entry, ttl)) {
    console.log(`[BlockedSlots Cache HIT] Używam danych z cache`);
    return entry.data;
  }
  if (entry) {
    console.log(`[BlockedSlots Cache EXPIRED] Cache wygasł`);
    cache.delete(cacheKey);
  }
  return null;
}

/**
 * Zapisuje dane do cache
 */
function saveToCache(cacheKey: string, data: BlockedSlot[]): void {
  console.log(`[BlockedSlots Cache SAVE] Zapisuję do cache`);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Czyści cache
 */
export function clearBlockedSlotsCache(): void {
  console.log('[BlockedSlots Cache CLEAR] Czyszczę cache');
  cache.clear();
}

/**
 * Wyświetla statystyki cache (do debugowania)
 */
export function getBlockedSlotsCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

// ============ SERVICE FUNCTIONS ============

const getTableId = (): string => {
  const tableId = "blockedSlots";
  if (!tableId) {
    throw new Error('Wrong or missing tableId for blockedSlots');
  }
  return tableId;
};

/**
 * Fetch all blocked slots
 * @param useCache - Czy używać cache (domyślnie: true)
 * @param cacheTTL - Czas życia cache w milisekundach (domyślnie: 10 minut)
 */
export async function fetchBlockedSlots(
  useCache: boolean = true,
  cacheTTL: number = DEFAULT_CACHE_TTL
): Promise<BlockedSlot[]> {
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
    
    console.log('[BlockedSlots API CALL] Pobieranie danych z API');
    const response = await tablesDB.listRows({ databaseId: dbId, tableId });
    const data = response.rows as unknown as BlockedSlot[];
    
    // Zapisz do cache jeśli włączony
    if (useCache) {
      saveToCache(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching blocked slots:', error);
    throw new Error('Failed to fetch blocked slots');
  }
}

/**
 * Fetch single blocked slot by ID
 */
export async function fetchBlockedSlot(rowId: string): Promise<BlockedSlot> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    const response = await tablesDB.getRow({ databaseId: dbId, tableId, rowId });
    return response as unknown as BlockedSlot;
  } catch (error) {
    console.error('Error fetching blocked slot:', error);
    throw new Error('Failed to fetch blocked slot');
  }
}

/**
 * Create new blocked slot
 */
export async function createBlockedSlot(data: Omit<BlockedSlot, '$id' | 'createdAt' | 'updatedAt'>): Promise<BlockedSlot> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    // Generate a unique ID for the new row
    const rowId = `blocked_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const response = await tablesDB.createRow({ databaseId: dbId, tableId, rowId, data: data as any });
    
    // Wyczyść cache po utworzeniu
    clearBlockedSlotsCache();
    
    return response as unknown as BlockedSlot;
  } catch (error) {
    console.error('Error creating blocked slot:', error);
    throw new Error('Failed to create blocked slot');
  }
}

/**
 * Update existing blocked slot
 */
export async function updateBlockedSlot(rowId: string, data: Partial<BlockedSlot>): Promise<BlockedSlot> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    const response = await tablesDB.updateRow({ databaseId: dbId, tableId, rowId, data: data as any });
    
    // Wyczyść cache po aktualizacji
    clearBlockedSlotsCache();
    
    return response as unknown as BlockedSlot;
  } catch (error) {
    console.error('Error updating blocked slot:', error);
    throw new Error('Failed to update blocked slot');
  }
}

/**
 * Delete blocked slot
 */
export async function deleteBlockedSlot(rowId: string): Promise<void> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    await tablesDB.deleteRow({ databaseId: dbId, tableId, rowId });
    
    // Wyczyść cache po usunięciu
    clearBlockedSlotsCache();
  } catch (error) {
    console.error('Error deleting blocked slot:', error);
    throw new Error('Failed to delete blocked slot');
  }
}

/**
 * Toggle isActive status of a blocked slot
 */
export async function toggleBlockedSlotStatus(rowId: string, currentStatus: boolean): Promise<BlockedSlot> {
  try {
    return await updateBlockedSlot(rowId, { isActive: !currentStatus });
  } catch (error) {
    console.error('Error toggling blocked slot status:', error);
    throw new Error('Failed to toggle blocked slot status');
  }
}

/**
 * Format date for display (DD.MM.YYYY)
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDateDisplay(startDate);
  const end = formatDateDisplay(endDate);
  return startDate === endDate ? start : `${start} - ${end}`;
}

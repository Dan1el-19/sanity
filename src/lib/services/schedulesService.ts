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

// ============ SERVICE FUNCTIONS ============

const getTableId = (): string => {
  const tableId = process.env.SANITY_STUDIO_APPWRITE_SCHEDULES_COLLECTION_ID;
  if (!tableId) {
    throw new Error('Missing SANITY_STUDIO_APPWRITE_SCHEDULES_COLLECTION_ID environment variable');
  }
  return tableId;
};

/**
 * Fetch all schedule presets
 */
export async function fetchSchedulePresets(): Promise<SchedulePreset[]> {
  try {
    const tableId = getTableId();
    const dbId = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
    if (!dbId) {
      throw new Error('Missing SANITY_STUDIO_APPWRITE_DATABASE_ID');
    }
    const response = await tablesDB.listRows({ databaseId: dbId, tableId });
    return response.rows as unknown as SchedulePreset[];
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

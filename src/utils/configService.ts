import { invoke } from '@tauri-apps/api/core';
import { AppSettings, DayItem } from '../types/calendar';
import { DEFAULT_INITIAL_TIMEZONES } from './timezoneData';

const LOCAL_SETTINGS_BACKUP_KEY = 'wik52_settings_backup_v1';
const LOCAL_DAY_ITEMS_BACKUP_KEY = 'wik52_day_items_backup_v1';
let nativeSaveQueue: Promise<void> = Promise.resolve();

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'blue',
  firstDayOfWeek: 1, // ISO 8601 standard
  use24HourFormat: false,
  showWeekProgress: true,
  highlightWorkingHours: true,
  workingHoursStart: 8,
  workingHoursEnd: 17,
  pinnedOnTop: true,
  launchOnStartup: true,
  trayIconStyle: 'badge',
  windowMode: 'flyout',
  savedTimezones: DEFAULT_INITIAL_TIMEZONES,
  enabledHolidays: ['US', 'MX', 'CA', 'IT'],
  enabledHolidayTypes: ['public', 'optional'],
};

export interface Wik52ConfigFile {
  version: number;
  settings: AppSettings;
  dayItems: DayItem[];
  lastSaved: number;
}

/**
 * Loads configuration directly from persistent disk (%APPDATA%\com.wik52.app\wik52_config.json)
 * Guarantees data is preserved across application updates, re-installs, and system reboots.
 */
export async function loadWik52Config(): Promise<{
  settings: AppSettings;
  dayItems: DayItem[];
}> {
  try {
    const rawDiskJson = await invoke<string | null>('get_app_config');
    if (rawDiskJson) {
      const parsed: Wik52ConfigFile = JSON.parse(rawDiskJson);
      return {
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
          savedTimezones:
            parsed.settings?.savedTimezones && parsed.settings.savedTimezones.length >= 5
              ? parsed.settings.savedTimezones
              : DEFAULT_INITIAL_TIMEZONES,
        },
        dayItems: parsed.dayItems || [],
      };
    }
  } catch (e) {
    console.warn('Native config load fallback to local storage:', e);
  }

  // Fallback to localStorage for initial migration if disk file hasn't been written yet
  let initialSettings = DEFAULT_SETTINGS;
  let initialItems: DayItem[] = [];

  try {
    const savedSet = localStorage.getItem('corp_calendar_settings_v6') || localStorage.getItem(LOCAL_SETTINGS_BACKUP_KEY);
    if (savedSet) {
      const parsed = JSON.parse(savedSet);
      initialSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
    const savedItems = localStorage.getItem('corp_calendar_day_items_v2') || localStorage.getItem(LOCAL_DAY_ITEMS_BACKUP_KEY);
    if (savedItems) {
      initialItems = JSON.parse(savedItems);
    }
  } catch (e) {
    console.error('Error in local storage fallback:', e);
  }

  // Write initial config to disk file
  await saveWik52Config(initialSettings, initialItems);

  return {
    settings: initialSettings,
    dayItems: initialItems,
  };
}

/**
 * Saves configuration and notes directly to the persistent disk file.
 */
export async function saveWik52Config(
  settings: AppSettings,
  dayItems: DayItem[]
): Promise<void> {
  const payload: Wik52ConfigFile = {
    version: 1,
    settings,
    dayItems,
    lastSaved: Date.now(),
  };

  const jsonString = JSON.stringify(payload, null, 2);

  // Mirror immediately, then serialize native writes so an older save cannot finish last.
  try {
    localStorage.setItem(LOCAL_SETTINGS_BACKUP_KEY, JSON.stringify(settings));
    localStorage.setItem(LOCAL_DAY_ITEMS_BACKUP_KEY, JSON.stringify(dayItems));
  } catch (e) {
    console.error('Failed to save to local backup:', e);
  }

  nativeSaveQueue = nativeSaveQueue
    .catch(() => undefined)
    .then(() => invoke<void>('save_app_config', { configJson: jsonString }));

  try {
    await nativeSaveQueue;
  } catch (e) {
    console.error('Failed to save config to disk:', e);
  }
}

/**
 * Opens the persistent data directory in Windows Explorer
 */
export async function openConfigFolder(): Promise<string> {
  return await invoke<string>('open_config_folder');
}

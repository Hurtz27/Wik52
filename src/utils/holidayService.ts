import { HolidayType } from '../types/calendar';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  localName: string;
  countryCode: 'US' | 'MX' | 'CA' | 'IT';
  countryName: string;
  flag: string;
  type: HolidayType; // 'public' | 'optional' | 'observance'
}

export const COUNTRY_HOLIDAYS_CONFIG = [
  { code: 'US' as const, name: 'United States', flag: '🇺🇸' },
  { code: 'MX' as const, name: 'Mexico', flag: '🇲🇽' },
  { code: 'CA' as const, name: 'Canada', flag: '🇨🇦' },
  { code: 'IT' as const, name: 'Italy', flag: '🇮🇹' },
];

export const HOLIDAY_TYPE_CONFIG: { type: HolidayType; label: string; description: string; icon: string }[] = [
  { type: 'public', label: 'Public & Statutory', description: 'Official mandatory days off / Federal holidays', icon: '🏛️' },
  { type: 'optional', label: 'Optional & Cultural', description: 'e.g., Día de Muertos, Holy Week, Good Friday, Bridge Days', icon: '🕊️' },
  { type: 'observance', label: 'Observances', description: 'e.g., Valentine\'s Day, Halloween, Mother\'s Day, Earth Day', icon: '🎈' },
];

// Rich Curated dataset for 2026 covering Public, Optional, and Observances
const BUILT_IN_HOLIDAYS_2026: Holiday[] = [
  // ===================== UNITED STATES 2026 =====================
  // Public
  { date: '2026-01-01', name: "New Year's Day", localName: "New Year's Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', localName: 'Martin Luther King Jr. Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-02-16', name: "Presidents' Day", localName: "Presidents' Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-05-25', name: 'Memorial Day', localName: 'Memorial Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-06-19', name: 'Juneteenth', localName: 'Juneteenth', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-07-04', name: 'Independence Day', localName: 'Independence Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-09-07', name: 'Labor Day', localName: 'Labor Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-10-12', name: 'Columbus Day', localName: 'Columbus Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-11-11', name: 'Veterans Day', localName: 'Veterans Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-11-26', name: 'Thanksgiving Day', localName: 'Thanksgiving Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  { date: '2026-12-25', name: 'Christmas Day', localName: 'Christmas Day', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'public' },
  // Optional / Cultural
  { date: '2026-04-03', name: 'Good Friday', localName: 'Good Friday', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'optional' },
  { date: '2026-11-27', name: 'Black Friday / Day after Thanksgiving', localName: 'Day After Thanksgiving', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'optional' },
  { date: '2026-12-24', name: "Christmas Eve", localName: "Christmas Eve", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'optional' },
  { date: '2026-12-31', name: "New Year's Eve", localName: "New Year's Eve", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'optional' },
  // Observances
  { date: '2026-02-14', name: "Valentine's Day", localName: "Valentine's Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'observance' },
  { date: '2026-03-17', name: "St. Patrick's Day", localName: "St. Patrick's Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'observance' },
  { date: '2026-04-22', name: "Earth Day", localName: "Earth Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'observance' },
  { date: '2026-05-10', name: "Mother's Day", localName: "Mother's Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'observance' },
  { date: '2026-06-21', name: "Father's Day", localName: "Father's Day", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'observance' },
  { date: '2026-10-31', name: "Halloween", localName: "Halloween", countryCode: 'US', countryName: 'United States', flag: '🇺🇸', type: 'observance' },

  // ===================== MEXICO 2026 =====================
  // Public (Días Oficiales de Descanso Obligatorio LFT)
  { date: '2026-01-01', name: 'Año Nuevo', localName: 'Año Nuevo', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  { date: '2026-02-02', name: 'Día de la Constitución', localName: 'Día de la Constitución', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  { date: '2026-03-16', name: 'Natalicio de Benito Juárez', localName: 'Natalicio de Benito Juárez', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  { date: '2026-05-01', name: 'Día del Trabajo', localName: 'Día del Trabajo', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  { date: '2026-09-16', name: 'Día de la Independencia', localName: 'Día de la Independencia', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  { date: '2026-11-16', name: 'Día de la Revolución', localName: 'Día de la Revolución', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  { date: '2026-12-25', name: 'Navidad', localName: 'Navidad', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'public' },
  // Optional / Cultural
  { date: '2026-04-02', name: 'Jueves Santo (Semana Santa)', localName: 'Jueves Santo', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  { date: '2026-04-03', name: 'Viernes Santo (Semana Santa)', localName: 'Viernes Santo', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  { date: '2026-05-05', name: 'Batalla de Puebla (Cinco de Mayo)', localName: 'Batalla de Puebla', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  { date: '2026-11-02', name: 'Día de Muertos', localName: 'Día de Muertos', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  { date: '2026-12-12', name: 'Día de la Virgen de Guadalupe', localName: 'Día de la Virgen de Guadalupe', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  { date: '2026-12-24', name: 'Nochebuena', localName: 'Nochebuena', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  { date: '2026-12-31', name: 'Víspera de Año Nuevo', localName: 'Fin de Año', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'optional' },
  // Observances
  { date: '2026-01-06', name: 'Día de Reyes', localName: 'Día de Reyes', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },
  { date: '2026-02-14', name: 'Día del Amor y la Amistad', localName: 'San Valentín', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },
  { date: '2026-02-24', name: 'Día de la Bandera', localName: 'Día de la Bandera', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },
  { date: '2026-04-30', name: 'Día del Niño', localName: 'Día del Niño', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },
  { date: '2026-05-10', name: 'Día de las Madres', localName: 'Día de las Madres', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },
  { date: '2026-05-15', name: 'Día del Maestro', localName: 'Día del Maestro', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },
  { date: '2026-06-21', name: 'Día del Padre', localName: 'Día del Padre', countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', type: 'observance' },

  // ===================== CANADA 2026 =====================
  // Public
  { date: '2026-01-01', name: "New Year's Day", localName: "New Year's Day", countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-04-03', name: 'Good Friday', localName: 'Good Friday', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-05-18', name: 'Victoria Day', localName: 'Victoria Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-07-01', name: 'Canada Day', localName: 'Canada Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-08-03', name: 'Civic / Provincial Day', localName: 'Civic Holiday', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-09-07', name: 'Labour Day', localName: 'Labour Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-09-30', name: 'Truth and Reconciliation Day', localName: 'Truth and Reconciliation Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-10-12', name: 'Thanksgiving Day', localName: 'Thanksgiving Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-11-11', name: 'Remembrance Day', localName: 'Remembrance Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-12-25', name: 'Christmas Day', localName: 'Christmas Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  { date: '2026-12-26', name: 'Boxing Day', localName: 'Boxing Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'public' },
  // Optional / Cultural
  { date: '2026-04-06', name: 'Easter Monday', localName: 'Easter Monday', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'optional' },
  { date: '2026-06-21', name: 'National Indigenous Peoples Day', localName: 'National Indigenous Peoples Day', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'optional' },
  { date: '2026-06-24', name: 'Saint-Jean-Baptiste Day (Quebec)', localName: 'Fête nationale du Québec', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'optional' },
  { date: '2026-12-24', name: 'Christmas Eve', localName: 'Christmas Eve', countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'optional' },
  // Observances
  { date: '2026-02-14', name: "Valentine's Day", localName: "Valentine's Day", countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'observance' },
  { date: '2026-05-10', name: "Mother's Day", localName: "Mother's Day", countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'observance' },
  { date: '2026-06-21', name: "Father's Day", localName: "Father's Day", countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'observance' },
  { date: '2026-10-31', name: "Halloween", localName: "Halloween", countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', type: 'observance' },

  // ===================== ITALY 2026 =====================
  // Public
  { date: '2026-01-01', name: "Capodanno (New Year's Day)", localName: 'Capodanno', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-01-06', name: 'Epifania (Epiphany)', localName: 'Epifania', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-04-05', name: 'Pasqua (Easter Sunday)', localName: 'Pasqua', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-04-06', name: "Lunedì dell'Angelo (Easter Monday)", localName: "Lunedì dell'Angelo", countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-04-25', name: 'Festa della Liberazione (Liberation Day)', localName: 'Festa della Liberazione', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-05-01', name: 'Festa dei Lavoratori (Labour Day)', localName: 'Festa dei Lavoratori', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-06-02', name: 'Festa della Repubblica (Republic Day)', localName: 'Festa della Repubblica', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-08-15', name: 'Ferragosto (Assumption Day)', localName: 'Ferragosto', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-11-01', name: "Tutti i Santi (All Saints' Day)", localName: 'Tutti i Santi', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-12-08', name: 'Immacolata Concezione (Immaculate Conception)', localName: 'Immacolata Concezione', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-12-25', name: 'Natale (Christmas Day)', localName: 'Natale', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  { date: '2026-12-26', name: "Santo Stefano (St. Stephen's Day)", localName: 'Santo Stefano', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'public' },
  // Optional / Cultural
  { date: '2026-02-17', name: 'Martedì Grasso (Carnevale)', localName: 'Martedì Grasso', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'optional' },
  { date: '2026-11-02', name: 'Giorno dei Morti', localName: 'Commemorazione dei Defunti', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'optional' },
  { date: '2026-12-24', name: 'Vigilia di Natale', localName: 'Vigilia di Natale', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'optional' },
  { date: '2026-12-31', name: 'Notte di San Silvestro', localName: 'San Silvestro', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'optional' },
  // Observances
  { date: '2026-02-14', name: 'San Valentino', localName: 'San Valentino', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'observance' },
  { date: '2026-03-08', name: 'Festa della Donna (Women\'s Day)', localName: 'Festa della Donna', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'observance' },
  { date: '2026-03-19', name: 'Festa del Papà (Father\'s Day)', localName: 'Festa del Papà', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'observance' },
  { date: '2026-05-10', name: 'Festa della Mamma (Mother\'s Day)', localName: 'Festa della Mamma', countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', type: 'observance' },
];

const CACHE_PREFIX = 'corp_calendar_holidays_typed_v3_';

function consolidateHolidays(raw: Holiday[]): Holiday[] {
  const map = new Map<string, Holiday>();

  raw.forEach((item) => {
    const key = `${item.date}_${item.countryCode}_${item.type}`;
    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key)!;
      if (!existing.name.toLowerCase().includes(item.name.toLowerCase())) {
        if (existing.name.includes('Civic') || item.name.includes('Civic')) {
          existing.name = 'Civic / Provincial Day';
        } else {
          existing.name = `${existing.name} / ${item.name}`;
        }
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Fetches and filters holidays based on enabled countries AND enabled holiday types
 */
export async function getHolidaysForYear(
  year: number,
  enabledCountries: ('US' | 'MX' | 'CA' | 'IT')[] = ['US', 'MX', 'CA', 'IT'],
  enabledTypes: HolidayType[] = ['public', 'optional', 'observance']
): Promise<Holiday[]> {
  const cacheKey = `${CACHE_PREFIX}${year}`;
  const cached = localStorage.getItem(cacheKey);

  let yearHolidays: Holiday[] = [];

  if (cached) {
    try {
      yearHolidays = JSON.parse(cached);
    } catch {
      yearHolidays = [];
    }
  }

  if (yearHolidays.length === 0) {
    if (year === 2026) {
      yearHolidays = BUILT_IN_HOLIDAYS_2026;
    }

    try {
      const countryPromises = enabledCountries.map(async (cCode) => {
        const flag =
          cCode === 'US' ? '🇺🇸' : cCode === 'MX' ? '🇲🇽' : cCode === 'CA' ? '🇨🇦' : '🇮🇹';
        const countryName =
          cCode === 'US'
            ? 'United States'
            : cCode === 'MX'
            ? 'Mexico'
            : cCode === 'CA'
            ? 'Canada'
            : 'Italy';

        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${cCode}`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data as Array<{ date: string; name: string; localName: string; types?: string[] }>).map((item) => ({
          date: item.date,
          name: item.name,
          localName: item.localName,
          countryCode: cCode,
          countryName,
          flag,
          type: (item.types && item.types.includes('Optional') ? 'optional' : 'public') as HolidayType,
        }));
      });

      const results = await Promise.allSettled(countryPromises);
      const rawFetched: Holiday[] = [];
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          rawFetched.push(...r.value);
        }
      });

      // Merge with curated optional & observances
      const combined = [...rawFetched, ...BUILT_IN_HOLIDAYS_2026.filter((h) => h.type !== 'public')];
      yearHolidays = consolidateHolidays(combined);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(yearHolidays));
      } catch {
        // ignore
      }
    } catch (e) {
      console.debug('Online holiday fetch fallback:', e);
      yearHolidays = BUILT_IN_HOLIDAYS_2026;
    }
  }

  const consolidated = consolidateHolidays(yearHolidays);
  return consolidated.filter(
    (h) => enabledCountries.includes(h.countryCode) && enabledTypes.includes(h.type)
  );
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

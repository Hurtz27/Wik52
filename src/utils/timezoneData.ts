import { TimezoneItem } from '../types/calendar';

export const POPULAR_TIMEZONES: Omit<TimezoneItem, 'id'>[] = [
  { name: 'Local Time', iana: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', country: 'Local System', flag: '📍', isPrimary: true },
  { name: 'Italy (Rome / Milan)', iana: 'Europe/Rome', country: 'Italy (CET/CEST)', flag: '🇮🇹' },
  { name: 'Chicago', iana: 'America/Chicago', country: 'United States (CST/CDT)', flag: '🇺🇸' },
  { name: 'Monterrey', iana: 'America/Monterrey', country: 'Mexico (CST)', flag: '🇲🇽' },
  { name: 'Houston', iana: 'America/Chicago', country: 'United States (CST/CDT)', flag: '🇺🇸' },
  { name: 'Phoenix', iana: 'America/Phoenix', country: 'United States (MST - No DST)', flag: '🇺🇸' },
  { name: 'New York', iana: 'America/New_York', country: 'United States (EST/EDT)', flag: '🇺🇸' },
  { name: 'London', iana: 'Europe/London', country: 'United Kingdom (GMT/BST)', flag: '🇬🇧' },
  { name: 'Madrid / Paris / Berlin', iana: 'Europe/Madrid', country: 'Central Europe (CET/CEST)', flag: '🇪🇸' },
  { name: 'Mexico City', iana: 'America/Mexico_City', country: 'Mexico (CST)', flag: '🇲🇽' },
  { name: 'Bogota / Lima', iana: 'America/Bogota', country: 'Colombia / Peru (COT)', flag: '🇨🇴' },
  { name: 'Sao Paulo', iana: 'America/Sao_Paulo', country: 'Brazil (BRT)', flag: '🇧🇷' },
  { name: 'Tokyo', iana: 'Asia/Tokyo', country: 'Japan (JST)', flag: '🇯🇵' },
  { name: 'Singapore', iana: 'Asia/Singapore', country: 'Singapore (SGT)', flag: '🇸🇬' },
  { name: 'Dubai', iana: 'Asia/Dubai', country: 'United Arab Emirates (GST)', flag: '🇦🇪' },
  { name: 'Sydney', iana: 'Australia/Sydney', country: 'Australia (AEST/AEDT)', flag: '🇦🇺' },
  { name: 'San Francisco / Los Angeles', iana: 'America/Los_Angeles', country: 'United States (PST/PDT)', flag: '🇺🇸' },
  { name: 'Buenos Aires', iana: 'America/Argentina/Buenos_Aires', country: 'Argentina (ART)', flag: '🇦🇷' },
  { name: 'Santiago', iana: 'America/Santiago', country: 'Chile (CLT/CLST)', flag: '🇨🇱' },
  { name: 'Frankfurt / Zurich', iana: 'Europe/Berlin', country: 'Germany / Switzerland (CET)', flag: '🇩🇪' },
  { name: 'Mumbai / New Delhi', iana: 'Asia/Kolkata', country: 'India (IST)', flag: '🇮🇳' },
  { name: 'UTC / GMT', iana: 'UTC', country: 'Global Standard', flag: '🌐' },
];

export const DEFAULT_INITIAL_TIMEZONES: TimezoneItem[] = [
  {
    id: 'local-1',
    name: 'Local Time',
    iana: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    country: 'Your System',
    customLabel: 'Local System',
    flag: '📍',
    isPrimary: true,
  },
  {
    id: 'ita-2',
    name: 'Italy',
    iana: 'Europe/Rome',
    country: 'Europe',
    customLabel: 'Rome / Milan',
    flag: '🇮🇹',
  },
  {
    id: 'chi-3',
    name: 'Chicago',
    iana: 'America/Chicago',
    country: 'United States',
    customLabel: 'US Central',
    flag: '🇺🇸',
  },
  {
    id: 'mty-4',
    name: 'Monterrey',
    iana: 'America/Monterrey',
    country: 'Mexico',
    customLabel: 'Mexico Central',
    flag: '🇲🇽',
  },
  {
    id: 'hou-5',
    name: 'Houston',
    iana: 'America/Chicago',
    country: 'United States',
    customLabel: 'Texas',
    flag: '🇺🇸',
  },
  {
    id: 'phx-6',
    name: 'Phoenix',
    iana: 'America/Phoenix',
    country: 'United States',
    customLabel: 'Arizona (No DST)',
    flag: '🇺🇸',
  },
];

/**
 * Formats a Date object in a specific IANA timezone in English.
 * Work hours default: 8:00 AM to 5:00 PM (08:00 - 17:00).
 */
export function formatInTimezone(
  date: Date,
  ianaTimezone: string,
  options: {
    use24Hour?: boolean;
    includeSeconds?: boolean;
    includeDate?: boolean;
    workingHoursStart?: number; // default: 8 (8:00 AM)
    workingHoursEnd?: number;   // default: 17 (5:00 PM)
  } = {}
): {
  timeString: string;
  period: string;
  dateString: string;
  offsetString: string;
  hourNumber: number;
  minuteNumber: number;
  isWorkingHours: boolean;
  dayOffsetNotice: string; // "+1 day", "-1 day", "Same day"
} {
  const {
    use24Hour = false,
    includeSeconds = false,
    workingHoursStart = 8,
    workingHoursEnd = 17,
  } = options;

  try {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: !use24Hour,
    });

    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      hour: 'numeric',
      hour12: false,
    });

    const minuteFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      minute: 'numeric',
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const parts = timeFormatter.formatToParts(date);
    let timeString = '';
    let period = '';

    parts.forEach((part) => {
      if (part.type === 'dayPeriod') {
        period = part.value.toUpperCase();
      } else {
        timeString += part.value;
      }
    });

    timeString = timeString.trim();

    const hourNumber = parseInt(hourFormatter.format(date), 10) || 0;
    const minuteNumber = parseInt(minuteFormatter.format(date), 10) || 0;
    const dateString = dateFormatter.format(date);

    // Business working hours: 8:00 AM (08:00) to 5:00 PM (17:00)
    const isWorkingHours = hourNumber >= workingHoursStart && hourNumber < workingHoursEnd;

    // Day offset relative to local date
    const localDay = date.getDate();
    const targetDayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      day: 'numeric',
    });
    const targetDay = parseInt(targetDayFormatter.format(date), 10);

    let dayOffsetNotice = '';
    if (targetDay > localDay || (targetDay === 1 && localDay > 25)) {
      dayOffsetNotice = '+1 day';
    } else if (targetDay < localDay || (targetDay > 25 && localDay === 1)) {
      dayOffsetNotice = '-1 day';
    }

    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      timeZoneName: 'shortOffset',
    });
    const offsetParts = offsetFormatter.formatToParts(date);
    const offsetPart = offsetParts.find((p) => p.type === 'timeZoneName');
    const offsetString = offsetPart ? offsetPart.value : '';

    return {
      timeString,
      period,
      dateString,
      offsetString,
      hourNumber,
      minuteNumber,
      isWorkingHours,
      dayOffsetNotice,
    };
  } catch {
    return {
      timeString: '--:--',
      period: '',
      dateString: 'Invalid Zone',
      offsetString: 'UTC',
      hourNumber: 0,
      minuteNumber: 0,
      isWorkingHours: false,
      dayOffsetNotice: '',
    };
  }
}

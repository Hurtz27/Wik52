export type AccentColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'teal'
  | 'rose'
  | 'slate';

export type HolidayType = 'public' | 'optional' | 'observance';

export interface TimezoneItem {
  id: string;
  name: string;        // e.g. "Monterrey", "Chicago", "Italy"
  iana: string;        // e.g. "America/Monterrey", "America/Chicago", "Europe/Rome"
  country: string;     // e.g. "Mexico", "United States", "Italy"
  customLabel?: string;// e.g. "HQ", "Plant", "Sales Team"
  flag: string;        // e.g. "🇲🇽", "🇺🇸", "🇮🇹"
  isPrimary?: boolean; // Is local machine timezone
}

export interface DayItem {
  id: string;
  targetType: 'day' | 'week';
  date?: string;        // YYYY-MM-DD (if day note/reminder)
  weekNumber?: number;  // 1-53 (if week note)
  year?: number;        // e.g. 2026
  title: string;
  type: 'note' | 'reminder';
  time?: string;        // e.g. "14:30"
  completed?: boolean;
  createdAt: number;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColor;
  firstDayOfWeek: 1 | 0; // 1 = Monday (ISO standard), 0 = Sunday
  use24HourFormat: boolean;
  showWeekProgress: boolean;
  highlightWorkingHours: boolean;
  workingHoursStart: number; // e.g. 8
  workingHoursEnd: number;   // e.g. 17
  pinnedOnTop: boolean;
  launchOnStartup: boolean;
  windowOpacity?: number; // 0.50 to 1.0 (e.g. 0.94)
  trayIconStyle?: 'badge' | 'calendar' | 'minimal';
  windowMode: 'flyout' | 'widget' | 'compact';
  savedTimezones: TimezoneItem[];
  enabledHolidays: ('US' | 'MX' | 'CA' | 'IT')[];
  enabledHolidayTypes: HolidayType[];
}

export type CalendarViewMode = 'month' | 'year-weeks' | 'timezone-planner';

export interface WeekInfo {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isCurrentWeek: boolean;
}

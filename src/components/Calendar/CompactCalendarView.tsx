import React, { useMemo } from 'react';
import { Calendar, Maximize2, Settings, Minus, X, ChevronLeft, ChevronRight, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { invoke } from '@tauri-apps/api/core';
import { AppSettings, DayItem } from '../../types/calendar';
import { generateMonthGrid, getWeekNumber } from '../../utils/weekCalculator';
import { Holiday, formatDateKey } from '../../utils/holidayService';

interface CompactCalendarViewProps {
  currentDate: Date;
  viewDate: Date;
  selectedDate: Date;
  settings: AppSettings;
  holidays: Holiday[];
  dayItems: DayItem[];
  onViewDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  onSwitchMode: (mode: 'flyout' | 'widget' | 'compact') => void;
  onOpenSettings: () => void;
  onOpenAddDayModal: (date: Date, type: 'note' | 'reminder') => void;
  onOpenAddWeekModal: (weekNumber: number, year: number) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onShowToast: (msg: string) => void;
}

export const CompactCalendarView: React.FC<CompactCalendarViewProps> = ({
  currentDate,
  viewDate,
  selectedDate,
  settings,
  holidays,
  dayItems,
  onViewDateChange,
  onSelectDate,
  onSwitchMode,
  onOpenSettings,
  onOpenAddDayModal,
  onOpenAddWeekModal,
  onUpdateSettings,
  onShowToast,
}) => {
  const currentWeek = getWeekNumber(currentDate, settings.firstDayOfWeek);
  const monthRows = useMemo(
    () => generateMonthGrid(viewDate, selectedDate, settings.firstDayOfWeek),
    [viewDate, selectedDate, settings.firstDayOfWeek]
  );
  const holidaysByDate = useMemo(() => {
    const index = new Map<string, Holiday[]>();
    holidays.forEach((holiday) => {
      index.set(holiday.date, [...(index.get(holiday.date) || []), holiday]);
    });
    return index;
  }, [holidays]);
  const dayItemsByDate = useMemo(() => {
    const index = new Map<string, DayItem[]>();
    dayItems.forEach((item) => {
      if (item.targetType === 'day' && item.date) {
        index.set(item.date, [...(index.get(item.date) || []), item]);
      }
    });
    return index;
  }, [dayItems]);
  const weekItemsByWeek = useMemo(() => {
    const index = new Map<string, DayItem[]>();
    dayItems.forEach((item) => {
      if (item.targetType === 'week' && item.weekNumber && item.year) {
        const key = `${item.year}-${item.weekNumber}`;
        index.set(key, [...(index.get(key) || []), item]);
      }
    });
    return index;
  }, [dayItems]);

  const handlePrevMonth = () => {
    onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleJumpToday = () => {
    const today = new Date();
    onViewDateChange(today);
    onSelectDate(today);
  };

  const handleWeekClick = (weekNumber: number, startDate: Date, endDate: Date) => {
    const startStr = format(startDate, 'MMM d', { locale: enUS });
    const endStr = format(endDate, 'MMM d, yyyy', { locale: enUS });
    navigator.clipboard.writeText(`Week ${weekNumber} (${startStr} – ${endStr})`);
    onShowToast(`Week ${weekNumber} copied`);
  };

  const handleMinimize = async () => {
    try {
      await invoke('hide_window');
    } catch {
      console.log('Hide window');
    }
  };

  const handleClose = async () => {
    try {
      await invoke('hide_window');
    } catch {
      console.log('Close to tray');
    }
  };

  const handleTogglePin = () => {
    onUpdateSettings({ pinnedOnTop: !settings.pinnedOnTop });
  };

  const dayHeaders =
    settings.firstDayOfWeek === 1
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className={`flyout-container accent-${settings.accentColor || 'blue'} ${
        settings.theme === 'light' ? 'light-theme' : ''
      }`}
      style={{ width: '100vw', height: '100vh', padding: 0, overflow: 'hidden' }}
    >
      {/* Compact TitleBar (Draggable) */}
      <div className="titlebar" data-tauri-drag-region style={{ height: '34px', padding: '4px 10px' }}>
        <div className="titlebar-drag" data-tauri-drag-region style={{ gap: '6px' }}>
          <Calendar size={14} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 800, fontSize: '12.5px' }}>Wik52</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              background: 'var(--accent-blue)',
              color: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            W{currentWeek}
          </span>
        </div>

        <div className="titlebar-actions">
          {/* Expand to Full View */}
          <button
            className="icon-button"
            title="Expand to Full View"
            onClick={() => onSwitchMode('flyout')}
          >
            <Maximize2 size={12} />
          </button>

          {/* Pin */}
          <button
            className={`icon-button ${settings.pinnedOnTop ? 'active' : ''}`}
            title={settings.pinnedOnTop ? 'Unpin' : 'Pin on Top'}
            onClick={handleTogglePin}
          >
            <Pin size={12} />
          </button>

          {/* Settings */}
          <button className="icon-button" title="Settings" onClick={onOpenSettings}>
            <Settings size={12} />
          </button>

          {/* Minimize */}
          <button className="icon-button" title="Minimize" onClick={handleMinimize}>
            <Minus size={12} />
          </button>

          {/* Close */}
          <button className="icon-button close" title="Hide to Tray" onClick={handleClose}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Compact Calendar Body */}
      <div style={{ padding: '6px 10px 8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflow: 'hidden' }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>
            {format(viewDate, 'MMMM yyyy', { locale: enUS })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <button className="today-jump-btn" onClick={handleJumpToday} style={{ fontSize: '10px', padding: '1px 6px' }}>
              Today
            </button>
            <button className="icon-button" onClick={handlePrevMonth} style={{ width: '22px', height: '22px' }}>
              <ChevronLeft size={14} />
            </button>
            <button className="icon-button" onClick={handleNextMonth} style={{ width: '22px', height: '22px' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Calendar Matrix */}
        <div className="calendar-grid" style={{ gap: '2px' }}>
          {/* Header */}
          <div className="calendar-row" style={{ gridTemplateColumns: '32px repeat(7, 1fr)', gap: '2px' }}>
            <div className="calendar-header-cell week-col-header" style={{ fontSize: '9px' }}>
              WK
            </div>
            {dayHeaders.map((dh, i) => (
              <div key={dh} className={`calendar-header-cell ${i >= 5 ? 'weekend' : ''}`} style={{ fontSize: '9.5px' }}>
                {dh.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {monthRows.map((row) => {
            const weekNotes =
              weekItemsByWeek.get(`${viewDate.getFullYear()}-${row.weekNumber}`) || [];
            const hasWeekNotes = weekNotes.length > 0;

            return (
              <div
                key={`row-${row.weekNumber}-${row.startDate.toISOString()}`}
                className="calendar-row"
                style={{ gridTemplateColumns: '32px repeat(7, 1fr)', gap: '2px' }}
              >
                {/* Week Badge */}
                <div
                  className={`week-number-pill ${row.isCurrentWeek ? 'current' : ''}`}
                  style={{ height: '28px', fontSize: '9.5px', borderRadius: '4px' }}
                  title={`Week ${row.weekNumber} (Click to copy)`}
                  onClick={() => handleWeekClick(row.weekNumber, row.startDate, row.endDate)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onOpenAddWeekModal(row.weekNumber, viewDate.getFullYear());
                  }}
                >
                  <span>W{row.weekNumber}</span>
                  {hasWeekNotes && (
                    <span
                      style={{
                        width: '3.5px',
                        height: '3.5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-cyan)',
                        boxShadow: '0 0 4px var(--accent-cyan)',
                      }}
                    />
                  )}
                </div>

                {/* Days */}
                {row.days.map((day) => {
                  const dayKey = formatDateKey(day.date);
                  const dayHolidays = holidaysByDate.get(dayKey) || [];
                  const itemsForDay = dayItemsByDate.get(dayKey) || [];
                  const hasActiveReminder = itemsForDay.some((i) => i.type === 'reminder' && !i.completed);
                  const hasNote = itemsForDay.some((i) => i.type === 'note');

                  const uniqueCountryHolidays = Array.from(
                    new Map(dayHolidays.map((h) => [h.countryCode, h])).values()
                  );

                  return (
                    <button
                      key={day.date.toISOString()}
                      className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                        day.isToday ? 'today' : ''
                      } ${day.isSelected ? 'selected' : ''} ${day.isWeekend ? 'weekend' : ''}`}
                      style={{ height: '28px', fontSize: '11px', borderRadius: '4px' }}
                      onClick={() => onSelectDate(day.date)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onSelectDate(day.date);
                        onOpenAddDayModal(day.date, 'note');
                      }}
                      title={`${format(day.date, 'MMM d, yyyy', { locale: enUS })}${
                        uniqueCountryHolidays.length > 0 ? `\n🎉 ${uniqueCountryHolidays.map((h) => `${h.name} (${h.countryName})`).join(', ')}` : ''
                      }`}
                    >
                      {/* Top-Right Notification Lights */}
                      {(hasActiveReminder || hasNote) && (
                        <div className="day-cell-indicators" style={{ top: '2px', right: '2px' }}>
                          {hasActiveReminder && (
                            <span
                              className="day-indicator-dot reminder"
                              style={{ width: '3.5px', height: '3.5px' }}
                              title="Active Reminder"
                            />
                          )}
                          {hasNote && (
                            <span
                              className="day-indicator-dot note"
                              style={{ width: '3.5px', height: '3.5px' }}
                              title="Has Note"
                            />
                          )}
                        </div>
                      )}

                      <span className="day-cell-number">{day.dayNumber}</span>

                      {/* Bottom Country Initials */}
                      {uniqueCountryHolidays.length > 0 && (
                        <div className="day-cell-holidays" style={{ gap: '1px', marginTop: '0px' }}>
                          {uniqueCountryHolidays.map((h) => (
                            <span key={h.countryCode} className="holiday-country-tag" style={{ fontSize: '7px' }}>
                              {h.countryCode}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

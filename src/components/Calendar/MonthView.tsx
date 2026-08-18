import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, PartyPopper, Plus, Trash2, FileText, Bell, CalendarRange, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Holiday, formatDateKey } from '../../utils/holidayService';
import { generateMonthGrid, getWeekNumber } from '../../utils/weekCalculator';
import { DayItem } from '../../types/calendar';

interface ContextMenuState {
  x: number;
  y: number;
  type: 'day' | 'week';
  date?: Date;
  week?: {
    weekNumber: number;
    year: number;
    startDate: Date;
    endDate: Date;
  };
}

interface MonthViewProps {
  viewDate: Date;
  selectedDate: Date;
  firstDayOfWeek: 1 | 0;
  holidays: Holiday[];
  dayItems: DayItem[];
  onViewDateChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  onOpenAddDayModal: (date: Date, type: 'note' | 'reminder') => void;
  onOpenAddWeekModal: (weekNumber: number, year: number, label?: string) => void;
  onEditDayItem?: (item: DayItem) => void;
  onDeleteDayItem: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  viewDate,
  selectedDate,
  firstDayOfWeek,
  holidays,
  dayItems,
  onViewDateChange,
  onSelectDate,
  onOpenAddDayModal,
  onOpenAddWeekModal,
  onEditDayItem,
  onDeleteDayItem,
  onShowToast,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleOutside = () => setContextMenu(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const monthRows = useMemo(
    () => generateMonthGrid(viewDate, selectedDate, firstDayOfWeek),
    [viewDate, selectedDate, firstDayOfWeek]
  );

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
    const text = `Week ${weekNumber} (${startStr} – ${endStr})`;
    navigator.clipboard.writeText(text);
    onShowToast(`Week ${weekNumber} copied`);
  };

  const handleDayContextMenu = (e: React.MouseEvent, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectDate(date);

    const clickX = Math.min(e.clientX, window.innerWidth - 170);
    const clickY = Math.min(e.clientY, window.innerHeight - 150);

    setContextMenu({
      x: clickX,
      y: clickY,
      type: 'day',
      date,
    });
  };

  const handleWeekContextMenu = (
    e: React.MouseEvent,
    weekNumber: number,
    startDate: Date,
    endDate: Date
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const clickX = Math.min(e.clientX, window.innerWidth - 170);
    const clickY = Math.min(e.clientY, window.innerHeight - 150);

    setContextMenu({
      x: clickX,
      y: clickY,
      type: 'week',
      week: { weekNumber, year: viewDate.getFullYear(), startDate, endDate },
    });
  };

  // Find holidays and notes for selected date
  const selectedKey = formatDateKey(selectedDate);
  const selectedHolidays = holidays.filter((h) => h.date === selectedKey);
  const uniqueSelectedHolidays = Array.from(
    new Map(selectedHolidays.map((h) => [h.countryCode, h])).values()
  );

  const selectedDayItems = dayItems.filter(
    (item) => item.targetType === 'day' && item.date === selectedKey
  );
  const selectedNotes = selectedDayItems.filter((i) => i.type === 'note');

  // Find week notes for currently selected date's week
  const selectedWeekNumber = getWeekNumber(selectedDate, firstDayOfWeek);
  const selectedYear = selectedDate.getFullYear();
  const selectedWeekNotes = dayItems.filter(
    (item) =>
      item.targetType === 'week' &&
      item.weekNumber === selectedWeekNumber &&
      item.year === selectedYear
  );

  const primaryType = uniqueSelectedHolidays.some((h) => h.type === 'public')
    ? 'Public Holiday'
    : uniqueSelectedHolidays.some((h) => h.type === 'optional')
    ? 'Optional / Cultural'
    : 'Observance';

  const dayHeaders =
    firstDayOfWeek === 1
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="calendar-card">
        {/* Month Navigation */}
        <div className="calendar-header">
          <div className="month-label">
            {format(viewDate, 'MMMM yyyy', { locale: enUS })}
          </div>

          <div className="calendar-nav-group">
            <button className="today-jump-btn" onClick={handleJumpToday} title="Jump to today">
              Today
            </button>
            <button className="icon-button" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="icon-button" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Matrix */}
        <div className="calendar-grid">
          {/* Column Headers */}
          <div className="calendar-row">
            <div className="calendar-header-cell week-col-header" title="Week Number">
              WK
            </div>
            {dayHeaders.map((dh, i) => (
              <div key={dh} className={`calendar-header-cell ${i >= 5 ? 'weekend' : ''}`}>
                {dh}
              </div>
            ))}
          </div>

          {/* Month Rows with Week Number Badge */}
          {monthRows.map((row) => {
            const weekNotes = dayItems.filter(
              (item) =>
                item.targetType === 'week' &&
                item.weekNumber === row.weekNumber &&
                item.year === viewDate.getFullYear()
            );
            const hasWeekNotes = weekNotes.length > 0;

            return (
              <div
                key={`week-${row.weekNumber}-${row.startDate.toISOString()}`}
                className="calendar-row"
              >
                {/* Week Badge with Right-Click Support & Notes Indicator */}
                <div
                  className={`week-number-pill ${row.isCurrentWeek ? 'current' : ''}`}
                  title={`Week ${row.weekNumber} (Left-click to copy • Right-click to add note)${
                    hasWeekNotes
                      ? `\n📝 Week Notes: ${weekNotes.map((n) => n.title).join(', ')}`
                      : ''
                  }`}
                  onClick={() => handleWeekClick(row.weekNumber, row.startDate, row.endDate)}
                  onContextMenu={(e) =>
                    handleWeekContextMenu(e, row.weekNumber, row.startDate, row.endDate)
                  }
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1px' }}
                >
                  <span>W{row.weekNumber}</span>
                  {hasWeekNotes && (
                    <span
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-cyan)',
                        boxShadow: '0 0 4px var(--accent-cyan)',
                      }}
                    />
                  )}
                </div>

                {/* 7 Days of this week */}
                {row.days.map((day) => {
                  const dayKey = formatDateKey(day.date);
                  const dayHolidays = holidays.filter((h) => h.date === dayKey);
                  const itemsForDay = dayItems.filter(
                    (i) => i.targetType === 'day' && i.date === dayKey
                  );
                  // Amber light only on if there is at least one UNCOMPLETED reminder
                  const hasActiveReminder = itemsForDay.some((i) => i.type === 'reminder' && !i.completed);
                  const hasNote = itemsForDay.some((i) => i.type === 'note');

                  // Deduplicate to only one entry per country per date
                  const uniqueCountryHolidays = Array.from(
                    new Map(dayHolidays.map((h) => [h.countryCode, h])).values()
                  );

                  const holidayTooltip = uniqueCountryHolidays
                    .map((h) => `${h.flag} ${h.name} (${h.countryName})`)
                    .join(' • ');

                  const notesTooltip = itemsForDay
                    .map((i) => `${i.type === 'reminder' ? (i.completed ? '✅ Reminder' : '⏰ Reminder') : '📝 Note'}: ${i.title}`)
                    .join('\n');

                  const fullTitle = `${format(day.date, 'EEEE, MMMM d, yyyy', { locale: enUS })}${
                    holidayTooltip ? `\n🎉 ${holidayTooltip}` : ''
                  }${notesTooltip ? `\n${notesTooltip}` : '\n(Right-click to add note/reminder)'}`;

                  return (
                    <button
                      key={day.date.toISOString()}
                      className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                        day.isToday ? 'today' : ''
                      } ${day.isSelected ? 'selected' : ''} ${day.isWeekend ? 'weekend' : ''}`}
                      onClick={() => onSelectDate(day.date)}
                      onContextMenu={(e) => handleDayContextMenu(e, day.date)}
                      title={fullTitle}
                    >
                      {/* Top-Right Notification Lights (Amber = Active Reminder, Green = Note) */}
                      {(hasActiveReminder || hasNote) && (
                        <div className="day-cell-indicators">
                          {hasActiveReminder && (
                            <span
                              className="day-indicator-dot reminder"
                              title="Active Reminder"
                            />
                          )}
                          {hasNote && (
                            <span
                              className="day-indicator-dot note"
                              title="Has Note"
                            />
                          )}
                        </div>
                      )}

                      {/* Day Number */}
                      <span className="day-cell-number">{day.dayNumber}</span>

                      {/* Bottom Country Initials with Holiday */}
                      {uniqueCountryHolidays.length > 0 && (
                        <div className="day-cell-holidays">
                          {uniqueCountryHolidays.map((h) => (
                            <span
                              key={h.countryCode}
                              className="holiday-country-tag"
                              title={`${h.flag} ${h.name} (${h.countryName})`}
                            >
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

      {/* Selected Day Holiday Details Banner */}
      {uniqueSelectedHolidays.length > 0 && (
        <div className="holiday-detail-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PartyPopper size={16} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>
                {format(selectedDate, 'MMMM d', { locale: enUS })} Holiday
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {uniqueSelectedHolidays.map((h) => `${h.flag} ${h.name} (${h.countryName})`).join(' • ')}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '10px',
              background: 'var(--week-badge-bg)',
              color: 'var(--accent-cyan)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
            }}
          >
            {primaryType}
          </span>
        </div>
      )}

      {/* Week Notes Card (for selected week) */}
      {selectedWeekNotes.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              <CalendarRange size={13} color="var(--accent-cyan)" />
              <span>Notes for Week {selectedWeekNumber} ({selectedYear})</span>
            </div>
            <button
              onClick={() => onOpenAddWeekModal(selectedWeekNumber, selectedYear)}
              className="today-jump-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', fontSize: '10px' }}
            >
              <Plus size={10} />
              <span>Add Week Note</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {selectedWeekNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle)',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11.5px',
                }}
              >
                <span>{note.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {onEditDayItem && (
                    <button
                      className="icon-button"
                      style={{ width: '20px', height: '20px', opacity: 0.75 }}
                      onClick={() => onEditDayItem(note)}
                      title="Edit week note"
                    >
                      <Edit2 size={11} color="var(--accent-cyan)" />
                    </button>
                  )}
                  <button
                    className="icon-button"
                    style={{ width: '20px', height: '20px', opacity: 0.6 }}
                    onClick={() => onDeleteDayItem(note.id)}
                    title="Delete week note"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Day Notes Card (if any notes on this day) */}
      {selectedNotes.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              <FileText size={13} color="var(--accent-cyan)" />
              <span>Notes for {format(selectedDate, 'MMM d', { locale: enUS })}</span>
            </div>
            <button
              onClick={() => onOpenAddDayModal(selectedDate, 'note')}
              className="today-jump-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', fontSize: '10px' }}
            >
              <Plus size={10} />
              <span>Add Note</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {selectedNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle)',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11.5px',
                }}
              >
                <span>{note.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {onEditDayItem && (
                    <button
                      className="icon-button"
                      style={{ width: '20px', height: '20px', opacity: 0.75 }}
                      onClick={() => onEditDayItem(note)}
                      title="Edit note"
                    >
                      <Edit2 size={11} color="var(--accent-cyan)" />
                    </button>
                  )}
                  <button
                    className="icon-button"
                    style={{ width: '20px', height: '20px', opacity: 0.6 }}
                    onClick={() => onDeleteDayItem(note.id)}
                    title="Delete note"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sleek Right-Click Context Menu for Day or Week */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 300,
            background: 'rgba(26, 31, 44, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-flyout)',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '160px',
            animation: 'fadeInFlyout 0.15s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '2px',
            }}
          >
            {contextMenu.type === 'week' && contextMenu.week
              ? `Week ${contextMenu.week.weekNumber} (${contextMenu.week.year})`
              : contextMenu.date
              ? format(contextMenu.date, 'MMM d, yyyy', { locale: enUS })
              : ''}
          </div>

          {contextMenu.type === 'week' && contextMenu.week ? (
            <>
              {/* Add Week Note Button */}
              <button
                onClick={() => {
                  const w = contextMenu.week!;
                  setContextMenu(null);
                  onOpenAddWeekModal(w.weekNumber, w.year);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <CalendarRange size={13} color="var(--accent-cyan)" />
                <span>Add Week Note</span>
              </button>

              {/* Copy Week Info */}
              <button
                onClick={() => {
                  const w = contextMenu.week!;
                  setContextMenu(null);
                  handleWeekClick(w.weekNumber, w.startDate, w.endDate);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FileText size={13} color="var(--accent-cyan)" />
                <span>Copy Week Info</span>
              </button>
            </>
          ) : (
            <>
              {/* Add Note Button */}
              <button
                onClick={() => {
                  const target = contextMenu.date!;
                  setContextMenu(null);
                  onOpenAddDayModal(target, 'note');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FileText size={13} color="var(--accent-cyan)" />
                <span>Add Note</span>
              </button>

              {/* Add Reminder Button */}
              <button
                onClick={() => {
                  const target = contextMenu.date!;
                  setContextMenu(null);
                  onOpenAddDayModal(target, 'reminder');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Bell size={13} color="#F59E0B" />
                <span>Add Reminder</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

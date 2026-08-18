import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CalendarRange, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getYearWeeksByQuarter } from '../../utils/weekCalculator';
import { DayItem } from '../../types/calendar';

interface YearWeeksViewProps {
  currentDate: Date;
  firstDayOfWeek: 1 | 0;
  dayItems: DayItem[];
  onSelectWeek: (startDate: Date) => void;
  onOpenAddWeekModal: (weekNumber: number, year: number) => void;
  onShowToast: (msg: string) => void;
}

export const YearWeeksView: React.FC<YearWeeksViewProps> = ({
  currentDate,
  firstDayOfWeek,
  dayItems,
  onSelectWeek,
  onOpenAddWeekModal,
  onShowToast,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    weekNumber: number;
    year: number;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  useEffect(() => {
    const handleOutside = () => setContextMenu(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const quarters = getYearWeeksByQuarter(selectedYear, firstDayOfWeek);

  const handleWeekRightClick = (
    e: React.MouseEvent,
    weekNumber: number,
    year: number,
    startDate: Date,
    endDate: Date
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const clickX = Math.min(e.clientX, window.innerWidth - 170);
    const clickY = Math.min(e.clientY, window.innerHeight - 120);

    setContextMenu({
      x: clickX,
      y: clickY,
      weekNumber,
      year,
      startDate,
      endDate,
    });
  };

  const handleCopyWeek = (weekNumber: number, startDate: Date, endDate: Date) => {
    const s = format(startDate, 'MMM d', { locale: enUS });
    const e = format(endDate, 'MMM d, yyyy', { locale: enUS });
    navigator.clipboard.writeText(`Week ${weekNumber} (${s} – ${e})`);
    onShowToast(`Week ${weekNumber} copied`);
  };

  return (
    <div className="calendar-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Year Selector */}
      <div className="calendar-header">
        <div className="month-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="var(--accent-cyan)" />
          <span>Annual Week Planner ({selectedYear})</span>
        </div>

        <div className="calendar-nav-group">
          <button className="icon-button" onClick={() => setSelectedYear((y) => y - 1)} title="Previous Year">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedYear}</span>
          <button className="icon-button" onClick={() => setSelectedYear((y) => y + 1)} title="Next Year">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quarters Grid - Uses full remaining vertical height */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '2px' }}>
        {quarters.map((q) => (
          <div key={q.quarter} style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 10px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '5px' }}>
              {q.label}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '5px' }}>
              {q.weeks.map((w) => {
                const s = format(w.startDate, 'MMM d', { locale: enUS });
                const e = format(w.endDate, 'MMM d', { locale: enUS });

                const weekNotes = dayItems.filter(
                  (i) => i.targetType === 'week' && i.weekNumber === w.weekNumber && i.year === selectedYear
                );
                const hasWeekNotes = weekNotes.length > 0;

                const tooltipNotes = hasWeekNotes
                  ? `\n📝 Week Notes: ${weekNotes.map((n) => n.title).join(', ')}`
                  : '\n(Right-click to add week note)';

                return (
                  <button
                    key={`w-${w.weekNumber}`}
                    onClick={() => {
                      onSelectWeek(w.startDate);
                      onShowToast(`Week ${w.weekNumber} selected`);
                    }}
                    onContextMenu={(e) =>
                      handleWeekRightClick(e, w.weekNumber, selectedYear, w.startDate, w.endDate)
                    }
                    style={{
                      background: w.isCurrentWeek ? 'var(--accent-blue)' : 'var(--bg-card)',
                      border: w.isCurrentWeek ? '1.5px solid #FFFFFF' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      boxShadow: w.isCurrentWeek ? '0 0 10px var(--accent-glow)' : 'none',
                      position: 'relative',
                    }}
                    title={`Week ${w.weekNumber}: ${s} - ${e}${tooltipNotes}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>W{w.weekNumber}</span>
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
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>{s}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Week Context Menu in 52-Week Planner */}
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
            Week {contextMenu.weekNumber} ({contextMenu.year})
          </div>

          <button
            onClick={() => {
              const { weekNumber, year } = contextMenu;
              setContextMenu(null);
              onOpenAddWeekModal(weekNumber, year);
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

          <button
            onClick={() => {
              const { weekNumber, startDate, endDate } = contextMenu;
              setContextMenu(null);
              handleCopyWeek(weekNumber, startDate, endDate);
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
        </div>
      )}
    </div>
  );
};

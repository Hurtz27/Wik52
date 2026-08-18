import React from 'react';
import { Copy } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getWeekInfo, getYearMetrics } from '../../utils/weekCalculator';
import { startWindowDrag } from '../../utils/dragHelper';

interface WeekHeroBannerProps {
  currentDate: Date;
  firstDayOfWeek: 1 | 0;
  onShowToast: (msg: string) => void;
}

export const WeekHeroBanner: React.FC<WeekHeroBannerProps> = ({
  currentDate,
  firstDayOfWeek,
  onShowToast,
}) => {
  const weekInfo = getWeekInfo(currentDate, firstDayOfWeek);
  const metrics = getYearMetrics(currentDate, firstDayOfWeek);

  const startStr = format(weekInfo.startDate, 'MMM d', { locale: enUS });
  const endStr = format(weekInfo.endDate, 'MMM d, yyyy', { locale: enUS });

  const handleCopyWeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `Week ${weekInfo.weekNumber} (${startStr} – ${endStr})`;
    navigator.clipboard.writeText(textToCopy);
    onShowToast(`Copied: ${textToCopy}`);
  };

  return (
    <div
      className="week-hero-card"
      data-tauri-drag-region
      onMouseDown={startWindowDrag}
      style={{ cursor: 'grab' }}
    >
      <div className="week-hero-top" data-tauri-drag-region>
        <div data-tauri-drag-region>
          <div className="week-hero-number" data-tauri-drag-region>
            <span>WEEK {weekInfo.weekNumber}</span>
            <span style={{ fontSize: '15px', fontWeight: 600, opacity: 0.85 }}>
              / {metrics.totalWeeks}
            </span>
          </div>
          <div className="week-hero-sub" data-tauri-drag-region>
            {startStr} – {endStr}
          </div>
        </div>

        <button className="week-hero-btn" onClick={handleCopyWeek} title="Copy week number">
          <Copy size={12} />
          <span>Copy</span>
        </button>
      </div>

      <div className="week-progress-track" data-tauri-drag-region>
        <div
          className="week-progress-fill"
          style={{ width: `${metrics.yearProgressPercent}%` }}
        />
      </div>

      <div className="week-hero-stats" data-tauri-drag-region>
        <span>
          <strong>{metrics.yearProgressPercent}%</strong> of {metrics.year}
        </span>
        <span>
          <strong>{metrics.weeksRemaining}</strong> weeks remaining ({metrics.daysRemaining} days left)
        </span>
      </div>
    </div>
  );
};

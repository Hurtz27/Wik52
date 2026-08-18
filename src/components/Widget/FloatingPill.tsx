import React from 'react';
import { Maximize2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { invoke } from '@tauri-apps/api/core';
import { getWeekNumber } from '../../utils/weekCalculator';
import { startWindowDrag } from '../../utils/dragHelper';

interface FloatingPillProps {
  currentDate: Date;
  firstDayOfWeek: 1 | 0;
  use24Hour: boolean;
  onExpand: () => void;
}

export const FloatingPill: React.FC<FloatingPillProps> = ({
  currentDate,
  firstDayOfWeek,
  use24Hour,
  onExpand,
}) => {
  const weekNumber = getWeekNumber(currentDate, firstDayOfWeek);
  const timeStr = format(currentDate, use24Hour ? 'HH:mm' : 'hh:mm a');

  const handleExpand = async () => {
    onExpand();
    try {
      await invoke('set_window_mode', { mode: 'flyout' });
    } catch (e) {
      console.debug('Expand IPC:', e);
    }
  };

  return (
    <div
      className="floating-pill"
      data-tauri-drag-region
      onMouseDown={startWindowDrag}
      onDoubleClick={handleExpand}
      title="Click and drag to move anywhere • Double-click or click icon to expand"
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'grab' }}
        data-tauri-drag-region
        onMouseDown={startWindowDrag}
      >
        <GripVertical size={13} color="var(--text-muted)" style={{ opacity: 0.7 }} />
        <span
          style={{
            background: 'var(--accent-blue)',
            color: '#FFFFFF',
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2px',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        >
          W{weekNumber}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {timeStr}
        </span>
      </div>

      <button
        className="icon-button"
        style={{ width: '24px', height: '24px', marginLeft: '6px' }}
        title="Expand Full Calendar"
        onClick={(e) => {
          e.stopPropagation();
          handleExpand();
        }}
      >
        <Maximize2 size={13} color="var(--accent-cyan)" />
      </button>
    </div>
  );
};

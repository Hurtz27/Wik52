import React from 'react';
import { RotateCcw, Sliders, Clock, ChevronDown } from 'lucide-react';
import { TimezoneItem } from '../../types/calendar';

interface TimeScrubberProps {
  offsetMinutes: number;
  onOffsetChange: (offset: number) => void;
  baseTime: Date;
  scrubbedTime: Date;
  savedTimezones: TimezoneItem[];
  selectedBaseIana: string;
  onBaseIanaChange: (iana: string) => void;
  use24Hour?: boolean;
}

export const TimeScrubber: React.FC<TimeScrubberProps> = ({
  offsetMinutes,
  onOffsetChange,
  baseTime,
  scrubbedTime,
  savedTimezones,
  selectedBaseIana,
  onBaseIanaChange,
}) => {
  const isLive = offsetMinutes === 0;

  // Format current target time for input based on selectedBaseIana
  const baseFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: selectedBaseIana,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = baseFormatter.formatToParts(scrubbedTime);
  const hourVal = parts.find((p) => p.type === 'hour')?.value || '00';
  const minVal = parts.find((p) => p.type === 'minute')?.value || '00';
  const timeInputValue = `${hourVal}:${minVal}`;

  // Handle typing or picking time in the time input
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [targetH, targetM] = val.split(':').map(Number);
    if (isNaN(targetH) || isNaN(targetM)) return;

    const nowFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedBaseIana,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const nowParts = nowFormatter.formatToParts(baseTime);
    const nowH = parseInt(nowParts.find((p) => p.type === 'hour')?.value || '0', 10);
    const nowM = parseInt(nowParts.find((p) => p.type === 'minute')?.value || '0', 10);

    const nowTotalMins = nowH * 60 + nowM;
    const targetTotalMins = targetH * 60 + targetM;
    let diff = targetTotalMins - nowTotalMins;

    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;

    onOffsetChange(diff);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOffsetChange(parseInt(e.target.value, 10));
  };

  const handleQuickPreset = (hour: number) => {
    const nowFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedBaseIana,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const nowParts = nowFormatter.formatToParts(baseTime);
    const nowH = parseInt(nowParts.find((p) => p.type === 'hour')?.value || '0', 10);
    const nowM = parseInt(nowParts.find((p) => p.type === 'minute')?.value || '0', 10);

    const nowTotalMins = nowH * 60 + nowM;
    const targetTotalMins = hour * 60;
    let diff = targetTotalMins - nowTotalMins;
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    onOffsetChange(diff);
  };

  const handleReset = () => {
    onOffsetChange(0);
  };

  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const mins = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes > 0 ? '+' : '-';
  const offsetLabel = isLive
    ? 'Real-time'
    : `${sign}${hours}h ${mins > 0 ? `${mins}m` : ''} vs now`;

  return (
    <div className="scrubber-box" style={{ width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
          <Sliders size={14} color="var(--accent-cyan)" />
          <span>Global Meeting Planner</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: isLive ? '#10B981' : 'var(--accent-cyan)', fontWeight: 600 }}>
            {offsetLabel}
          </span>
          {!isLive && (
            <button
              onClick={handleReset}
              className="icon-button"
              style={{ width: '22px', height: '22px' }}
              title="Reset to real-time"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Type-a-Time & Base City Row - Responsive & constrained */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-subtle)',
          padding: '6px 8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        {/* Left: Time Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <Clock size={12} color="var(--accent-cyan)" />
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Set:</span>
          <input
            type="time"
            value={timeInputValue}
            onChange={handleTimeInput}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 4px',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              width: '94px',
            }}
            title="Type or pick a specific meeting time"
          />
        </div>

        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', flexShrink: 0 }}>in</span>

        {/* Right: Base Timezone Selector with clean overflow truncation */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={selectedBaseIana}
            onChange={(e) => onBaseIanaChange(e.target.value)}
            style={{
              width: '100%',
              minWidth: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 18px 3px 6px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
            title="Select the reference timezone you are planning from"
          >
            {savedTimezones.map((tz) => (
              <option key={tz.id} value={tz.iana} style={{ background: '#1A1F2C', color: '#FFF' }}>
                {tz.flag} {tz.name} ({tz.customLabel || tz.country})
              </option>
            ))}
          </select>
          <ChevronDown
            size={11}
            color="var(--text-muted)"
            style={{ position: 'absolute', right: '5px', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
        {[
          { label: '9:00 AM', h: 9 },
          { label: '11:00 AM', h: 11 },
          { label: '1:00 PM', h: 13 },
          { label: '3:00 PM', h: 15 },
          { label: '5:00 PM', h: 17 },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => handleQuickPreset(p.h)}
            style={{
              flex: 1,
              padding: '3px 2px',
              fontSize: '9.5px',
              fontWeight: 600,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <input
        type="range"
        min={-720}
        max={720}
        step={15}
        value={offsetMinutes}
        onChange={handleSliderChange}
        className="scrubber-slider"
        title="Drag to scrub hours backward or forward"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>-12h</span>
        <span>-6h</span>
        <span style={{ color: isLive ? 'var(--accent-cyan)' : 'inherit', fontWeight: isLive ? 700 : 400 }}>
          Now
        </span>
        <span>+6h</span>
        <span>+12h</span>
      </div>
    </div>
  );
};

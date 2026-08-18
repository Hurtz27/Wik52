import React, { useState } from 'react';
import { Plus, Trash2, Globe, GripVertical } from 'lucide-react';
import { TimezoneItem, AppSettings } from '../../types/calendar';
import { formatInTimezone } from '../../utils/timezoneData';
import { TimeScrubber } from './TimeScrubber';
import { AddTimezoneModal } from './AddTimezoneModal';

interface TimezoneSectionProps {
  currentDate: Date;
  settings: AppSettings;
  onUpdateTimezones: (newZones: TimezoneItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const TimezoneSection: React.FC<TimezoneSectionProps> = ({
  currentDate,
  settings,
  onUpdateTimezones,
  onShowToast,
}) => {
  const [scrubberMinutes, setScrubberMinutes] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedBaseIana, setSelectedBaseIana] = useState<string>(
    settings.savedTimezones[0]?.iana || 'America/Monterrey'
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const effectiveDate = new Date(currentDate.getTime() + scrubberMinutes * 60 * 1000);

  const handleAddTimezone = (item: TimezoneItem) => {
    onUpdateTimezones([...settings.savedTimezones, item]);
    onShowToast(`Time zone "${item.name}" added`);
  };

  const handleRemoveTimezone = (id: string, name: string) => {
    onUpdateTimezones(settings.savedTimezones.filter((z) => z.id !== id));
    onShowToast(`Time zone "${name}" removed`);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...settings.savedTimezones];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onUpdateTimezones(updated);
    onShowToast(`Moved "${movedItem.name}" to position ${targetIndex + 1}`);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const startH = settings.workingHoursStart ?? 8;
  const endH = settings.workingHoursEnd ?? 17;
  const workHoursLabel = `${startH % 12 || 12}${startH < 12 ? 'am' : 'pm'}-${endH % 12 || 12}${endH < 12 ? 'am' : 'pm'}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Fixed Time Scrubber (Meeting Planner) */}
      <TimeScrubber
        offsetMinutes={scrubberMinutes}
        onOffsetChange={setScrubberMinutes}
        baseTime={currentDate}
        scrubbedTime={effectiveDate}
        savedTimezones={settings.savedTimezones}
        selectedBaseIana={selectedBaseIana}
        onBaseIanaChange={setSelectedBaseIana}
        use24Hour={settings.use24HourFormat}
      />

      {/* Timezone Cards Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={14} color="var(--accent-cyan)" />
          <span>World Time Zones ({settings.savedTimezones.length})</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>• Drag to reorder</span>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="today-jump-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}
        >
          <Plus size={12} />
          <span>Add Time Zone</span>
        </button>
      </div>

      {/* Scrollable Timezones List (Uses full remaining vertical height) */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
        {settings.savedTimezones.map((tz, index) => {
          const tzData = formatInTimezone(effectiveDate, tz.iana, {
            use24Hour: settings.use24HourFormat,
            workingHoursStart: startH,
            workingHoursEnd: endH,
          });

          const isBeingDragged = draggedIndex === index;
          const isDragTarget = dragOverIndex === index;

          return (
            <div
              key={tz.id}
              className={`timezone-card ${isBeingDragged ? 'is-dragging' : ''} ${
                isDragTarget ? 'is-drag-target' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: isBeingDragged ? 0.4 : 1,
                border: isDragTarget ? '1.5px dashed var(--accent-cyan)' : undefined,
                transform: isDragTarget ? 'scale(1.01)' : undefined,
                transition: 'all 0.15s ease',
              }}
            >
              <div className="timezone-info">
                {/* Drag Handle */}
                <div
                  style={{
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-muted)',
                    opacity: 0.7,
                    padding: '2px 0',
                  }}
                  title="Drag and drop to reorder"
                >
                  <GripVertical size={14} />
                </div>

                <span className="timezone-flag">{tz.flag}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="timezone-name">{tz.name}</span>
                    {tz.customLabel && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          background: 'var(--week-badge-bg)',
                          color: 'var(--accent-cyan)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {tz.customLabel}
                      </span>
                    )}
                  </div>

                  <div className="timezone-sub">
                    <span>{tzData.offsetString}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span
                        className={`working-status-dot ${
                          tzData.isWorkingHours ? 'open' : 'closed'
                        }`}
                      />
                      {tzData.isWorkingHours ? `Work Hours (${workHoursLabel})` : 'Off Hours'}
                    </span>
                    {tzData.dayOffsetNotice && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                          {tzData.dayOffsetNotice}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="timezone-time-box">
                  <div className="timezone-clock">
                    {tzData.timeString}{' '}
                    {tzData.period && (
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>{tzData.period}</span>
                    )}
                  </div>
                  <div className="timezone-date">{tzData.dateString}</div>
                </div>

                {!tz.isPrimary && (
                  <button
                    className="icon-button"
                    style={{ width: '24px', height: '24px', opacity: 0.6 }}
                    title="Remove time zone"
                    onClick={() => handleRemoveTimezone(tz.id, tz.name)}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AddTimezoneModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTimezone}
        existingIds={settings.savedTimezones.map((z) => z.id)}
      />
    </div>
  );
};

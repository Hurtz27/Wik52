import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, FileText, Calendar, Clock, Check, CalendarRange, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DayItem } from '../../types/calendar';
import { formatDateKey } from '../../utils/holidayService';

interface AddDayItemModalProps {
  isOpen: boolean;
  targetType: 'day' | 'week';
  targetDate?: Date;
  targetWeek?: { weekNumber: number; year: number; label?: string };
  initialType: 'note' | 'reminder';
  initialItem?: DayItem | null;
  onClose: () => void;
  onSave: (item: Omit<DayItem, 'id' | 'createdAt'>, editId?: string) => void;
}

export const AddDayItemModal: React.FC<AddDayItemModalProps> = ({
  isOpen,
  targetType,
  targetDate,
  targetWeek,
  initialType,
  initialItem,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<'note' | 'reminder'>(initialItem?.type || initialType);
  const [title, setTitle] = useState(initialItem?.title || '');
  const [time, setTime] = useState(initialItem?.time || '09:00');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setType(initialItem.type);
        setTitle(initialItem.title);
        setTime(initialItem.time || '09:00');
      } else {
        setType(initialType);
        setTitle('');
        setTime('09:00');
      }
      setTimeout(() => inputRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialType, initialItem, onClose]);

  if (!isOpen) return null;

  const isEditing = !!initialItem;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (targetType === 'week' && targetWeek) {
      onSave(
        {
          targetType: 'week',
          weekNumber: targetWeek.weekNumber,
          year: targetWeek.year,
          title: title.trim(),
          type: 'note',
          completed: initialItem?.completed ?? false,
        },
        initialItem?.id
      );
    } else if (targetDate) {
      onSave(
        {
          targetType: 'day',
          date: formatDateKey(targetDate),
          title: title.trim(),
          type,
          time: type === 'reminder' ? time : undefined,
          completed: initialItem?.completed ?? false,
        },
        initialItem?.id
      );
    }

    onClose();
  };

  const formattedTargetStr =
    targetType === 'week' && targetWeek
      ? `Week ${targetWeek.weekNumber}, ${targetWeek.year} ${targetWeek.label ? `(${targetWeek.label})` : ''}`
      : targetDate
      ? format(targetDate, 'EEEE, MMMM d, yyyy', { locale: enUS })
      : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.68)',
        backdropFilter: 'blur(10px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '370px',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-flyout)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13.5px' }}>
            {isEditing ? (
              <Edit3 size={16} color="var(--accent-cyan)" />
            ) : targetType === 'week' ? (
              <CalendarRange size={16} color="var(--accent-cyan)" />
            ) : type === 'reminder' ? (
              <Bell size={16} color="#F59E0B" />
            ) : (
              <FileText size={16} color="var(--accent-cyan)" />
            )}
            <span>
              {isEditing
                ? targetType === 'week'
                  ? `Edit Week ${targetWeek?.weekNumber} Note`
                  : type === 'reminder'
                  ? 'Edit Reminder'
                  : 'Edit Note'
                : targetType === 'week'
                ? `Add Note for Week ${targetWeek?.weekNumber}`
                : type === 'reminder'
                ? 'New Reminder'
                : 'New Note'}
            </span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Target Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-subtle)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {targetType === 'week' ? (
            <CalendarRange size={13} color="var(--accent-cyan)" />
          ) : (
            <Calendar size={13} color="var(--accent-cyan)" />
          )}
          <span style={{ fontWeight: 600 }}>{formattedTargetStr}</span>
        </div>

        {/* Type Toggle (Day only) */}
        {targetType === 'day' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setType('note')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px',
                borderRadius: 'var(--radius-sm)',
                background: type === 'note' ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                border: type === 'note' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FileText size={13} color="var(--accent-cyan)" />
              <span>Note</span>
            </button>

            <button
              type="button"
              onClick={() => setType('reminder')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px',
                borderRadius: 'var(--radius-sm)',
                background: type === 'reminder' ? 'rgba(245, 158, 11, 0.22)' : 'var(--bg-card)',
                border: type === 'reminder' ? '1.5px solid #F59E0B' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bell size={13} color="#F59E0B" />
              <span>Reminder</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Title input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {targetType === 'week'
                ? 'Week Objectives / Memo:'
                : type === 'reminder'
                ? 'Reminder Details / Alert:'
                : 'Note Content:'}
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder={
                targetType === 'week'
                  ? 'e.g., Q3 Planning, Sprint Review, Plant Maintenance Shutdown...'
                  : type === 'reminder'
                  ? 'e.g., Executive review meeting, Submit quarterly report...'
                  : 'e.g., Working remotely, Project deadline...'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              required
            />
          </div>

          {/* Optional Time for Reminder */}
          {targetType === 'day' && type === 'reminder' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={13} color="#F59E0B" />
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time (Optional):</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                background: type === 'reminder' && targetType === 'day' ? '#F59E0B' : 'var(--accent-blue)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                opacity: title.trim() ? 1 : 0.5,
              }}
            >
              <Check size={13} />
              <span>{isEditing ? 'Save Changes' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
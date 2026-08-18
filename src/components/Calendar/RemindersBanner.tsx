import React from 'react';
import { Bell, Check, Trash2, Clock, Edit2 } from 'lucide-react';
import { DayItem } from '../../types/calendar';

interface RemindersBannerProps {
  reminders: DayItem[];
  selectedDateStr: string;
  onToggleComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onEditReminder?: (item: DayItem) => void;
  onSelectDateKey?: (dateKey: string) => void;
}

export const RemindersBanner: React.FC<RemindersBannerProps> = ({
  reminders,
  selectedDateStr,
  onToggleComplete,
  onDeleteReminder,
  onEditReminder,
}) => {
  if (reminders.length === 0) return null;

  return (
    <div
      className="reminders-banner"
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.45)',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
        animation: 'fadeInFlyout 0.2s ease',
      }}
    >
      {/* Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#FBBF24' }}>
          <Bell size={14} color="#FBBF24" />
          <span>Active Reminders ({reminders.length})</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {selectedDateStr}
        </span>
      </div>

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
        {reminders.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              {/* Checkbox button */}
              <button
                onClick={() => onToggleComplete(item.id)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: item.completed ? '1.5px solid #10B981' : '1.5px solid rgba(255, 255, 255, 0.4)',
                  background: item.completed ? '#10B981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title={item.completed ? 'Mark as incomplete' : 'Mark as completed'}
              >
                {item.completed && <Check size={11} color="#FFFFFF" />}
              </button>

              {/* Reminder Title & Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                {item.time && (
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(245, 158, 11, 0.25)',
                      color: '#FBBF24',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={10} />
                    <span>{item.time}</span>
                  </span>
                )}
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.title}
                >
                  {item.title}
                </span>
              </div>
            </div>

            {/* Action buttons (Edit & Delete) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {onEditReminder && (
                <button
                  className="icon-button"
                  style={{ width: '20px', height: '20px', opacity: 0.75 }}
                  onClick={() => onEditReminder(item)}
                  title="Edit reminder"
                >
                  <Edit2 size={11} color="var(--accent-cyan)" />
                </button>
              )}

              <button
                className="icon-button"
                style={{ width: '20px', height: '20px', opacity: 0.7 }}
                onClick={() => onDeleteReminder(item.id)}
                title="Delete reminder"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

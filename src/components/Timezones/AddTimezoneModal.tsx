import React, { useState, useEffect } from 'react';
import { X, Search, Globe } from 'lucide-react';
import { POPULAR_TIMEZONES } from '../../utils/timezoneData';
import { TimezoneItem } from '../../types/calendar';

interface AddTimezoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: TimezoneItem) => void;
  existingIds: string[];
}

export const AddTimezoneModal: React.FC<AddTimezoneModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<typeof POPULAR_TIMEZONES[0] | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = POPULAR_TIMEZONES.filter((tz) => {
    const term = searchTerm.toLowerCase();
    return (
      tz.name.toLowerCase().includes(term) ||
      tz.country.toLowerCase().includes(term) ||
      tz.iana.toLowerCase().includes(term)
    );
  });

  const handleConfirmAdd = () => {
    if (!selectedPreset) return;
    const newItem: TimezoneItem = {
      id: `tz-${Date.now()}`,
      name: selectedPreset.name,
      iana: selectedPreset.iana,
      country: selectedPreset.country,
      flag: selectedPreset.flag,
      customLabel: customLabel.trim() || undefined,
    };
    onAdd(newItem);
    onClose();
    setSelectedPreset(null);
    setCustomLabel('');
    setSearchTerm('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
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
          maxWidth: '380px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px' }}>
            <Globe size={16} color="#60CDFF" />
            <span>Add Time Zone</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Search Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 10px',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search city or country (e.g. Tokyo, London)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
            autoFocus
          />
        </div>

        {/* List of Timezones */}
        <div
          style={{
            maxHeight: '190px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {filtered.map((tz, idx) => {
            const isSelected = selectedPreset?.iana === tz.iana;
            return (
              <div
                key={`${tz.iana}-${idx}`}
                onClick={() => setSelectedPreset(tz)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{tz.flag}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{tz.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tz.country}</div>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {tz.iana.split('/')[1]?.replace(/_/g, ' ') || tz.iana}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Custom Label */}
        {selectedPreset && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Custom label (optional):
            </label>
            <input
              type="text"
              placeholder="e.g. HQ London, Main Client, Dev Team..."
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            disabled={!selectedPreset}
            onClick={handleConfirmAdd}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: selectedPreset ? 'var(--accent-blue)' : 'var(--bg-card)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: selectedPreset ? 'pointer' : 'not-allowed',
              opacity: selectedPreset ? 1 : 0.5,
              boxShadow: selectedPreset ? '0 0 10px rgba(0,120,212,0.5)' : 'none',
            }}
          >
            Add Zone
          </button>
        </div>
      </div>
    </div>
  );
};
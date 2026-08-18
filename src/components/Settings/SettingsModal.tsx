import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  X,
  Sliders,
  RotateCcw,
  Palette,
  Check,
  Flag,
  Bookmark,
  Clock,
  FolderOpen,
  HardDrive,
  Calendar,
} from 'lucide-react';
import { AppSettings, AccentColor, HolidayType } from '../../types/calendar';
import { DEFAULT_INITIAL_TIMEZONES } from '../../utils/timezoneData';
import { syncTrayWeekIcon, TrayIconStyle } from '../../utils/trayIconGenerator';
import { getWeekNumber } from '../../utils/weekCalculator';
import { COUNTRY_HOLIDAYS_CONFIG, HOLIDAY_TYPE_CONFIG } from '../../utils/holidayService';
import { openConfigFolder } from '../../utils/configService';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onShowToast: (msg: string) => void;
}

const COLOR_OPTIONS: { id: AccentColor; name: string; hex: string }[] = [
  { id: 'blue', name: 'Fluent Blue', hex: '#0078D4' },
  { id: 'green', name: 'Emerald Green', hex: '#107C41' },
  { id: 'orange', name: 'Sunset Orange', hex: '#D83B01' },
  { id: 'red', name: 'Crimson Red', hex: '#E81123' },
  { id: 'purple', name: 'Royal Purple', hex: '#8764B8' },
  { id: 'teal', name: 'Seafoam Teal', hex: '#008272' },
  { id: 'rose', name: 'Rose Pink', hex: '#E3008C' },
  { id: 'slate', name: 'Slate Steel', hex: '#475569' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'general'>('general');
  const [trayStyle, setTrayStyle] = useState<TrayIconStyle>(settings.trayIconStyle || 'badge');

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

  const handleToggleFirstDay = (val: 1 | 0) => {
    onUpdateSettings({ firstDayOfWeek: val });
    const currentWeek = getWeekNumber(new Date(), val);
    syncTrayWeekIcon(currentWeek, trayStyle, settings.accentColor);
    onShowToast(`Week standard set to: ${val === 1 ? 'Monday (ISO 8601)' : 'Sunday'}`);
  };

  const handleToggle24H = (val: boolean) => {
    onUpdateSettings({ use24HourFormat: val });
    onShowToast(`Clock format: ${val ? '24 Hours' : '12 Hours (AM/PM)'}`);
  };

  const handleToggleHolidayCountry = (code: 'US' | 'MX' | 'CA' | 'IT') => {
    const current = settings.enabledHolidays || ['US', 'MX', 'CA', 'IT'];
    const exists = current.includes(code);
    const updated = exists ? current.filter((c) => c !== code) : [...current, code];
    onUpdateSettings({ enabledHolidays: updated });
    onShowToast(`Holidays for ${code} ${exists ? 'disabled' : 'enabled'}`);
  };

  const handleToggleHolidayType = (type: HolidayType) => {
    const current = settings.enabledHolidayTypes || ['public', 'optional'];
    const exists = current.includes(type);
    if (exists && current.length === 1) {
      onShowToast('At least one holiday category must be active');
      return;
    }
    const updated = exists ? current.filter((t) => t !== type) : [...current, type];
    onUpdateSettings({ enabledHolidayTypes: updated });
    onShowToast(`${type.charAt(0).toUpperCase() + type.slice(1)} category ${exists ? 'hidden' : 'enabled'}`);
  };

  const handleChangeAccentColor = (color: AccentColor, name: string) => {
    onUpdateSettings({ accentColor: color });
    const currentWeek = getWeekNumber(new Date(), settings.firstDayOfWeek);
    syncTrayWeekIcon(currentWeek, trayStyle, color);
    onShowToast(`Theme accent changed to ${name}`);
  };

  const handleChangeTrayStyle = (style: TrayIconStyle) => {
    setTrayStyle(style);
    onUpdateSettings({ trayIconStyle: style });
    const currentWeek = getWeekNumber(new Date(), settings.firstDayOfWeek);
    syncTrayWeekIcon(currentWeek, style, settings.accentColor);
    onShowToast(`Tray icon style set to ${style}`);
  };

  const handleToggleLaunchOnStartup = async () => {
    const nextVal = !(settings.launchOnStartup ?? true);
    onUpdateSettings({ launchOnStartup: nextVal });
    try {
      await invoke('set_launch_at_startup', { enable: nextVal });
      onShowToast(`Launch at Windows startup ${nextVal ? 'enabled' : 'disabled'}`);
    } catch {
      onShowToast('Could not update startup settings');
    }
  };

  const handleOpenTaskbarSettings = async () => {
    try {
      await invoke('open_taskbar_settings');
      onShowToast('Opening Windows Taskbar Settings...');
    } catch {
      onShowToast('Could not open Taskbar Settings');
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openConfigFolder();
      onShowToast('Opened persistent config folder in Explorer');
    } catch {
      onShowToast('Could not open folder');
    }
  };

  const handleResetDefaults = () => {
    onUpdateSettings({
      theme: 'dark',
      accentColor: 'blue',
      firstDayOfWeek: 1,
      use24HourFormat: false,
      pinnedOnTop: true,
      launchOnStartup: true,
      workingHoursStart: 8,
      workingHoursEnd: 17,
      windowMode: 'flyout',
      trayIconStyle: 'badge',
      savedTimezones: DEFAULT_INITIAL_TIMEZONES,
      enabledHolidays: ['US', 'MX', 'CA', 'IT'],
      enabledHolidayTypes: ['public', 'optional'],
    });
    onShowToast('Settings reset to defaults');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.68)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '420px',
          height: '575px', // Exact consistent height across all tabs
          background: 'var(--bg-app)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-flyout)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          color: 'var(--text-primary)',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px' }}>
            <Sliders size={16} color="var(--accent-cyan)" />
            <span>Wik52 Settings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                background: 'var(--week-badge-bg)',
                color: 'var(--accent-cyan)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                border: '1px solid var(--border-subtle)',
              }}
            >
              v0.1.3
            </span>
            <button className="icon-button" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 2-Tab Navigation Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab('general')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              background: activeTab === 'general' ? 'var(--week-badge-bg)' : 'transparent',
              border: activeTab === 'general' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              color: activeTab === 'general' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sliders size={13} color={activeTab === 'general' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            <span>General Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              background: activeTab === 'calendar' ? 'var(--week-badge-bg)' : 'transparent',
              border: activeTab === 'calendar' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              color: activeTab === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={13} color={activeTab === 'calendar' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            <span>Calendar Settings</span>
          </button>
        </div>

        {/* Scrollable Tab Content Container with Fixed Boundary */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {/* 1. Persistent Config File & Data Folder Backup */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: 'var(--bg-subtle)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <HardDrive size={13} color="var(--accent-cyan)" />
                    <span>Persistent Config File (Update-Safe)</span>
                  </div>
                  <span style={{ fontSize: '9.5px', color: '#10B981', fontWeight: 700 }}>🟢 Auto-Saved</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  All settings, notes, reminders, and time zones are stored in <code style={{ color: 'var(--accent-cyan)' }}>wik52_config.json</code> in your Windows user profile. It is 100% preserved during updates.
                </div>
                <button
                  onClick={handleOpenFolder}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  <FolderOpen size={12} color="var(--accent-cyan)" />
                  <span>Open Data Folder in Explorer (Backup)</span>
                </button>
              </div>

              {/* 2. Windows Startup Auto-Launch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Windows System Startup
                </label>
                <button
                  onClick={handleToggleLaunchOnStartup}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: (settings.launchOnStartup ?? true) ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                    border: (settings.launchOnStartup ?? true) ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>🚀 Start Wik52 automatically when Windows turns on</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: (settings.launchOnStartup ?? true) ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    }}
                  >
                    {(settings.launchOnStartup ?? true) ? 'ENABLED' : 'DISABLED'}
                  </span>
                </button>
              </div>

              {/* 3. Taskbar Tray Icon Style & Taskbar Visibility */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Taskbar Tray Icon Style (Week)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {(['badge', 'calendar', 'minimal'] as TrayIconStyle[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleChangeTrayStyle(st)}
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        background: trayStyle === st ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                        border: trayStyle === st ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st === 'badge' ? 'Accent Badge' : st === 'calendar' ? 'Calendar Flip' : 'Minimal'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleOpenTaskbarSettings}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '2px',
                  }}
                >
                  <span>⚙️ Always show Wik52 icon on Windows Taskbar</span>
                </button>
              </div>

              {/* 4. UI Theme Accent Color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Palette size={14} color="var(--accent-cyan)" />
                  <span>Theme Accent Color</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = (settings.accentColor || 'blue') === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleChangeAccentColor(c.id, c.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                          border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: c.hex,
                              display: 'inline-block',
                            }}
                          />
                          <span>{c.name.split(' ')[0]}</span>
                        </div>
                        {isSelected && <Check size={11} color="var(--accent-cyan)" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Reset to Defaults */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={handleResetDefaults}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Reset to Factory Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR SETTINGS */}
          {activeTab === 'calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {/* 1. First Day of Week */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  First Day of Week & Numbering Standard
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleFirstDay(1)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: settings.firstDayOfWeek === 1 ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                      border: settings.firstDayOfWeek === 1 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Monday (ISO 8601 Standard)
                  </button>
                  <button
                    onClick={() => handleToggleFirstDay(0)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: settings.firstDayOfWeek === 0 ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                      border: settings.firstDayOfWeek === 0 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sunday (US / Americas)
                  </button>
                </div>
              </div>

              {/* 2. Clock Format */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Clock Time Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => handleToggle24H(false)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: !settings.use24HourFormat ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                      border: !settings.use24HourFormat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    12 Hours (AM / PM)
                  </button>
                  <button
                    onClick={() => handleToggle24H(true)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: settings.use24HourFormat ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                      border: settings.use24HourFormat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    24 Hours (Military)
                  </button>
                </div>
              </div>

              {/* 3. Working Hours Schedule */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Clock size={13} color="var(--accent-cyan)" />
                  <span>Working Hours Schedule (Active Hours)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { label: '8:00 AM – 5:00 PM', start: 8, end: 17 },
                    { label: '9:00 AM – 6:00 PM', start: 9, end: 18 },
                    { label: '7:00 AM – 4:00 PM', start: 7, end: 16 },
                    { label: '8:00 AM – 4:00 PM', start: 8, end: 16 },
                  ].map((p) => {
                    const isSelected =
                      (settings.workingHoursStart ?? 8) === p.start &&
                      (settings.workingHoursEnd ?? 17) === p.end;
                    return (
                      <button
                        key={p.label}
                        onClick={() => {
                          onUpdateSettings({ workingHoursStart: p.start, workingHoursEnd: p.end });
                          onShowToast(`Working hours set to ${p.label}`);
                        }}
                        style={{
                          padding: '7px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                          border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{p.label}</span>
                        {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Statutory Public Holidays by Country */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Flag size={13} color="var(--accent-cyan)" />
                  <span>Countries for Public Holidays</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {COUNTRY_HOLIDAYS_CONFIG.map((c) => {
                    const isEnabled = (settings.enabledHolidays || ['US', 'MX', 'CA', 'IT']).includes(c.code);
                    return (
                      <button
                        key={c.code}
                        onClick={() => handleToggleHolidayCountry(c.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: isEnabled ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                          border: isEnabled ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>{c.flag}</span>
                          <span>{c.name}</span>
                        </div>
                        {isEnabled && <Check size={12} color="var(--accent-cyan)" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Holiday Categories / Types Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Bookmark size={13} color="var(--accent-cyan)" />
                  <span>Holiday Types & Observances to Show</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {HOLIDAY_TYPE_CONFIG.map((ht) => {
                    const isEnabled = (settings.enabledHolidayTypes || ['public', 'optional']).includes(ht.type);
                    return (
                      <button
                        key={ht.type}
                        onClick={() => handleToggleHolidayType(ht.type)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: isEnabled ? 'var(--week-badge-bg)' : 'var(--bg-card)',
                          border: isEnabled ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>{ht.icon}</span>
                            <span>{ht.label}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            {ht.description}
                          </div>
                        </div>
                        {isEnabled && <Check size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginLeft: '8px' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
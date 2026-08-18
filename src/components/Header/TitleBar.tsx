import React from 'react';
import { Calendar, Settings, Pin, X, Minus, Smartphone, Minimize2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { AppSettings } from '../../types/calendar';
import { startWindowDrag } from '../../utils/dragHelper';

interface TitleBarProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
}) => {
  const handleMinimize = async () => {
    try {
      await invoke('hide_window');
    } catch {
      console.log('Hide window');
    }
  };

  const handleClose = async () => {
    try {
      await invoke('hide_window');
    } catch {
      console.log('Close to tray');
    }
  };

  const handleTogglePin = async () => {
    const nextPin = !settings.pinnedOnTop;
    onUpdateSettings({ pinnedOnTop: nextPin });
    try {
      await invoke('set_always_on_top', { alwaysOnTop: nextPin });
    } catch (e) {
      console.debug('Failed to set always on top:', e);
    }
  };

  const handleSetMode = async (mode: 'flyout' | 'widget' | 'compact') => {
    onUpdateSettings({ windowMode: mode });
    try {
      await invoke('set_window_mode', { mode });
    } catch (e) {
      console.debug('Mode switch IPC:', e);
    }
  };

  return (
    <div className="titlebar" data-tauri-drag-region onMouseDown={startWindowDrag}>
      <div className="titlebar-drag" data-tauri-drag-region onMouseDown={startWindowDrag}>
        <Calendar size={14} color="var(--accent-cyan)" />
        <span style={{ fontWeight: 800, letterSpacing: '-0.3px', fontSize: '13.5px' }}>Wik52</span>
      </div>

      <div className="titlebar-actions">
        {/* Compact View Switcher */}
        <button
          className={`icon-button ${settings.windowMode === 'compact' ? 'active' : ''}`}
          title="Compact View (Calendar & Week Number)"
          onClick={() => handleSetMode('compact')}
        >
          <Minimize2 size={13} />
        </button>

        {/* Floating Desktop Widget Switcher */}
        <button
          className={`icon-button ${settings.windowMode === 'widget' ? 'active' : ''}`}
          title="Floating Desktop Pill Widget"
          onClick={() => handleSetMode('widget')}
        >
          <Smartphone size={13} />
        </button>

        {/* Pin toggle */}
        <button
          className={`icon-button ${settings.pinnedOnTop ? 'active' : ''}`}
          title={settings.pinnedOnTop ? 'Unpin from Top' : 'Always on Top'}
          onClick={handleTogglePin}
        >
          <Pin size={13} />
        </button>

        {/* Settings */}
        <button className="icon-button" title="Settings" onClick={onOpenSettings}>
          <Settings size={13} />
        </button>

        {/* Minimize */}
        <button className="icon-button" title="Minimize to Tray" onClick={handleMinimize}>
          <Minus size={13} />
        </button>

        {/* Close (Hide to Tray) */}
        <button className="icon-button close" title="Hide to Tray" onClick={handleClose}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

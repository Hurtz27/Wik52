import { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Globe,
  CalendarRange,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { invoke } from '@tauri-apps/api/core';
import { TitleBar } from './components/Header/TitleBar';
import { WeekHeroBanner } from './components/Header/WeekHeroBanner';
import { MonthView } from './components/Calendar/MonthView';
import { YearWeeksView } from './components/Calendar/YearWeeksView';
import { TimezoneSection } from './components/Timezones/TimezoneSection';
import { FloatingPill } from './components/Widget/FloatingPill';
import { CompactCalendarView } from './components/Calendar/CompactCalendarView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { RemindersBanner } from './components/Calendar/RemindersBanner';
import { AddDayItemModal } from './components/Calendar/AddDayItemModal';
import { Toast } from './components/UI/Toast';
import { AppSettings, CalendarViewMode, TimezoneItem, DayItem } from './types/calendar';
import { getWeekNumber } from './utils/weekCalculator';
import { syncTrayWeekIcon } from './utils/trayIconGenerator';
import { useLiveClock } from './hooks/useLiveClock';
import { Holiday, getHolidaysForYear, formatDateKey } from './utils/holidayService';
import { DEFAULT_SETTINGS, loadWik52Config, saveWik52Config } from './utils/configService';

export function App() {
  const now = useLiveClock();
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<CalendarViewMode>('month');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Persistent Settings and Notes/Reminders
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dayItems, setDayItems] = useState<DayItem[]>([]);

  // Modal State for adding/editing notes & reminders
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DayItem | null>(null);
  const [addModalTargetType, setAddModalTargetType] = useState<'day' | 'week'>('day');
  const [addDayItemDate, setAddDayItemDate] = useState<Date>(new Date());
  const [addDayItemWeek, setAddDayItemWeek] = useState<{ weekNumber: number; year: number; label?: string } | undefined>();
  const [addDayItemType, setAddDayItemType] = useState<'note' | 'reminder'>('note');

  const toastTimerRef = useRef<number | null>(null);
  const notifiedRemindersRef = useRef<Set<string>>(new Set());

  // Load persistent configuration from disk file on startup
  useEffect(() => {
    loadWik52Config().then(({ settings: loadedSettings, dayItems: loadedItems }) => {
      setSettings(loadedSettings);
      setDayItems(loadedItems);
    });
  }, []);

  // Save settings directly to persistent disk file
  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveWik52Config(updated, dayItems);
      return updated;
    });
  };

  // Save notes & reminders directly to persistent disk file
  const saveDayItems = (updated: DayItem[]) => {
    setDayItems(updated);
    saveWik52Config(settings, updated);
  };

  const handleSaveDayItem = (itemData: Omit<DayItem, 'id' | 'createdAt'>, editId?: string) => {
    if (editId) {
      const updated = dayItems.map((item) =>
        item.id === editId ? { ...item, ...itemData } : item
      );
      saveDayItems(updated);
      showToast(
        itemData.targetType === 'week'
          ? `Week ${itemData.weekNumber} note updated`
          : `${itemData.type === 'reminder' ? 'Reminder' : 'Note'} updated`
      );
    } else {
      const newItem: DayItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      saveDayItems([...dayItems, newItem]);
      showToast(
        newItem.targetType === 'week'
          ? `Note added to Week ${newItem.weekNumber}`
          : `${newItem.type === 'reminder' ? 'Reminder' : 'Note'} added`
      );
    }
    setEditingItem(null);
  };

  const handleDeleteDayItem = (id: string) => {
    const found = dayItems.find((i) => i.id === id);
    saveDayItems(dayItems.filter((i) => i.id !== id));
    showToast(
      found?.targetType === 'week'
        ? 'Week note deleted'
        : `${found?.type === 'reminder' ? 'Reminder' : 'Note'} deleted`
    );
  };

  const handleEditDayItem = (item: DayItem) => {
    setEditingItem(item);
    if (item.targetType === 'week' && item.weekNumber && item.year) {
      setAddModalTargetType('week');
      setAddDayItemWeek({ weekNumber: item.weekNumber, year: item.year });
      setAddDayItemType('note');
    } else if (item.date) {
      setAddModalTargetType('day');
      const [y, m, d] = item.date.split('-').map(Number);
      setAddDayItemDate(new Date(y, m - 1, d));
      setAddDayItemType(item.type);
    }
    setIsAddModalOpen(true);
  };

  const handleToggleCompleteReminder = (id: string) => {
    saveDayItems(
      dayItems.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const handleOpenAddDayModal = (date: Date, type: 'note' | 'reminder') => {
    setEditingItem(null);
    setAddModalTargetType('day');
    setAddDayItemDate(date);
    setAddDayItemType(type);
    setIsAddModalOpen(true);
  };

  const handleOpenAddWeekModal = (weekNumber: number, year: number, label?: string) => {
    setEditingItem(null);
    setAddModalTargetType('week');
    setAddDayItemWeek({ weekNumber, year, label });
    setAddDayItemType('note');
    setIsAddModalOpen(true);
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Sync System Tray Icon with current week number, style, and chosen accent color
  const currentWeek = getWeekNumber(now, settings.firstDayOfWeek);
  useEffect(() => {
    syncTrayWeekIcon(
      currentWeek,
      settings.trayIconStyle || 'badge',
      settings.accentColor || 'blue',
      `Week ${currentWeek} • ${now.getFullYear()}`
    );
  }, [currentWeek, settings.firstDayOfWeek, settings.accentColor, settings.trayIconStyle]);

  // Sync native window always_on_top state with settings
  useEffect(() => {
    if (settings.pinnedOnTop !== undefined) {
      invoke('set_always_on_top', { alwaysOnTop: settings.pinnedOnTop }).catch(() => {});
    }
  }, [settings.pinnedOnTop]);

  // Load holidays for the view year, enabled countries, and enabled categories
  useEffect(() => {
    const year = viewDate.getFullYear();
    getHolidaysForYear(
      year,
      settings.enabledHolidays || ['US', 'MX', 'CA', 'IT'],
      settings.enabledHolidayTypes || ['public', 'optional']
    ).then((res) => {
      setHolidays(res);
    });
  }, [viewDate, settings.enabledHolidays, settings.enabledHolidayTypes]);

  // Live Reminder Trigger Check: Alerts the user when a scheduled reminder time arrives
  useEffect(() => {
    const todayKey = formatDateKey(now);
    const currentH = now.getHours().toString().padStart(2, '0');
    const currentM = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentH}:${currentM}`;

    dayItems.forEach((item) => {
      if (
        item.targetType === 'day' &&
        item.type === 'reminder' &&
        !item.completed &&
        item.date === todayKey &&
        item.time === currentTimeStr &&
        !notifiedRemindersRef.current.has(`${item.id}-${currentTimeStr}`)
      ) {
        notifiedRemindersRef.current.add(`${item.id}-${currentTimeStr}`);
        showToast(`⏰ REMINDER: ${item.title}`);
      }
    });
  }, [now, dayItems]);

  // Filter reminders: Only visible when clicking on the day with reminders active
  const selectedDateKey = formatDateKey(selectedDate);
  const activeReminders = dayItems.filter(
    (i) => i.targetType === 'day' && i.type === 'reminder' && i.date === selectedDateKey
  );

  // 1. Floating Desktop Widget Mode
  if (settings.windowMode === 'widget') {
    return (
      <div
        className={`accent-${settings.accentColor || 'blue'}`}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
      >
        <FloatingPill
          currentDate={now}
          firstDayOfWeek={settings.firstDayOfWeek}
          use24Hour={settings.use24HourFormat}
          onExpand={() => {
            handleUpdateSettings({ windowMode: 'flyout' });
            invoke('set_window_mode', { mode: 'flyout' });
          }}
        />
      </div>
    );
  }

  // 2. Compact View Mode (Only Month Calendar & Week Numbers)
  if (settings.windowMode === 'compact') {
    return (
      <>
        <CompactCalendarView
          currentDate={now}
          viewDate={viewDate}
          selectedDate={selectedDate}
          settings={settings}
          holidays={holidays}
          dayItems={dayItems}
          onViewDateChange={setViewDate}
          onSelectDate={setSelectedDate}
          onSwitchMode={(mode) => {
            handleUpdateSettings({ windowMode: mode });
            invoke('set_window_mode', { mode });
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAddDayModal={handleOpenAddDayModal}
          onOpenAddWeekModal={handleOpenAddWeekModal}
          onUpdateSettings={handleUpdateSettings}
          onShowToast={showToast}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateSettings={handleUpdateSettings}
          onShowToast={showToast}
        />

        <AddDayItemModal
          isOpen={isAddModalOpen}
          targetType={addModalTargetType}
          targetDate={addDayItemDate}
          targetWeek={addDayItemWeek}
          initialType={addDayItemType}
          initialItem={editingItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveDayItem}
        />

        <Toast message={toastMessage} />
      </>
    );
  }

  const accentClass = `accent-${settings.accentColor || 'blue'}`;

  // 3. Full Flyout Mode
  return (
    <div
      className={`flyout-container ${accentClass} ${
        settings.theme === 'light' ? 'light-theme' : ''
      }`}
    >
      {/* 1. Windows 11 TitleBar (Fixed at Top) */}
      <TitleBar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Fixed Header Section: Week Hero Banner + Tab Navigation (NEVER MOVES OR SCROLLS) */}
      <div className="flyout-fixed-header">
        <WeekHeroBanner
          currentDate={now}
          firstDayOfWeek={settings.firstDayOfWeek}
          onShowToast={showToast}
        />

        <div className="view-tabs">
          <button
            className={`view-tab-btn ${activeTab === 'month' ? 'active' : ''}`}
            onClick={() => setActiveTab('month')}
          >
            <CalendarIcon size={13} />
            <span>Month (Weeks)</span>
          </button>

          <button
            className={`view-tab-btn ${activeTab === 'year-weeks' ? 'active' : ''}`}
            onClick={() => setActiveTab('year-weeks')}
          >
            <CalendarRange size={13} />
            <span>52-Week Year</span>
          </button>

          <button
            className={`view-tab-btn ${activeTab === 'timezone-planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('timezone-planner')}
          >
            <Globe size={13} />
            <span>Time Zones</span>
          </button>
        </div>
      </div>

      {/* 3. Full-Height Tab Body Area (Fills 100% remaining vertical space) */}
      <div className="flyout-tab-body">
        {activeTab === 'month' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* If reminders exist, show banner ABOVE calendar */}
            <RemindersBanner
              reminders={activeReminders}
              selectedDateStr={format(selectedDate, 'MMMM d, yyyy', { locale: enUS })}
              onToggleComplete={handleToggleCompleteReminder}
              onDeleteReminder={handleDeleteDayItem}
              onEditReminder={handleEditDayItem}
            />

            {/* Calendar Grid */}
            <MonthView
              viewDate={viewDate}
              selectedDate={selectedDate}
              firstDayOfWeek={settings.firstDayOfWeek}
              holidays={holidays}
              dayItems={dayItems}
              onViewDateChange={setViewDate}
              onSelectDate={setSelectedDate}
              onOpenAddDayModal={handleOpenAddDayModal}
              onOpenAddWeekModal={handleOpenAddWeekModal}
              onEditDayItem={handleEditDayItem}
              onDeleteDayItem={handleDeleteDayItem}
              onShowToast={showToast}
            />
          </div>
        )}

        {activeTab === 'year-weeks' && (
          <YearWeeksView
            currentDate={now}
            firstDayOfWeek={settings.firstDayOfWeek}
            dayItems={dayItems}
            onSelectWeek={(date) => {
              setViewDate(date);
              setSelectedDate(date);
              setActiveTab('month');
            }}
            onOpenAddWeekModal={handleOpenAddWeekModal}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'timezone-planner' && (
          <TimezoneSection
            currentDate={now}
            settings={settings}
            onUpdateTimezones={(zones: TimezoneItem[]) =>
              handleUpdateSettings({ savedTimezones: zones })
            }
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onShowToast={showToast}
      />

      {/* Add / Edit Note / Reminder Modal (Day or Week) */}
      <AddDayItemModal
        isOpen={isAddModalOpen}
        targetType={addModalTargetType}
        targetDate={addDayItemDate}
        targetWeek={addDayItemWeek}
        initialType={addDayItemType}
        initialItem={editingItem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveDayItem}
      />

      {/* Feedback Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;

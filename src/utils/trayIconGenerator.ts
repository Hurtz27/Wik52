import { invoke } from '@tauri-apps/api/core';
import { AccentColor } from '../types/calendar';

export type TrayIconStyle = 'badge' | 'calendar' | 'minimal';

const ACCENT_COLOR_MAP: Record<AccentColor, [string, string]> = {
  blue: ['#0078D4', '#005A9E'],
  green: ['#107C41', '#059669'],
  orange: ['#D83B01', '#EA580C'],
  red: ['#E81123', '#DC2626'],
  purple: ['#8764B8', '#7C3AED'],
  teal: ['#008272', '#0D9488'],
  rose: ['#E3008C', '#E11D48'],
  slate: ['#475569', '#334155'],
};

/**
 * Renders a crisp dynamic week number icon to base64 PNG data URL with chosen accent color
 * Optimized for high legibility at 16px/32px tray sizes with a large bold week number.
 */
export function generateWeekNumberIconBase64(
  weekNumber: number,
  style: TrayIconStyle = 'badge',
  accentColor: AccentColor = 'blue',
  size: number = 64
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const radius = size * 0.20;
  const textStr = `${weekNumber}`;
  const [accentStart, accentEnd] = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.blue;

  if (style === 'badge') {
    // 1. Fluent Accent Badge (Huge centered week number)
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, accentStart);
    gradient.addColorStop(1, accentEnd);

    ctx.beginPath();
    ctx.roundRect(2, 2, size - 4, size - 4, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Inner highlight border
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.stroke();

    // Massive week number in center (72% of canvas height)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${Math.round(size * 0.72)}px "Segoe UI", "Arial Black", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, size / 2, size / 2 + size * 0.03);

  } else if (style === 'calendar') {
    // 2. Calendar Flip Style (White card with thin accent header, huge dark number)
    ctx.beginPath();
    ctx.roundRect(2, 2, size - 4, size - 4, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = '#94A3B8';
    ctx.stroke();

    // Slim accent header bar
    ctx.beginPath();
    ctx.roundRect(2, 2, size - 4, size * 0.16, [radius, radius, 0, 0]);
    ctx.fillStyle = accentStart;
    ctx.fill();

    // Massive week number in center
    ctx.fillStyle = '#0F172A';
    ctx.font = `900 ${Math.round(size * 0.65)}px "Segoe UI", "Arial Black", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, size / 2, size * 0.58);

  } else {
    // 3. Minimalist Style (Crisp circular badge with huge white text)
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fill();
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // Massive bold text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${Math.round(size * 0.72)}px "Segoe UI", "Arial Black", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, size / 2, size / 2 + size * 0.02);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Updates the native Windows tray icon with the week number in English.
 */
export async function syncTrayWeekIcon(
  weekNumber: number,
  style: TrayIconStyle = 'badge',
  accentColor: AccentColor = 'blue',
  tooltipText?: string
): Promise<void> {
  try {
    const base64Data = generateWeekNumberIconBase64(weekNumber, style, accentColor, 64);
    if (!base64Data) return;

    await invoke('update_tray_icon', {
      iconBase64: base64Data,
      tooltip: tooltipText || `Week ${weekNumber} • Wik52`,
    });
  } catch (err) {
    console.debug('Tauri tray update not available in browser mode:', err);
  }
}

import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

/**
 * Initiates native OS window dragging when clicking and dragging any titlebar/header region.
 * Automatically ignores clicks on buttons, icons, inputs, and interactive elements.
 */
export async function startWindowDrag(e: React.MouseEvent): Promise<void> {
  // Only primary mouse button (left-click)
  if (e.button !== 0) return;

  const target = e.target as HTMLElement | null;
  if (target && target.closest('button, input, select, textarea, [role="button"], a')) {
    return;
  }

  try {
    const appWindow = getCurrentWindow();
    await appWindow.startDragging();
  } catch {
    try {
      await invoke('start_drag');
    } catch (err) {
      console.debug('Window drag error:', err);
    }
  }
}

import { useState, useEffect } from 'react';

export function useLiveClock() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // Initial sync to next second boundary
    const update = () => setNow(new Date());
    const initialDelay = 1000 - new Date().getMilliseconds();

    let intervalId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      update();
      intervalId = window.setInterval(update, 1000);
    }, initialDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  return now;
}

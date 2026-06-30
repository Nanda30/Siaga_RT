import { useEffect, useState } from 'react';

/**
 * Provides a live-updating Date, refreshed every second.
 */
export const useClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
};

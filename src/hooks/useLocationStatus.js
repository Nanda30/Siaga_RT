import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getLocationStatus } from '../services/location';

/**
 * Polls GPS/permission status and re-checks when the app returns to foreground
 * (e.g. after the user toggles GPS in system settings).
 */
export const useLocationStatus = (pollMs = 15000) => {
  const [status, setStatus] = useState({ enabled: false, granted: false });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const next = await getLocationStatus();
      if (mounted) setStatus(next);
    };

    check();
    const interval = setInterval(check, pollMs);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      sub.remove();
    };
  }, [pollMs]);

  return status;
};

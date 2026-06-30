import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';

/**
 * Live online status via Firebase Realtime Database's `.info/connected`.
 * Reflects actual DB reachability (what this app depends on), so no extra
 * native networking dependency is needed.
 */
export const useNetworkStatus = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      setOnline(snap.val() === true);
    });
    return () => unsubscribe();
  }, []);

  return online;
};

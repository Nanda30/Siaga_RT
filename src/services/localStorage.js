import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  USER: '@siagarw_user',
  ALERTS: '@siagarw_alerts',
  PENDING_SYNC: '@siagarw_pending_sync',
  LAST_SYNC: '@siagarw_last_sync',
};

// ==================== USER OPERATIONS ====================

export const saveUserLocal = async (user) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Failed to save user locally:', error);
    return false;
  }
};

export const getUserLocal = async () => {
  try {
    const userData = await AsyncStorage.getItem(KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to get user locally:', error);
    return null;
  }
};

export const clearUserLocal = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
    return true;
  } catch (error) {
    console.error('Failed to clear user locally:', error);
    return false;
  }
};

// ==================== ALERTS OPERATIONS ====================

export const saveAlertLocal = async (alert) => {
  try {
    const alerts = await getAlertsLocal();
    alerts.unshift(alert); // Add to beginning

    // Keep only last 100 alerts to avoid storage bloat
    const trimmed = alerts.slice(0, 100);

    await AsyncStorage.setItem(KEYS.ALERTS, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('Failed to save alert locally:', error);
    return false;
  }
};

export const getAlertsLocal = async () => {
  try {
    const alertsData = await AsyncStorage.getItem(KEYS.ALERTS);
    return alertsData ? JSON.parse(alertsData) : [];
  } catch (error) {
    console.error('Failed to get alerts locally:', error);
    return [];
  }
};

export const updateAlertLocal = async (alertId, updates) => {
  try {
    const alerts = await getAlertsLocal();
    const index = alerts.findIndex((a) => a.alertId === alertId);

    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...updates };
      await AsyncStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update alert locally:', error);
    return false;
  }
};

// ==================== PENDING SYNC OPERATIONS ====================

export const addPendingSync = async (operation) => {
  try {
    const pending = await getPendingSync();
    pending.push({
      ...operation,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random()}`,
    });

    await AsyncStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify(pending));
    return true;
  } catch (error) {
    console.error('Failed to add pending sync:', error);
    return false;
  }
};

export const getPendingSync = async () => {
  try {
    const pendingData = await AsyncStorage.getItem(KEYS.PENDING_SYNC);
    return pendingData ? JSON.parse(pendingData) : [];
  } catch (error) {
    console.error('Failed to get pending sync:', error);
    return [];
  }
};

export const removePendingSync = async (id) => {
  try {
    const pending = await getPendingSync();
    const filtered = pending.filter((op) => op.id !== id);
    await AsyncStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to remove pending sync:', error);
    return false;
  }
};

export const clearPendingSync = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.PENDING_SYNC);
    return true;
  } catch (error) {
    console.error('Failed to clear pending sync:', error);
    return false;
  }
};

// ==================== SYNC STATUS ====================

export const setLastSync = async () => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Failed to set last sync:', error);
    return false;
  }
};

export const getLastSync = async () => {
  try {
    const lastSync = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return lastSync || null;
  } catch (error) {
    console.error('Failed to get last sync:', error);
    return null;
  }
};

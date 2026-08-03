import { ref, set, update } from 'firebase/database';
import { db } from './firebase';
import {
  getPendingSync,
  removePendingSync,
  setLastSync,
  saveAlertLocal,
  updateAlertLocal,
  saveUserLocal,
} from './localStorage';

let isSyncing = false;

// ==================== SYNC OPERATIONS ====================

export const syncPendingOperations = async () => {
  if (isSyncing) {
    console.log('Sync already in progress, skipping...');
    return { success: false, reason: 'already_syncing' };
  }

  isSyncing = true;

  try {
    const pending = await getPendingSync();

    if (pending.length === 0) {
      isSyncing = false;
      return { success: true, synced: 0 };
    }

    console.log(`Syncing ${pending.length} pending operations...`);

    let successCount = 0;
    let failCount = 0;

    // Process each pending operation
    for (const operation of pending) {
      try {
        const result = await syncSingleOperation(operation);

        if (result.success) {
          await removePendingSync(operation.id);
          successCount++;
        } else {
          failCount++;
          console.warn(`Failed to sync operation ${operation.id}:`, result.error);
        }
      } catch (error) {
        failCount++;
        console.error(`Error syncing operation ${operation.id}:`, error);
      }
    }

    // Update last sync timestamp
    if (successCount > 0) {
      await setLastSync();
    }

    isSyncing = false;

    return {
      success: true,
      synced: successCount,
      failed: failCount,
      total: pending.length,
    };
  } catch (error) {
    isSyncing = false;
    console.error('Sync failed:', error);
    return { success: false, error: error.message };
  }
};

// ==================== SYNC SINGLE OPERATION ====================

const syncSingleOperation = async (operation) => {
  try {
    switch (operation.type) {
      case 'CREATE_USER':
        return await syncCreateUser(operation.data);

      case 'CREATE_ALERT':
        return await syncCreateAlert(operation.data);

      case 'UPDATE_ALERT':
        return await syncUpdateAlert(operation.data);

      default:
        console.warn(`Unknown operation type: ${operation.type}`);
        return { success: false, error: 'unknown_type' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== SPECIFIC SYNC HANDLERS ====================

const syncCreateUser = async (userData) => {
  try {
    const { userId, name, phone, role, createdAt } = userData;

    await set(ref(db, `users/${userId}`), {
      userId,
      name,
      phone,
      role,
      createdAt,
    });

    console.log(`User ${userId} synced to Firebase`);
    return { success: true };
  } catch (error) {
    console.error('Failed to sync user:', error);
    return { success: false, error: error.message };
  }
};

const syncCreateAlert = async (alertData) => {
  try {
    const { alertId } = alertData;

    await set(ref(db, `alerts/${alertId}`), alertData);

    console.log(`Alert ${alertId} synced to Firebase`);
    return { success: true };
  } catch (error) {
    console.error('Failed to sync alert:', error);
    return { success: false, error: error.message };
  }
};

const syncUpdateAlert = async (updateData) => {
  try {
    const { alertId, updates } = updateData;

    await update(ref(db, `alerts/${alertId}`), updates);

    console.log(`Alert ${alertId} update synced to Firebase`);
    return { success: true };
  } catch (error) {
    console.error('Failed to sync alert update:', error);
    return { success: false, error: error.message };
  }
};

// ==================== AUTO SYNC TRIGGER ====================

export const shouldAutoSync = async () => {
  const pending = await getPendingSync();
  return pending.length > 0;
};

export const startAutoSync = (onlineStatus) => {
  if (onlineStatus) {
    // Delay sync by 1 second to ensure connection is stable
    setTimeout(() => {
      syncPendingOperations().then((result) => {
        if (result.success && result.synced > 0) {
          console.log(`Auto-sync completed: ${result.synced} operations synced`);
        }
      });
    }, 1000);
  }
};

import * as Location from 'expo-location';

/**
 * Request foreground location permission. Returns true if granted.
 */
export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

/**
 * Check whether location services are enabled and permission is granted,
 * without prompting. Used for the live GPS status indicator.
 */
export const getLocationStatus = async () => {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    const { status } = await Location.getForegroundPermissionsAsync();
    return { enabled: servicesEnabled, granted: status === 'granted' };
  } catch {
    return { enabled: false, granted: false };
  }
};

/**
 * Get current coordinates and a best-effort human-readable address.
 * Throws a user-friendly Error on failure.
 */
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error('Izin lokasi ditolak. Aktifkan izin lokasi untuk mengirim laporan.');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;

    let address = 'Alamat tidak ditemukan';
    try {
      const details = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (details.length > 0) {
        const { street, name, district, city, region, postalCode } = details[0];
        address = [name || street, district, city, region, postalCode]
          .filter(Boolean)
          .join(', ')
          .trim();
      }
    } catch {
      // Reverse geocoding can fail offline; coordinates are still usable.
    }

    return { latitude, longitude, address };
  } catch (error) {
    if (error?.message?.includes('Izin lokasi')) throw error;
    throw new Error('Gagal mengambil lokasi. Pastikan GPS aktif dan coba lagi.');
  }
};

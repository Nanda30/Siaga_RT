import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * IP laptop di jaringan lokal (sesuai Laragon: 192.168.1.104)
 * Ini memastikan APK mandiri yang terpasang di HP fisik
 * bisa langsung mengirim laporan ke server backend laptop.
 */
const LAPTOP_LOCAL_IP = '192.168.1.104';

export function getBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:4000/api`;
  }

  // Jika berupa build APK di HP fisik:
  if (Platform.OS === 'android') {
    return `http://${LAPTOP_LOCAL_IP}:4000/api`;
  }

  return 'http://localhost:4000/api';
}

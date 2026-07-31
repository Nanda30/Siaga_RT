// Calm, trustworthy public-safety palette. Light theme by default.
export const colors = {
  primary: '#0F4C81',
  primaryVariant: '#1E5AA8',
  onPrimary: '#FFFFFF',

  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF2F7',

  textPrimary: '#1A1A1A',
  textSecondary: '#616161',
  textDisabled: '#9E9E9E',

  divider: '#E5E7EB',

  emergency: '#D32F2F',
  emergencyPressed: '#B71C1C',
  onEmergency: '#FFFFFF',

  warning: '#F9A825',
  warningPressed: '#F57F17',
  onWarning: '#1A1A1A',

  success: '#2E7D32',
  info: '#0288D1',
  error: '#C62828',

  // Translucent overlays
  scrim: 'rgba(15, 76, 129, 0.45)',
  ripple: 'rgba(15, 76, 129, 0.12)',
};

// Premium dark mode colors
export const darkColors = {
  primary: '#2B6699',
  primaryVariant: '#3C7CB6',
  onPrimary: '#FFFFFF',

  background: '#0F172A', // Slate 900
  surface: '#1E293B',    // Slate 800
  surfaceVariant: '#334155', // Slate 700

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textDisabled: '#64748B',

  divider: '#334155',

  emergency: '#EF4444',
  emergencyPressed: '#DC2626',
  onEmergency: '#FFFFFF',

  warning: '#F59E0B',
  warningPressed: '#D97706',
  onWarning: '#1E293B',

  success: '#10B981',
  info: '#3B82F6',
  error: '#EF4444',

  scrim: 'rgba(15, 76, 129, 0.6)',
  ripple: 'rgba(255, 255, 255, 0.15)',
};

import { useThemeContext } from './ThemeContext';

export const useThemeColors = () => {
  const { isDark } = useThemeContext();
  return isDark ? darkColors : colors;
};

// Maps an alert type to its semantic color set.
export const alertTypeColors = (type) =>
  type === 'EMERGENCY'
    ? { base: colors.emergency, pressed: colors.emergencyPressed, on: colors.onEmergency }
    : { base: colors.warning, pressed: colors.warningPressed, on: colors.onWarning };

// Dynamic alert colors for components
export const useAlertTypeColors = (type) => {
  const current = useThemeColors();
  return type === 'EMERGENCY'
    ? { base: current.emergency, pressed: current.emergencyPressed, on: current.onEmergency }
    : { base: current.warning, pressed: current.warningPressed, on: current.onWarning };
};

// Maps an alert status to its badge color.
export const statusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return colors.emergency;
    case 'RESPONDING':
      return colors.warning;
    case 'COMPLETED':
      return colors.success;
    default:
      return colors.textSecondary;
  }
};

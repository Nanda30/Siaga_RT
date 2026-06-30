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

// Maps an alert type to its semantic color set.
export const alertTypeColors = (type) =>
  type === 'EMERGENCY'
    ? { base: colors.emergency, pressed: colors.emergencyPressed, on: colors.onEmergency }
    : { base: colors.warning, pressed: colors.warningPressed, on: colors.onWarning };

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

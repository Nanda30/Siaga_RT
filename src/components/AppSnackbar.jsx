import React from 'react';
import { Snackbar } from 'react-native-paper';
import { colors } from '../theme/colors';

const VARIANT_COLORS = {
  success: colors.success,
  error: colors.error,
  info: colors.info,
  warning: colors.warning,
};

/**
 * Themed snackbar with semantic variants. Controlled via `visible`.
 */
const AppSnackbar = ({
  visible,
  onDismiss,
  message,
  variant = 'info',
  duration = 3500,
  actionLabel = 'OK',
}) => (
  <Snackbar
    visible={visible}
    onDismiss={onDismiss}
    duration={duration}
    style={{ backgroundColor: VARIANT_COLORS[variant] || colors.info }}
    action={{ label: actionLabel, onPress: onDismiss, textColor: colors.onPrimary }}
  >
    {message}
  </Snackbar>
);

export default AppSnackbar;

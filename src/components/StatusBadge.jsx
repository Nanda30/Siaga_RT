import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { statusColor } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

const STATUS_LABELS = {
  PENDING: 'Menunggu',
  RESPONDING: 'Ditangani',
  COMPLETED: 'Selesai',
};

// Returns a hex with the alpha channel appended (8-digit hex).
const withAlpha = (hex, alpha) => `${hex}${alpha}`;

/**
 * Pill badge that renders an alert status with a tinted background
 * and a solid dot. Accessible label included.
 */
const StatusBadge = ({ status, style }) => {
  const color = statusColor(status);
  const label = STATUS_LABELS[status] || status;

  return (
    <View
      style={[styles.badge, { backgroundColor: withAlpha(color, '1A') }, style]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  label: { ...typography.captionStrong },
});

export default StatusBadge;

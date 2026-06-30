import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

/**
 * Compact status chip for live indicators (GPS, internet).
 * `ok` toggles between success and error coloring.
 */
const StatusChip = ({ icon, label, ok }) => {
  const color = ok ? colors.success : colors.error;
  return (
    <View style={[styles.chip, { backgroundColor: `${color}14`, borderColor: `${color}33` }]}>
      <MaterialCommunityIcons name={icon} size={16} color={color} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { ...typography.captionStrong, marginLeft: spacing.xs },
});

export default StatusChip;

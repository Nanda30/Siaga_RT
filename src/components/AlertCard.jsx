import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { alertTypeColors, colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';

const formatTime = (createdAt) => {
  if (!createdAt) return '-';
  try {
    return new Date(createdAt).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * Tappable alert summary card for the dashboard list. Memoized so unchanged
 * rows don't re-render when the alerts array updates.
 */
const AlertCard = ({ alert, onPress }) => {
  const { base } = alertTypeColors(alert.type);
  const isEmergency = alert.type === 'EMERGENCY';

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      accessibilityRole="button"
      accessibilityLabel={`Laporan ${alert.type} dari ${alert.userName}`}
      style={[styles.card, elevation.sm]}
    >
      <View style={[styles.accent, { backgroundColor: base }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.typeRow}>
            <MaterialCommunityIcons
              name={isEmergency ? 'alert-circle' : 'alert-decagram'}
              size={20}
              color={base}
            />
            <Text style={[styles.type, { color: base }]}>
              {isEmergency ? 'DARURAT' : 'SIAGA'}
            </Text>
          </View>
          <StatusBadge status={alert.status} />
        </View>

        <Text style={styles.name} numberOfLines={1}>{alert.userName}</Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={15} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{alert.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={15} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{alert.address}</Text>
        </View>

        <Text style={styles.time}>{formatTime(alert.createdAt)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
  accent: { width: 6 },
  body: { flex: 1, padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center' },
  type: { ...typography.captionStrong, marginLeft: spacing.xs, letterSpacing: 0.5 },
  name: { ...typography.bodyStrong, color: colors.textPrimary, marginTop: spacing.sm, marginBottom: spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  infoText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 },
  time: { ...typography.caption, color: colors.textDisabled, textAlign: 'right', marginTop: spacing.sm },
});

export default memo(AlertCard);

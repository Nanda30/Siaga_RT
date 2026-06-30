import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Web fallback: react-native-maps is native-only, so we show coordinates
 * and address instead. The "Open Maps" button on the detail screen still works.
 */
const MapDisplay = ({ alert }) => (
  <View style={styles.container}>
    <MaterialCommunityIcons name="map-marker-radius" size={48} color={colors.primary} />
    <Text style={styles.title}>Peta tidak tersedia di Web</Text>
    <Text style={styles.text}>
      Koordinat: {alert.latitude?.toFixed(6)}, {alert.longitude?.toFixed(6)}
    </Text>
    <Text style={styles.text} numberOfLines={2}>
      {alert.address}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { ...typography.bodyStrong, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  text: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
});

export default MapDisplay;

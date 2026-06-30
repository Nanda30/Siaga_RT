import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Full-screen translucent overlay shown during blocking async work.
 * Render conditionally: {visible && <LoadingOverlay message="..." />}
 */
const LoadingOverlay = ({ message, visible = true }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLabel={message || 'Memuat'}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message ? <Text style={styles.text}>{message}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    minWidth: 200,
  },
  text: { ...typography.body, color: colors.textPrimary, marginTop: spacing.lg, textAlign: 'center' },
});

export default LoadingOverlay;

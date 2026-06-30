import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { alertTypeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';

/**
 * Large tappable alert tile used on the user home screen.
 * Colors derive from the alert type (EMERGENCY / CAUTION).
 */
const AlertButton = ({ title, subtitle, type, onPress, icon, disabled = false }) => {
  const { base, on } = alertTypeColors(type);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle || ''}`}
      accessibilityState={{ disabled }}
      style={[styles.touchable, disabled && styles.disabled]}
    >
      <View style={[styles.surface, elevation.md, { backgroundColor: base }]}>
        <MaterialCommunityIcons name={icon} size={52} color={on} />
        <Text style={[styles.title, { color: on }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: on }]}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: { width: '100%', marginBottom: spacing.lg },
  disabled: { opacity: 0.6 },
  surface: {
    minHeight: 150,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: { ...typography.screenTitle, marginTop: spacing.sm, letterSpacing: 0.5 },
  subtitle: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center', opacity: 0.9 },
});

export default AlertButton;

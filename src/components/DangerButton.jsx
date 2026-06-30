import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing, TOUCH_TARGET } from '../theme/spacing';
import { elevation } from '../theme/elevation';

/**
 * Destructive / emergency action button. Defaults to the emergency red,
 * but accepts a `variant="warning"` for the amber siaga action.
 */
const DangerButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'emergency',
  style,
}) => {
  const isDisabled = disabled || loading;
  const base = variant === 'warning' ? colors.warning : colors.emergency;
  const pressedColor = variant === 'warning' ? colors.warningPressed : colors.emergencyPressed;
  const fg = variant === 'warning' ? colors.onWarning : colors.onEmergency;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: 'rgba(0,0,0,0.15)' }}
      style={({ pressed }) => [
        styles.button,
        elevation.md,
        { backgroundColor: pressed ? pressedColor : base },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size={28} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <MaterialCommunityIcons name={icon} size={44} color={fg} />
          ) : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 132,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  content: { alignItems: 'center' },
  label: { ...typography.sectionTitle, marginTop: spacing.sm, letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
});

export default DangerButton;

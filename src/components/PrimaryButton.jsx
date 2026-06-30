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
 * Primary call-to-action button. Full-width, accessible touch target,
 * subtle press feedback, and a loading state.
 */
const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      style={({ pressed }) => [
        styles.button,
        elevation.sm,
        { backgroundColor: pressed ? colors.primaryVariant : colors.primary },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} size={22} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={colors.onPrimary}
              style={styles.icon}
            />
          ) : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
  label: { ...typography.button, color: colors.onPrimary },
  disabled: { opacity: 0.5 },
});

export default PrimaryButton;

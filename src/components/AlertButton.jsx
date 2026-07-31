import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlertTypeColors, colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';

/**
 * Large stacked circular alert button for easy access during emergencies.
 * Colors derived from type (EMERGENCY / CAUTION).
 * Contains the icon, title, and descriptive subtitle centered inside the circle.
 * High visual hierarchy: EMERGENCY is larger with thin border, CAUTION is smaller with thick border.
 */
const AlertButton = ({ title, subtitle, type, onPress, icon, disabled = false }) => {
  const { base, on } = useAlertTypeColors(type);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const isEmergency = type === 'EMERGENCY';

  const circleStyle = {
    backgroundColor: base,
    width: isEmergency ? 220 : 170,
    height: isEmergency ? 220 : 170,
    borderRadius: isEmergency ? 110 : 85,
    borderWidth: isEmergency ? 1 : 8,
    borderColor: isEmergency ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.2)',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle || ''}`}
      accessibilityState={{ disabled }}
      style={[styles.touchable, disabled && styles.disabled]}
    >
      <Animated.View
        style={[
          styles.circle,
          circleStyle,
          elevation.lg,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={isEmergency ? 52 : 38}
          color={on}
          style={styles.icon}
        />
        <Text
          style={[
            styles.title,
            {
              color: on,
              fontSize: isEmergency ? 26 : 20,
              lineHeight: isEmergency ? 32 : 26
            }
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: on,
                fontSize: isEmergency ? 14 : 12,
                lineHeight: isEmergency ? 18 : 16
              }
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  disabled: { opacity: 0.5 },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyStrong,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.95,
  },
});

export default AlertButton;

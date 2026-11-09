import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';

/**
 * White surface card with optional title, text, or children.
 */
const InfoCard = ({ title, icon, text, children, style }) => (
  <View style={[styles.card, elevation.sm, style]}>
    {title ? (
      <View style={styles.header}>
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={colors.primary}
            style={styles.icon}
          />
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
    ) : null}
    {text ? (
      <View style={styles.row}>
        {icon && !title ? (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={colors.primary}
            style={styles.icon}
          />
        ) : null}
        <Text style={styles.text}>{text}</Text>
      </View>
    ) : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant || '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { marginRight: spacing.sm },
  title: {
    ...typography.captionStrong,
    color: colors.textSecondary || '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    ...typography.body,
    color: colors.onSurface,
    flex: 1,
  },
});

export default InfoCard;

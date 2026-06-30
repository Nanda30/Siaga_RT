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
 * White surface card with optional title and leading icon.
 * Use as the standard container for grouped information.
 */
const InfoCard = ({ title, icon, children, style }) => (
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
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: { marginRight: spacing.sm },
  title: { ...typography.captionStrong, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
});

export default InfoCard;

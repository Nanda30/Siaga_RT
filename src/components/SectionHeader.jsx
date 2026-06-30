import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Section heading with an optional subtitle, used to break up screens.
 */
const SectionHeader = ({ title, subtitle, style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  title: { ...typography.sectionTitle, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});

export default SectionHeader;

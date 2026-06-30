import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Centered empty-state placeholder with an icon, title and optional hint.
 */
const EmptyState = ({ icon = 'inbox-outline', title, message, style }) => (
  <View style={[styles.container, style]}>
    <MaterialCommunityIcons name={icon} size={72} color={colors.textDisabled} />
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  title: { ...typography.sectionTitle, color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' },
  message: { ...typography.body, color: colors.textDisabled, marginTop: spacing.sm, textAlign: 'center' },
});

export default EmptyState;

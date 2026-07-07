import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

/**
 * Reusable confirmation dialog. `tone` colors the confirm button
 * (emergency/warning/primary).
 */
const ConfirmationDialog = ({
  visible,
  onDismiss,
  onConfirm,
  title,
  message,
  confirmLabel = 'Kirim',
  cancelLabel = 'Batal',
  tone = 'primary',
  loading = false,
  children,
}) => {
  const toneColor =
    tone === 'emergency' ? colors.emergency : tone === 'warning' ? colors.warningPressed : colors.primary;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
          {children}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading} textColor={colors.textSecondary}>
            {cancelLabel}
          </Button>
          <Button
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            mode="contained"
            buttonColor={toneColor}
            textColor={colors.onPrimary}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: colors.surface, borderRadius: 16 },
  title: { ...typography.sectionTitle, color: colors.textPrimary },
  message: { ...typography.body, color: colors.textSecondary },
});

export default ConfirmationDialog;

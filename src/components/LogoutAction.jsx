import React, { useState } from 'react';
import { Appbar } from 'react-native-paper';
import ConfirmationDialog from './ConfirmationDialog';
import { colors } from '../theme/colors';

/**
 * Logout action for the navigation AppBar. Confirms before resetting the
 * navigation stack back to the Login screen.
 */
const LogoutAction = ({ navigation }) => {
  const [visible, setVisible] = useState(false);

  const confirmLogout = () => {
    setVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <>
      <Appbar.Action
        icon="logout"
        color={colors.onPrimary}
        accessibilityLabel="Keluar"
        onPress={() => setVisible(true)}
      />
      <ConfirmationDialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        onConfirm={confirmLogout}
        title="Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmLabel="Keluar"
        cancelLabel="Batal"
        tone="emergency"
      />
    </>
  );
};

export default LogoutAction;

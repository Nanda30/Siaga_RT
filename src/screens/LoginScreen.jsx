import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { TextInput, Text, SegmentedButtons } from 'react-native-paper';
import { ref, set } from 'firebase/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../services/firebase';
import PrimaryButton from '../components/PrimaryButton';
import AppSnackbar from '../components/AppSnackbar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { elevation } from '../theme/elevation';

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Warga');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'error' });

  const showError = (message) =>
    setSnack({ visible: true, message, variant: 'error' });

  const validate = () => {
    if (!name.trim()) {
      showError('Harap isi nama lengkap Anda.');
      return false;
    }
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 9) {
      showError('Nomor telepon tidak valid (minimal 9 digit).');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      const uid = phone.replace(/[^0-9]/g, '');
      const user = { uid, name: name.trim(), phone: phone.trim(), role };

      await set(ref(db, `users/${uid}`), {
        ...user,
        createdAt: new Date().toISOString(),
      });

      navigation.replace(role === 'Warga' ? 'UserHome' : 'AdminDashboard', { user });
    } catch (err) {
      showError('Gagal masuk: ' + (err?.message || 'Periksa koneksi internet Anda.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="shield-check" size={56} color={colors.onPrimary} />
          </View>
          <Text style={styles.appName}>SiagaRT</Text>
          <Text style={styles.subtitle}>Sistem Informasi Keamanan Warga</Text>
        </View>

        <View style={[styles.card, elevation.md]}>
          <TextInput
            label="Nama Lengkap"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Nomor Telepon"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            left={<TextInput.Icon icon="phone" />}
          />

          <Text style={styles.label}>Pilih Peran</Text>
          <SegmentedButtons
            value={role}
            onValueChange={setRole}
            buttons={[
              { value: 'Warga', label: 'Warga', icon: 'account' },
              { value: 'Satpam', label: 'Petugas', icon: 'shield-account' },
            ]}
            style={styles.segmented}
          />

          <PrimaryButton
            label="MASUK"
            icon="login"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
        </View>

        <Text style={styles.footer}>Aplikasi keamanan lingkungan untuk warga dan petugas.</Text>
      </ScrollView>

      <AppSnackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        message={snack.message}
        variant={snack.variant}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...elevation.md,
  },
  appName: { ...typography.screenTitle, color: colors.primary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  input: { marginBottom: spacing.lg, backgroundColor: colors.surface },
  label: { ...typography.bodyStrong, color: colors.textPrimary, marginBottom: spacing.sm },
  segmented: { marginBottom: spacing.xl },
  button: { marginTop: spacing.xs },
  footer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default LoginScreen;

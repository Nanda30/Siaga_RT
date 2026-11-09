import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import AppSnackbar from '../components/AppSnackbar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'error' });

  const { login } = useAuth();

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
      const res = await login(name.trim(), phone.trim());
      const loggedUser = res.user;

      if (loggedUser.role === 'WARGA') {
        navigation.replace('UserHome', { user: loggedUser });
      } else {
        navigation.replace('AdminDashboard', { user: loggedUser });
      }
    } catch (err) {
      showError(err.message || 'Gagal masuk. Periksa koneksi ke server.');
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
          <Text style={styles.appName}>SiapSiaga</Text>
          <Text style={styles.subtitle}>Sistem Informasi Keamanan Warga & Lingkungan</Text>
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
            label="Nomor Telepon (WhatsApp)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            left={<TextInput.Icon icon="phone" />}
          />

          <PrimaryButton
            label="MASUK"
            icon="login"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
        </View>

        <Text style={styles.footer}>
          Peran (Warga/Petugas) otomatis ditentukan oleh sistem terpusat.
        </Text>
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
  subtitle: { ...typography.body, color: colors.outline, textAlign: 'center', marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  input: { marginBottom: spacing.lg, backgroundColor: colors.surface },
  button: { marginTop: spacing.sm },
  footer: { ...typography.caption, color: colors.outline, textAlign: 'center' },
});

export default LoginScreen;

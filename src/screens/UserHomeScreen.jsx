import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentLocation } from '../services/location';
import { alertsApi } from '../api/endpoints';
import { useClock } from '../hooks/useClock';
import { useLocationStatus } from '../hooks/useLocationStatus';
import AlertButton from '../components/AlertButton';
import StatusChip from '../components/StatusChip';
import InfoCard from '../components/InfoCard';
import SectionHeader from '../components/SectionHeader';
import ConfirmationDialog from '../components/ConfirmationDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import AppSnackbar from '../components/AppSnackbar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { elevation } from '../theme/elevation';

const DATE_OPTS = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

const INSTRUCTIONS = [
  'Pastikan GPS dan koneksi WiFi/data aktif sebelum melapor.',
  'Tekan DARURAT untuk situasi bahaya/mengancam jiwa.',
  'Tekan SIAGA untuk kejadian mencurigakan/keamanan lingkungan.',
  'Tetap berada di lokasi aman sampai petugas merespons.',
];

const UserHomeScreen = ({ route }) => {
  const { user } = route.params;
  const now = useClock();
  const gps = useLocationStatus();

  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ visible: false, type: '' });
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'success' });

  const sendAlert = useCallback(async (type) => {
    setConfirm({ visible: false, type: '' });
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await alertsApi.create({
        type,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        clientId,
      });

      setSnack({
        visible: true,
        variant: 'success',
        message: `Laporan ${type === 'EMERGENCY' ? 'Darurat' : 'Siaga'} terkirim ke pos petugas ronda.`,
      });
    } catch (error) {
      setSnack({
        visible: true,
        variant: 'error',
        message: error?.message || 'Gagal mengirim laporan ke server.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmType = confirm.type;
  const isEmergency = confirmType === 'EMERGENCY';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.welcomeCard, elevation.sm]}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeGreeting}>Selamat datang,</Text>
              <Text style={styles.welcomeName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.welcomeRole}>Warga RW</Text>
            </View>
            <View style={styles.clockBlock}>
              <Text style={styles.clockTime}>
                {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.clockDate}>{now.toLocaleDateString('id-ID', DATE_OPTS)}</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            <StatusChip
              label={gps.loading ? 'Mencari...' : gps.available ? 'GPS Aktif' : 'GPS Mati'}
              icon="crosshairs-gps"
              status={gps.available ? 'success' : 'error'}
            />
          </View>
        </View>

        <SectionHeader title="Kirim Laporan Cepat" subtitle="Tekan tombol sesuai situasi yang Anda hadapi" />

        <View style={styles.buttonGroup}>
          <AlertButton
            title="DARURAT"
            subtitle="Bahaya medis, kebakaran, atau ancaman jiwa"
            icon="alert-octagon"
            type="EMERGENCY"
            onPress={() => setConfirm({ visible: true, type: 'EMERGENCY' })}
            disabled={loading}
          />
          <View style={styles.buttonSpacer} />
          <AlertButton
            title="SIAGA"
            subtitle="Kejadian mencurigakan atau gangguan ketertiban"
            icon="alert"
            type="CAUTION"
            onPress={() => setConfirm({ visible: true, type: 'CAUTION' })}
            disabled={loading}
          />
        </View>

        <SectionHeader title="Petunjuk Penggunaan" subtitle="Langkah penting saat menghadapi situasi darurat" />

        <View style={styles.instructionList}>
          {INSTRUCTIONS.map((text, idx) => (
            <InfoCard key={idx} icon="information-outline" text={text} style={styles.instructionCard} />
          ))}
        </View>
      </ScrollView>

      <ConfirmationDialog
        visible={confirm.visible}
        title={isEmergency ? 'Konfirmasi Darurat' : 'Konfirmasi Siaga'}
        message={
          isEmergency
            ? 'Apakah Anda yakin ingin mengirim tanda DARURAT? Lokasi Anda akan langsung dikirim ke petugas keamanan.'
            : 'Apakah Anda yakin ingin mengirim laporan SIAGA ke petugas keamanan?'
        }
        confirmLabel={isEmergency ? 'KIRIM DARURAT' : 'KIRIM SIAGA'}
        confirmColor={isEmergency ? colors.emergency : colors.caution}
        onConfirm={() => sendAlert(confirmType)}
        onCancel={() => setConfirm({ visible: false, type: '' })}
      />

      <LoadingOverlay visible={loading} message="Mengirim laporan & koordinat GPS ke server..." />

      <AppSnackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        message={snack.message}
        variant={snack.variant}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  welcomeText: { flex: 1, marginRight: spacing.md },
  welcomeGreeting: { ...typography.caption, color: colors.outline },
  welcomeName: { ...typography.sectionTitle, color: colors.primary, marginTop: 2 },
  welcomeRole: { ...typography.caption, color: colors.outline, marginTop: 2 },
  clockBlock: { alignItems: 'flex-end' },
  clockTime: { ...typography.screenTitle, color: colors.primary, fontWeight: '700' },
  clockDate: { ...typography.caption, color: colors.outline, marginTop: 2, textAlign: 'right' },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  buttonGroup: { marginBottom: spacing.xl },
  buttonSpacer: { height: spacing.xs },
  instructionList: { gap: spacing.sm },
  instructionCard: { marginBottom: 0 },
});

export default UserHomeScreen;

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { db } from '../services/firebase';
import { getCurrentLocation } from '../services/location';
import { useClock } from '../hooks/useClock';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
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
  'Pastikan GPS dan internet aktif sebelum melapor.',
  'Tekan DARURAT untuk situasi mengancam jiwa.',
  'Tekan SIAGA untuk kejadian yang perlu perhatian.',
  'Tetap di lokasi aman hingga petugas merespons.',
];

const UserHomeScreen = ({ route }) => {
  const { user } = route.params;
  const now = useClock();
  const online = useNetworkStatus();
  const gps = useLocationStatus();

  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ visible: false, type: '' });
  const [message, setMessage] = useState('');
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'success' });

  const sendAlert = useCallback(async (type, userMessage) => {
    setConfirm({ visible: false, type: '' });
    setMessage('');
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const alertId = push(ref(db, 'alerts')).key;
      const alertData = {
        alertId,
        userId: user.uid,
        userName: user.name,
        phone: user.phone,
        type,
        message: userMessage || '',
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        status: 'PENDING',
        createdAt: serverTimestamp(),
      };
      await set(ref(db, `alerts/${alertId}`), alertData);
      setSnack({
        visible: true,
        variant: 'success',
        message: `Laporan ${type === 'EMERGENCY' ? 'Darurat' : 'Siaga'} terkirim. Petugas akan merespons.`,
      });
    } catch (error) {
      setSnack({ visible: true, variant: 'error', message: error?.message || 'Gagal mengirim laporan.' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const confirmType = confirm.type;
  const isEmergency = confirmType === 'EMERGENCY';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome card with live date/time */}
        <View style={[styles.welcomeCard, elevation.md]}>
          <View style={styles.welcomeRow}>
            <MaterialCommunityIcons name="account-circle" size={44} color={colors.onPrimary} />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeHi}>Halo,</Text>
              <Text style={styles.welcomeName} numberOfLines={1}>{user.name}</Text>
            </View>
          </View>
          <View style={styles.clockRow}>
            <Text style={styles.time}>
              {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
            <Text style={styles.date}>{now.toLocaleDateString('id-ID', DATE_OPTS)}</Text>
          </View>
        </View>

        {/* Live status indicators */}
        <View style={styles.statusRow}>
          <StatusChip icon={gps.enabled && gps.granted ? 'crosshairs-gps' : 'crosshairs-off'}
            label={gps.enabled && gps.granted ? 'GPS Aktif' : 'GPS Mati'} ok={gps.enabled && gps.granted} />
          <StatusChip icon={online ? 'wifi' : 'wifi-off'}
            label={online ? 'Internet Aktif' : 'Tidak Terhubung'} ok={online} />
        </View>

        <SectionHeader
          title="Bantuan Cepat"
          subtitle="Tekan tombol di bawah untuk melaporkan kejadian di lingkungan Anda."
          style={styles.section}
        />

        <AlertButton
          title="DARURAT"
          subtitle="Situasi mengancam jiwa"
          type="EMERGENCY"
          icon="alert-circle"
          onPress={() => setConfirm({ visible: true, type: 'EMERGENCY' })}
          disabled={loading}
        />
        <AlertButton
          title="SIAGA"
          subtitle="Perlu perhatian / kewaspadaan"
          type="CAUTION"
          icon="alert-decagram"
          onPress={() => setConfirm({ visible: true, type: 'CAUTION' })}
          disabled={loading}
        />

        <InfoCard title="Petunjuk Darurat" icon="information-outline" style={styles.section}>
          {INSTRUCTIONS.map((text, i) => (
            <View key={i} style={styles.instructionRow}>
              <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
              <Text style={styles.instructionText}>{text}</Text>
            </View>
          ))}
        </InfoCard>
      </ScrollView>

      <ConfirmationDialog
        visible={confirm.visible}
        onDismiss={() => { setConfirm({ visible: false, type: '' }); setMessage(''); }}
        onConfirm={() => sendAlert(confirmType, message)}
        title="Konfirmasi Laporan"
        message={`Kirim laporan ${isEmergency ? 'DARURAT (Merah)' : 'SIAGA (Kuning)'}? Lokasi Anda akan dibagikan ke petugas.`}
        confirmLabel="Kirim Sekarang"
        tone={isEmergency ? 'emergency' : 'warning'}
      >
        <TextInput
          style={msgInputStyles.input}
          placeholder="Tulis pesan / keterangan kejadian... (opsional)"
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical="top"
        />
        {message.length > 0 && (
          <Text style={msgInputStyles.counter}>{message.length}/500</Text>
        )}
      </ConfirmationDialog>

      <LoadingOverlay visible={loading} message="Mengambil lokasi dan mengirim laporan..." />

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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  welcomeRow: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { marginLeft: spacing.md, flex: 1 },
  welcomeHi: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
  welcomeName: { ...typography.sectionTitle, color: colors.onPrimary },
  clockRow: { marginTop: spacing.lg },
  time: { ...typography.screenTitle, color: colors.onPrimary, fontVariant: ['tabular-nums'] },
  date: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  statusRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  section: { marginTop: spacing.sm },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  instructionText: { ...typography.body, color: colors.textPrimary, marginLeft: spacing.sm, flex: 1 },
});

const msgInputStyles = StyleSheet.create({
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  counter: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});

export default UserHomeScreen;

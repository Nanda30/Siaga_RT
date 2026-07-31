import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
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
import SectionHeader from '../components/SectionHeader';
import ConfirmationDialog from '../components/ConfirmationDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import AppSnackbar from '../components/AppSnackbar';
import { colors, useThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { elevation } from '../theme/elevation';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const colors = useThemeColors();

  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ visible: false, type: '' });
  const [message, setMessage] = useState('');
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'success' });
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  const toggleInstructions = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInstructionsExpanded((prev) => !prev);
  }, []);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome card with live date/time - Reduced height & redesigned */}
        <View style={[styles.welcomeCard, elevation.md, { backgroundColor: colors.primary }]}>
          <View style={styles.headerTopRow}>
            <View style={styles.welcomeRow}>
              <MaterialCommunityIcons name="account-circle" size={40} color={colors.onPrimary} />
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeHi} numberOfLines={1}>Halo,</Text>
                <Text style={styles.welcomeName} numberOfLines={1}>{user.name}</Text>
              </View>
            </View>
            <View style={styles.clockColumn}>
              <Text style={styles.time}>
                {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
              <Text style={styles.date}>
                {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Live status indicators - Compact layout */}
        <View style={styles.statusRow}>
          <StatusChip icon={gps.enabled && gps.granted ? 'crosshairs-gps' : 'crosshairs-off'}
            label={gps.enabled && gps.granted ? 'GPS Aktif' : 'GPS Mati'} ok={gps.enabled && gps.granted} />
          <StatusChip icon={online ? 'wifi' : 'wifi-off'}
            label={online ? 'Internet Aktif' : 'Offline'} ok={online} />
        </View>

        {/* Action Header */}
        <SectionHeader
          title="Layanan Bantuan Cepat"
          subtitle="Tekan tombol di bawah untuk mengirim laporan darurat."
          style={styles.sectionHeader}
        />

        {/* Side-by-side circular Action Buttons */}
        <View style={styles.buttonContainer}>
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
            subtitle="Butuh bantuan / waspada"
            type="CAUTION"
            icon="alert-decagram"
            onPress={() => setConfirm({ visible: true, type: 'CAUTION' })}
            disabled={loading}
          />
        </View>

        {/* Instruction Accordion */}
        <View style={[styles.accordionContainer, elevation.sm, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleInstructions}
            style={styles.accordionHeader}
            accessibilityRole="button"
            accessibilityLabel="Petunjuk Darurat, ketuk untuk memperluas"
          >
            <View style={styles.accordionHeaderLeft}>
              <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
              <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>Petunjuk Darurat</Text>
            </View>
            <MaterialCommunityIcons
              name={instructionsExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {instructionsExpanded && (
            <View style={styles.accordionContent}>
              {INSTRUCTIONS.map((text, i) => (
                <View key={i} style={styles.instructionRow}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} style={styles.checkIcon} />
                  <Text style={[styles.instructionText, { color: colors.textPrimary }]}>{text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
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
          style={[
            msgInputStyles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.divider,
              color: colors.textPrimary,
            }
          ]}
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
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
    marginRight: spacing.sm,
  },
  welcomeText: { marginLeft: spacing.sm, flex: 1 },
  welcomeHi: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  welcomeName: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  clockColumn: {
    alignItems: 'flex-end',
    flex: 0.8,
  },
  time: {
    ...typography.bodyStrong,
    color: colors.onPrimary,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '700',
  },
  date: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  accordionContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accordionTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  accordionContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  checkIcon: {
    marginTop: 2,
  },
  instructionText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
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

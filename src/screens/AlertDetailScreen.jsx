import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { ref, update } from 'firebase/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../services/firebase';
import MapDisplay from '../components/MapDisplay';
import InfoCard from '../components/InfoCard';
import StatusBadge from '../components/StatusBadge';
import SectionHeader from '../components/SectionHeader';
import PrimaryButton from '../components/PrimaryButton';
import AppSnackbar from '../components/AppSnackbar';
import { alertTypeColors, colors, useThemeColors, useAlertTypeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, TOUCH_TARGET } from '../theme/spacing';
import { radius } from '../theme/radius';
import { elevation } from '../theme/elevation';

const STATUS_BUTTONS = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'RESPONDING', label: 'Proses' },
  { value: 'COMPLETED', label: 'Selesai' },
];

const formatTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

const DetailRow = ({ icon, label, value, multiline, colors }) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name={icon} size={22} color={colors.primary} style={styles.rowIcon} />
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textPrimary }]} numberOfLines={multiline ? undefined : 1}>{value || '-'}</Text>
    </View>
  </View>
);

const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

const AlertDetailScreen = ({ route }) => {
  const { alert } = route.params;
  const [status, setStatus] = useState(alert.status);
  const [updating, setUpdating] = useState(false);
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'success' });
  const colors = useThemeColors();

  const { base, on } = useAlertTypeColors(alert.type);
  const isEmergency = alert.type === 'EMERGENCY';

  const updateStatus = useCallback(async (newStatus) => {
    if (newStatus === status || updating) return;
    const prev = status;
    setStatus(newStatus);
    setUpdating(true);
    try {
      await update(ref(db, `alerts/${alert.alertId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setSnack({ visible: true, variant: 'success', message: 'Status laporan diperbarui.' });
    } catch {
      setStatus(prev); // revert optimistic update on failure
      setSnack({ visible: true, variant: 'error', message: 'Gagal memperbarui status.' });
    } finally {
      setUpdating(false);
    }
  }, [alert.alertId, status, updating]);

  const openInGoogleMaps = useCallback(async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      setSnack({ visible: true, variant: 'error', message: 'Tidak dapat membuka Google Maps.' });
    }
  }, [alert.latitude, alert.longitude]);

  const openWhatsApp = useCallback(async () => {
    if (!alert.phone) return;
    const normalized = normalizePhoneNumber(alert.phone);
    const text = encodeURIComponent(`Halo, saya petugas SiagaRW terkait laporan Anda.`);
    const appUrl = `whatsapp://send?phone=${normalized}&text=${text}`;
    const webUrl = `https://wa.me/${normalized}?text=${text}`;
    try {
      await Linking.openURL(appUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        setSnack({ visible: true, variant: 'error', message: 'Gagal membuka WhatsApp.' });
      }
    }
  }, [alert.phone]);

  const makeVoiceCall = useCallback(async () => {
    if (!alert.phone) return;
    const url = `tel:${alert.phone}`;
    try {
      await Linking.openURL(url);
    } catch {
      setSnack({ visible: true, variant: 'error', message: 'Tidak dapat memulai panggilan telepon.' });
    }
  }, [alert.phone]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.mapContainer, elevation.sm, { backgroundColor: colors.surfaceVariant }]}>
          <MapDisplay alert={alert} />
        </View>

        <PrimaryButton
          label="Buka di Google Maps"
          icon="google-maps"
          onPress={openInGoogleMaps}
          style={styles.mapsButton}
        />

        <View style={styles.contactRow}>
          <Pressable
            style={[styles.contactButton, styles.whatsappButton]}
            onPress={openWhatsApp}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            accessibilityRole="button"
            accessibilityLabel="Hubungi WhatsApp"
          >
            <MaterialCommunityIcons name="whatsapp" size={22} color={colors.onPrimary} style={styles.btnIcon} />
            <Text style={styles.contactBtnLabel}>WhatsApp</Text>
          </Pressable>

          <Pressable
            style={[styles.contactButton, styles.phoneButton]}
            onPress={makeVoiceCall}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            accessibilityRole="button"
            accessibilityLabel="Hubungi Telepon"
          >
            <MaterialCommunityIcons name="phone" size={22} color={colors.onPrimary} style={styles.btnIcon} />
            <Text style={styles.contactBtnLabel}>Telepon</Text>
          </Pressable>
        </View>

        <InfoCard style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.typeRow}>
              <MaterialCommunityIcons
                name={isEmergency ? 'alert-circle' : 'alert-decagram'}
                size={26}
                color={base}
              />
              <View style={styles.typeText}>
                <Text style={[styles.typeLabel, { color: base }]}>{isEmergency ? 'DARURAT' : 'SIAGA'}</Text>
                <Text style={styles.userName} numberOfLines={1}>{alert.userName}</Text>
              </View>
            </View>
            <StatusBadge status={status} />
          </View>

          <View style={styles.divider} />

          <DetailRow icon="phone" label="Nomor Ponsel" value={alert.phone} colors={colors} />
          <DetailRow icon="map-marker" label="Alamat" value={alert.address} multiline colors={colors} />
          <DetailRow icon="crosshairs-gps" label="Koordinat"
            value={`${alert.latitude?.toFixed(6)}, ${alert.longitude?.toFixed(6)}`} colors={colors} />
          <DetailRow icon="clock-outline" label="Waktu Lapor" value={formatTime(alert.createdAt)} colors={colors} />
          {!!alert.message && (
            <DetailRow icon="message-text-outline" label="Pesan Warga" value={alert.message} multiline colors={colors} />
          )}
        </InfoCard>

        <SectionHeader title="Perbarui Status Penanganan" style={styles.section} />
        <SegmentedButtons
          value={status}
          onValueChange={updateStatus}
          buttons={STATUS_BUTTONS.map((b) => ({ ...b, disabled: updating }))}
          style={styles.segmented}
        />
      </ScrollView>

      <AppSnackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        message={snack.message}
        variant={snack.variant}
        duration={2000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  mapContainer: {
    height: 260,
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
  },
  mapsButton: { marginTop: spacing.md },
  card: { marginTop: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  typeText: { marginLeft: spacing.md, flex: 1 },
  typeLabel: { ...typography.captionStrong, letterSpacing: 0.5 },
  userName: { ...typography.sectionTitle, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  row: { flexDirection: 'row', marginBottom: spacing.lg, alignItems: 'flex-start' },
  rowIcon: { marginTop: 2 },
  rowText: { marginLeft: spacing.md, flex: 1 },
  rowLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  rowValue: { ...typography.body, color: colors.textPrimary },
  section: { marginTop: spacing.xl },
  segmented: { marginTop: spacing.xs },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  contactButton: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.md,
    ...elevation.sm,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  phoneButton: {
    backgroundColor: colors.primaryVariant,
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
  contactBtnLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
});

export default AlertDetailScreen;

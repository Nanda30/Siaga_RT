import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { alertsApi } from '../api/endpoints';
import MapDisplay from '../components/MapDisplay';
import InfoCard from '../components/InfoCard';
import StatusBadge from '../components/StatusBadge';
import SectionHeader from '../components/SectionHeader';
import PrimaryButton from '../components/PrimaryButton';
import AppSnackbar from '../components/AppSnackbar';
import { alertTypeColors, colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

const DetailRow = ({ icon, label, value, multiline }) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name={icon} size={22} color={colors.primary} style={styles.rowIcon} />
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={multiline ? undefined : 1}>{value || '-'}</Text>
    </View>
  </View>
);

const AlertDetailScreen = ({ route }) => {
  const { alert } = route.params;
  const [status, setStatus] = useState(alert.status);
  const [updating, setUpdating] = useState(false);
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'success' });

  const isEmergency = alert.type === 'EMERGENCY';
  const alertId = alert.id || alert.alertId;
  const userName = alert.user?.name || alert.userName || 'Warga';
  const userPhone = alert.user?.phone || alert.phone || '-';

  const updateStatus = useCallback(async (newStatus) => {
    if (newStatus === status || updating) return;
    const prev = status;
    setStatus(newStatus);
    setUpdating(true);
    try {
      await alertsApi.updateStatus(alertId, newStatus);
      setSnack({ visible: true, variant: 'success', message: 'Status laporan berhasil diperbarui di server.' });
    } catch (err) {
      setStatus(prev);
      setSnack({ visible: true, variant: 'error', message: err.message || 'Gagal memperbarui status.' });
    } finally {
      setUpdating(false);
    }
  }, [alertId, status, updating]);

  const openInGoogleMaps = useCallback(async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      setSnack({ visible: true, variant: 'error', message: 'Tidak dapat membuka Google Maps.' });
    }
  }, [alert.latitude, alert.longitude]);

  const openWhatsApp = useCallback(async () => {
    let num = userPhone.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    const url = `https://wa.me/${num}`;
    try {
      await Linking.openURL(url);
    } catch {
      setSnack({ visible: true, variant: 'error', message: 'Tidak dapat membuka WhatsApp.' });
    }
  }, [userPhone]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.typeBanner, { backgroundColor: isEmergency ? colors.emergency : colors.caution }]}>
          <MaterialCommunityIcons
            name={isEmergency ? 'alert-octagon' : 'alert'}
            size={32}
            color="#FFFFFF"
          />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {isEmergency ? 'LAPORAN DARURAT' : 'LAPORAN SIAGA / WASPADA'}
            </Text>
            <Text style={styles.bannerSub}>{formatTime(alert.createdAt)}</Text>
          </View>
          <StatusBadge status={status} />
        </View>

        <SectionHeader title="Lokasi Kejadian" subtitle="Koordinat dan peta GPS pelapor" />
        <View style={[styles.card, elevation.sm]}>
          <MapDisplay
            latitude={alert.latitude}
            longitude={alert.longitude}
            title={userName}
            description={alert.address || 'Lokasi pelapor'}
            type={alert.type}
            style={styles.map}
          />
          <PrimaryButton
            label="Buka di Google Maps"
            icon="google-maps"
            mode="outlined"
            onPress={openInGoogleMaps}
            style={styles.mapsButton}
          />
        </View>

        <SectionHeader title="Identitas Pelapor" subtitle="Informasi kontak warga pelapor" />
        <View style={[styles.card, elevation.sm]}>
          <DetailRow icon="account" label="Nama Pelapor" value={userName} />
          <DetailRow icon="phone" label="Nomor Telepon" value={userPhone} />
          {userPhone !== '-' && (
            <PrimaryButton
              label="Hubungi via WhatsApp"
              icon="whatsapp"
              mode="contained"
              onPress={openWhatsApp}
              style={{ marginTop: spacing.md, backgroundColor: '#25D366' }}
            />
          )}
        </View>

        <SectionHeader title="Tindakan Petugas" subtitle="Perbarui status penanganan laporan ini" />
        <View style={[styles.card, elevation.sm]}>
          <SegmentedButtons
            value={status}
            onValueChange={updateStatus}
            buttons={STATUS_BUTTONS}
            disabled={updating}
          />
        </View>
      </ScrollView>

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
  typeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  bannerText: { flex: 1, marginLeft: spacing.md },
  bannerTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: 12, marginBottom: spacing.lg },
  map: { height: 180, borderRadius: 8, marginBottom: spacing.sm },
  mapsButton: { marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  rowIcon: { marginRight: spacing.sm },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12, color: colors.outline },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
});

export default AlertDetailScreen;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { alertsApi, dashboardApi } from '../api/endpoints';
import AlertCard from '../components/AlertCard';
import EmptyState from '../components/EmptyState';
import AppSnackbar from '../components/AppSnackbar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';

const FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'RESPONDING', label: 'Proses' },
  { key: 'COMPLETED', label: 'Selesai' },
];

const SummaryCard = ({ label, count, color, active }) => (
  <View style={[styles.summaryCard, elevation.sm, active && { borderColor: color, borderWidth: 2 }]}>
    <Text style={[styles.summaryCount, { color }]}>{count}</Text>
    <Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text>
  </View>
);

const AdminDashboardScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, responding: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [snack, setSnack] = useState({ visible: false, message: '', variant: 'error' });

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, dashRes] = await Promise.all([
        alertsApi.getAll({ limit: 50 }),
        dashboardApi.getSummary().catch(() => null),
      ]);

      setAlerts(alertsRes.alerts || []);
      if (dashRes && dashRes.counts) {
        setCounts(dashRes.counts);
      } else {
        const raw = alertsRes.alerts || [];
        setCounts({
          pending: raw.filter((a) => a.status === 'PENDING').length,
          responding: raw.filter((a) => a.status === 'RESPONDING').length,
          completed: raw.filter((a) => a.status === 'COMPLETED').length,
          total: raw.length,
        });
      }
    } catch (err) {
      setSnack({ visible: true, message: err.message || 'Gagal memuat data dari server.', variant: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Polling otomatis tiap 15 detik
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (filter !== 'ALL' && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.user?.name?.toLowerCase().includes(q) ||
        a.user?.phone?.toLowerCase().includes(q) ||
        a.address?.toLowerCase().includes(q)
      );
    });
  }, [alerts, filter, search]);

  const renderHeader = () => (
    <View>
      <View style={styles.summaryRow}>
        <SummaryCard label="Menunggu" count={counts.pending} color={colors.emergency} active={filter === 'PENDING'} />
        <SummaryCard label="Proses" count={counts.responding} color={colors.caution} active={filter === 'RESPONDING'} />
        <SummaryCard label="Selesai" count={counts.completed} color={colors.success} active={filter === 'COMPLETED'} />
      </View>

      <Searchbar
        placeholder="Cari nama, no. HP, lokasi..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        elevation={1}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Text
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            {f.label}
          </Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Menghubungkan ke Server SiapSiaga...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={{
              alertId: item.id,
              userId: item.userId,
              userName: item.user?.name || 'Warga',
              phone: item.user?.phone || '-',
              type: item.type,
              status: item.status,
              createdAt: item.createdAt,
              address: item.address,
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            onPress={() => navigation.navigate('AlertDetail', { alert: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState title="Tidak Ada Laporan" message="Belum ada laporan warga pada filter ini." />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      />

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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, color: colors.outline, ...typography.body },
  list: { padding: spacing.lg },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryCount: { ...typography.screenTitle, fontWeight: '700' },
  summaryLabel: { ...typography.caption, color: colors.outline, marginTop: 2 },
  searchbar: { marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: 12 },
  searchInput: { minHeight: 44 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    color: colors.outline,
    ...typography.caption,
    fontWeight: '600',
  },
  filterChipActive: { backgroundColor: colors.primary, color: colors.onPrimary },
});

export default AdminDashboardScreen;

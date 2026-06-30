import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../services/firebase';
import AlertCard from '../components/AlertCard';
import EmptyState from '../components/EmptyState';
import AppSnackbar from '../components/AppSnackbar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { elevation } from '../theme/elevation';

const FILTERS = [
  { key: 'ALL', label: 'Semua', icon: 'format-list-bulleted' },
  { key: 'PENDING', label: 'Menunggu', icon: 'clock-alert' },
  { key: 'RESPONDING', label: 'Ditangani', icon: 'progress-wrench' },
  { key: 'COMPLETED', label: 'Selesai', icon: 'check-circle' },
];

const SummaryCard = ({ label, count, color, active }) => (
  <View style={[styles.summaryCard, elevation.sm, active && { borderColor: color, borderWidth: 2 }]}>
    <Text style={[styles.summaryCount, { color }]}>{count}</Text>
    <Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text>
  </View>
);

const AdminDashboardScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(false);

  useEffect(() => {
    const alertsRef = query(ref(db, 'alerts'), orderByChild('createdAt'));
    const unsubscribe = onValue(
      alertsRef,
      (snapshot) => {
        const data = snapshot.val();
        const list = data
          ? Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          : [];
        setAlerts(list);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const counts = useMemo(() => ({
    PENDING: alerts.filter((a) => a.status === 'PENDING').length,
    RESPONDING: alerts.filter((a) => a.status === 'RESPONDING').length,
    COMPLETED: alerts.filter((a) => a.status === 'COMPLETED').length,
  }), [alerts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (filter !== 'ALL' && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.userName?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.address?.toLowerCase().includes(q)
      );
    });
  }, [alerts, search, filter]);

  const renderItem = useCallback(
    ({ item }) => (
      <AlertCard alert={item} onPress={() => navigation.navigate('AlertDetail', { alert: item })} />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item) => item.alertId, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat laporan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.summaryRow}>
              <SummaryCard label="Menunggu" count={counts.PENDING} color={colors.emergency} active={filter === 'PENDING'} />
              <SummaryCard label="Ditangani" count={counts.RESPONDING} color={colors.warning} active={filter === 'RESPONDING'} />
              <SummaryCard label="Selesai" count={counts.COMPLETED} color={colors.success} active={filter === 'COMPLETED'} />
            </View>

            <Searchbar
              placeholder="Cari nama, telepon, alamat"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
              inputStyle={typography.body}
              elevation={1}
            />

            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(f) => f.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item: f }) => {
                const active = filter === f.key;
                return (
                  <Text
                    onPress={() => setFilter(f.key)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    {f.label}
                  </Text>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="shield-check"
            title={search || filter !== 'ALL' ? 'Tidak ada hasil' : 'Belum ada laporan'}
            message={search || filter !== 'ALL'
              ? 'Coba ubah kata kunci atau filter.'
              : 'Laporan dari warga akan muncul di sini secara langsung.'}
          />
        }
      />

      <AppSnackbar
        visible={error}
        onDismiss={() => setError(false)}
        message="Gagal memuat laporan. Periksa koneksi internet."
        variant="error"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  list: { padding: spacing.lg, flexGrow: 1 },
  summaryRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  summaryCount: { ...typography.screenTitle },
  summaryLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  search: { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.md },
  filterRow: { gap: spacing.sm, paddingBottom: spacing.lg },
  filterChip: {
    ...typography.captionStrong,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  filterChipActive: {
    color: colors.onPrimary,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default AdminDashboardScreen;

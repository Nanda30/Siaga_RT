import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Surface, Badge, Card, List, Divider, ActivityIndicator } from 'react-native-paper';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AdminDashboardScreen = ({ navigation }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const alertsRef = query(ref(db, 'alerts'), orderByChild('createdAt'));

        // Real-time listener for alerts
        const unsubscribe = onValue(alertsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sortedAlerts = Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
                setAlerts(sortedAlerts);
            } else {
                setAlerts([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF5252';
            case 'RESPONDING': return '#FFD740';
            case 'COMPLETED': return '#4CAF50';
            default: return '#999';
        }
    };

    const renderItem = ({ item }) => (
        <Card
            style={styles.card}
            onPress={() => navigation.navigate('AlertDetail', { alert: item })}
        >
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                        <MaterialCommunityIcons
                            name={item.type === 'EMERGENCY' ? 'alert-circle' : 'alert-decagram'}
                            size={24}
                            color={item.type === 'EMERGENCY' ? '#FF5252' : '#FFD740'}
                        />
                        <Text style={[styles.typeText, { color: item.type === 'EMERGENCY' ? '#FF5252' : '#FFD740' }]}>
                            {item.type}
                        </Text>
                    </View>
                    <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        {item.status}
                    </Badge>
                </View>

                <Text variant="titleMedium" style={styles.userName}>{item.userName}</Text>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="phone" size={16} color="rgba(255,255,255,0.6)" />
                    <Text variant="bodySmall" style={styles.infoText}>{item.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255,255,255,0.6)" />
                    <Text variant="bodySmall" style={styles.infoText} numberOfLines={1}>{item.address}</Text>
                </View>

                <Divider style={styles.divider} />

                <Text variant="labelSmall" style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleString('id-ID')}
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Surface style={styles.header} elevation={1}>
                <Text variant="titleLarge" style={styles.headerTitle}>Monitoring Laporan</Text>
                <Text variant="bodySmall" style={styles.headerSubtitle}>
                    {alerts.length} Laporan Diterima
                </Text>
            </Surface>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator animating={true} color="#BB86FC" size="large" />
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.alertId}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="shield-check" size={80} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>Tidak ada laporan aktif</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 20,
        backgroundColor: '#1E1E1E',
    },
    headerTitle: {
        color: '#BB86FC',
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#1E1E1E',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        marginLeft: 6,
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 12,
    },
    userName: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        color: 'rgba(255, 255, 255, 0.7)',
        marginLeft: 8,
    },
    divider: {
        marginVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeText: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'right',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 18,
    },
});

export default AdminDashboardScreen;

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Linking } from 'react-native';
import { Text, Surface, Button, Divider, SegmentedButtons, Snackbar, Card } from 'react-native-paper';
import { ref, update } from 'firebase/database';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapDisplay from '../components/MapDisplay';

const { width } = Dimensions.get('window');

const AlertDetailScreen = ({ route, navigation }) => {
    const { alert } = route.params;
    const [status, setStatus] = useState(alert.status);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    const updateStatus = async (newStatus) => {
        setLoading(true);
        try {
            await update(ref(db, `alerts/${alert.alertId}`), {
                status: newStatus,
                updatedAt: new Date().toISOString(),
            });
            setStatus(newStatus);
            setMessage('Status laporan diperbarui');
            setVisible(true);
        } catch (error) {
            console.error(error);
            setMessage('Gagal memperbarui status');
            setVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`;
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Map View */}
                <Surface style={styles.mapContainer} elevation={2}>
                    <MapDisplay alert={alert} />
                    <Button
                        mode="contained"
                        icon="google-maps"
                        style={styles.mapButton}
                        onPress={openInGoogleMaps}
                    >
                        BUKA MAPS
                    </Button>
                </Surface>

                <View style={styles.content}>
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <View style={styles.headerRow}>
                                <Text variant="headlineSmall" style={styles.userName}>{alert.userName}</Text>
                                <Surface
                                    style={[
                                        styles.typeTag,
                                        { backgroundColor: alert.type === 'EMERGENCY' ? '#FF5252' : '#FFD740' }
                                    ]}
                                >
                                    <Text style={[styles.typeTagText, { color: alert.type === 'EMERGENCY' ? '#fff' : '#000' }]}>
                                        {alert.type}
                                    </Text>
                                </Surface>
                            </View>

                            <Divider style={styles.divider} />

                            <ListRow icon="phone" label="Ponsel" value={alert.phone} />
                            <ListRow icon="map-marker" label="Alamat" value={alert.address} multiline />
                            <ListRow icon="clock-outline" label="Waktu" value={new Date(alert.createdAt).toLocaleString('id-ID')} />
                        </Card.Content>
                    </Card>

                    <Text variant="titleMedium" style={styles.sectionTitle}>Update Status Penanganan</Text>
                    <SegmentedButtons
                        value={status}
                        onValueChange={updateStatus}
                        buttons={[
                            { value: 'PENDING', label: 'PENDING', checkedColor: '#FF5252' },
                            { value: 'RESPONDING', label: 'PROSES', checkedColor: '#FFD740' },
                            { value: 'COMPLETED', label: 'SELESAI', checkedColor: '#4CAF50' },
                        ]}
                        style={styles.segmented}
                    />
                </View>
            </ScrollView>

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={2000}
            >
                {message}
            </Snackbar>
        </View>
    );
};

const ListRow = ({ icon, label, value, multiline }) => (
    <View style={styles.row}>
        <MaterialCommunityIcons name={icon} size={24} color="#BB86FC" style={styles.rowIcon} />
        <View style={styles.rowText}>
            <Text variant="labelSmall" style={styles.rowLabel}>{label}</Text>
            <Text variant="bodyLarge" style={styles.rowValue} numberOfLines={multiline ? undefined : 1}>
                {value}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    mapContainer: {
        height: 300,
        width: '100%',
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        borderRadius: 30,
    },
    content: {
        padding: 16,
    },
    infoCard: {
        backgroundColor: '#1E1E1E',
        marginBottom: 24,
        borderRadius: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    typeTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    typeTagText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    divider: {
        marginVertical: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    rowIcon: {
        marginTop: 4,
    },
    rowText: {
        marginLeft: 16,
        flex: 1,
    },
    rowLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 2,
    },
    rowValue: {
        color: '#fff',
    },
    sectionTitle: {
        color: '#BB86FC',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    segmented: {
        marginBottom: 30,
    },
});

export default AlertDetailScreen;

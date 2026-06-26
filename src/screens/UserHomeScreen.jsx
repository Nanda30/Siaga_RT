import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Divider, Portal, Dialog, Button, Snackbar, ActivityIndicator } from 'react-native-paper';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { db } from '../services/firebase';
import { getCurrentLocation } from '../services/location';
import AlertButton from '../components/AlertButton';

const UserHomeScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ visible: false, type: '' });

    const sendAlert = async (type) => {
        setLoading(true);
        setConfirmDialog({ visible: false, type: '' });

        try {
            // 1. Get current location
            const location = await getCurrentLocation();

            // 2. Create alert object
            const alertId = push(ref(db, 'alerts')).key;
            const alertData = {
                alertId,
                userId: user.uid,
                userName: user.name,
                phone: user.phone,
                type: type, // EMERGENCY or CAUTION
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
                status: 'PENDING',
                createdAt: serverTimestamp(),
            };

            // 3. Save to Firebase
            await set(ref(db, `alerts/${alertId}`), alertData);

            setSnackbarMessage(`Laporan ${type === 'EMERGENCY' ? 'Darurat' : 'Siaga'} Terkirim!`);
            setSnackbarVisible(true);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Gagal mengirim laporan: ' + error.message);
            setSnackbarVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const showConfirm = (type) => {
        setConfirmDialog({ visible: true, type });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Surface style={styles.header} elevation={1}>
                    <Text variant="titleMedium" style={styles.welcome}>Halo, {user.name}</Text>
                    <Text variant="bodySmall" style={styles.phone}>{user.phone}</Text>
                </Surface>

                <View style={styles.buttonContainer}>
                    <Text variant="headlineSmall" style={styles.sectionTitle}>Bantuan Cepat</Text>
                    <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                        Tekan tombol di bawah untuk melaporkan kejadian di lingkungan Anda.
                    </Text>

                    <AlertButton
                        title="DARURAT"
                        type="EMERGENCY"
                        icon="alert-circle"
                        onPress={() => showConfirm('EMERGENCY')}
                        loading={loading}
                    />

                    <AlertButton
                        title="SIAGA / CAUTION"
                        type="CAUTION"
                        icon="alert-decagram"
                        onPress={() => showConfirm('CAUTION')}
                        loading={loading}
                    />
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} color="#BB86FC" size="large" />
                        <Text style={styles.loadingText}>Mengambil lokasi dan mengirim laporan...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Dialog */}
            <Portal>
                <Dialog
                    visible={confirmDialog.visible}
                    onDismiss={() => setConfirmDialog({ visible: false, type: '' })}
                    style={styles.dialog}
                >
                    <Dialog.Title>Konfirmasi Laporan</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Apakah Anda yakin ingin mengirim laporan {confirmDialog.type === 'EMERGENCY' ? 'Darurat (Merah)' : 'Siaga (Kuning)'}?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setConfirmDialog({ visible: false, type: '' })}>Batal</Button>
                        <Button
                            onPress={() => sendAlert(confirmDialog.type)}
                            textColor={confirmDialog.type === 'EMERGENCY' ? '#FF5252' : '#FFD740'}
                        >
                            KIRIM
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        paddingBottom: 20,
    },
    header: {
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
    },
    welcome: {
        color: '#BB86FC',
        fontWeight: 'bold',
    },
    phone: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    buttonContainer: {
        padding: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 20,
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#BB86FC',
    },
    dialog: {
        backgroundColor: '#1E1E1E',
    }
});

export default UserHomeScreen;

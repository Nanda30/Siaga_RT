import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Surface, Snackbar, ActivityIndicator } from 'react-native-paper';
import { ref, set } from 'firebase/database';
import { db } from '../services/firebase';
import { useTheme } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Warga');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [visible, setVisible] = useState(false);

    const handleLogin = async () => {
        if (!name || !phone) {
            setError('Harap isi nama dan nomor telepon');
            setVisible(true);
            return;
        }

        setLoading(true);
        try {
            // Simple unique ID based on phone number (for Phase 1)
            const uid = phone.replace(/[^0-9]/g, '');

            // Save user profile to Firebase
            await set(ref(db, `users/${uid}`), {
                uid,
                name,
                phone,
                role,
                createdAt: new Date().toISOString(),
            });

            setLoading(false);

            // Navigate based on role
            if (role === 'Warga') {
                navigation.replace('UserHome', { user: { uid, name, phone, role } });
            } else {
                navigation.replace('AdminDashboard', { user: { uid, name, phone, role } });
            }
        } catch (err) {
            setLoading(false);
            setError('Gagal masuk: ' + err.message);
            setVisible(true);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface} elevation={2}>
                    <Text variant="headlineMedium" style={styles.title}>SiagaRT</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>Sistem Informasi Keamanan Warga</Text>

                    <TextInput
                        label="Nama Lengkap"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                    />

                    <TextInput
                        label="Nomor Telepon"
                        value={phone}
                        onChangeText={setPhone}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                    />

                    <Text style={styles.label}>Pilih Peran:</Text>
                    <SegmentedButtons
                        value={role}
                        onValueChange={setRole}
                        buttons={[
                            { value: 'Warga', label: 'Warga' },
                            { value: 'Satpam', label: 'Satpam' },
                        ]}
                        style={styles.segmented}
                    />

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        MASUK
                    </Button>
                </Surface>
            </ScrollView>

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                action={{
                    label: 'OK',
                    onPress: () => setVisible(false),
                }}
            >
                {error}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    surface: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        color: '#BB86FC',
        marginBottom: 4,
    },
    subtitle: {
        color: '#rgba(255, 255, 255, 0.7)',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        alignSelf: 'start',
        marginBottom: 8,
        color: '#fff',
        fontSize: 16,
    },
    segmented: {
        width: '100%',
        marginBottom: 24,
    },
    button: {
        width: '100%',
        marginTop: 10,
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});

export default LoginScreen;

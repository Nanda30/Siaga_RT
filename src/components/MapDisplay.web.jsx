import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MapDisplay = ({ alert }) => {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.title}>Map rendering disabled on Web</Text>
            <Text style={styles.text}>Koordinat: {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</Text>
            <Text style={styles.text} numberOfLines={2}>Alamat: {alert.address}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#2C2C2C',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        color: '#fff',
        marginTop: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default MapDisplay;

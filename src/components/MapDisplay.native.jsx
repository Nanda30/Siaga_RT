import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MapDisplay = ({ alert }) => {
    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
                latitude: alert.latitude,
                longitude: alert.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }}
        >
            <Marker
                coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}
                title={alert.userName}
                description={alert.type}
                pinColor={alert.type === 'EMERGENCY' ? 'red' : 'orange'}
            />
        </MapView>
    );
};

export default MapDisplay;

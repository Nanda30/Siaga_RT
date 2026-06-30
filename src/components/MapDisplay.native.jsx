import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { alertTypeColors, colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Native map with a single marker at the alert location.
 * Falls back to a message if coordinates are missing/invalid.
 */
const MapDisplay = ({ alert }) => {
  const hasCoords =
    typeof alert?.latitude === 'number' && typeof alert?.longitude === 'number';

  if (!hasCoords) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Lokasi tidak tersedia</Text>
      </View>
    );
  }

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
        pinColor={alertTypeColors(alert.type).base}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fallbackText: { ...typography.body, color: colors.textSecondary },
});

export default MapDisplay;

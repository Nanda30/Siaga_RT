import * as Location from 'expo-location';

/**
 * Request location permissions
 */
export const requestLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
};

/**
 * Get current geographical location and address
 */
export const getCurrentLocation = async () => {
    try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        // Reverse geocode to get address
        const addressDetails = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        let address = 'Address not found';
        if (addressDetails.length > 0) {
            const { street, name, district, city, region, postalCode } = addressDetails[0];
            address = `${name || street || ''}, ${district || ''}, ${city || ''}, ${region || ''} ${postalCode || ''}`.replace(/, ,/g, ',').trim();
        }

        return {
            latitude,
            longitude,
            address,
        };
    } catch (error) {
        console.error('Error getting location:', error);
        throw error;
    }
};

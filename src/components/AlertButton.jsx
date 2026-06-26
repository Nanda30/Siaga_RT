import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AlertButton = ({ title, type, onPress, icon, loading }) => {
    const isEmergency = type === 'EMERGENCY';
    const color = isEmergency ? '#FF5252' : '#FFD740';
    const textColor = isEmergency ? '#FFFFFF' : '#121212';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={loading}
            style={styles.touchable}
        >
            <Surface style={[styles.surface, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={icon} size={48} color={textColor} />
                <Text variant="titleLarge" style={[styles.text, { color: textColor }]}>
                    {title}
                </Text>
            </Surface>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        width: '100%',
        marginVertical: 12,
    },
    surface: {
        height: 140,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    text: {
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default AlertButton;

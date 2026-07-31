import React from 'react';
import { Appbar } from 'react-native-paper';
import { useThemeContext } from '../theme/ThemeContext';
import { useThemeColors } from '../theme/colors';

/**
 * Appbar Action Button to switch between light and dark themes.
 * Dynamically resolves icons: weather-sunny for dark mode (to go bright)
 * and weather-night for light mode (to go dark).
 */
const ThemeToggle = ({ color }) => {
    const { isDark, toggleTheme } = useThemeContext();
    const colors = useThemeColors();

    return (
        <Appbar.Action
            icon={isDark ? 'weather-sunny' : 'weather-night'}
            color={color || colors.onPrimary}
            accessibilityLabel={isDark ? 'Ubah ke mode terang' : 'Ubah ke mode gelap'}
            onPress={toggleTheme}
        />
    );
};

export default ThemeToggle;

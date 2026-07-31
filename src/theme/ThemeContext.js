import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();

    // Set default state based on system scheme initially
    const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'

    const toggleTheme = () => {
        setThemeMode((prev) => {
            // If currently using dark (either explicit or system)
            const currentIsDark = prev === 'system' ? systemScheme === 'dark' : prev === 'dark';
            return currentIsDark ? 'light' : 'dark';
        });
    };

    const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);

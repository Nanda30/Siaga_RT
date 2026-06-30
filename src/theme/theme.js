import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';

export { colors } from './colors';
export { typography } from './typography';
export { spacing, TOUCH_TARGET } from './spacing';
export { radius } from './radius';
export { elevation } from './elevation';

// Bump default Paper font sizes for readability (users aged 40+).
const fontConfig = {
  bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontSize: 16, lineHeight: 24 },
  bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontSize: 15, fontWeight: '600' },
};

// Light, public-safety Paper theme. Maps our palette onto MD3 tokens.
export const theme = {
  ...MD3LightTheme,
  roundness: 3,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.surfaceVariant,
    secondary: colors.primaryVariant,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.divider,
    outlineVariant: colors.divider,
    error: colors.error,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  // Custom tokens (not part of MD3) for direct access in components.
  custom: { colors, typography },
};

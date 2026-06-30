import { Platform } from 'react-native';

// Cross-platform shadow presets. On Android uses elevation; on iOS/web uses shadow*.
const shadow = (elevation, opacity, radius, offsetY) =>
  Platform.select({
    android: { elevation },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
  });

export const elevation = {
  none: Platform.select({ android: { elevation: 0 }, default: {} }),
  sm: shadow(2, 0.08, 4, 1),
  md: shadow(4, 0.12, 8, 2),
  lg: shadow(8, 0.16, 16, 4),
};

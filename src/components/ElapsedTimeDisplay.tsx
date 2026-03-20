import { Text, StyleSheet, type TextStyle } from 'react-native';
import { useElapsedTime } from '../hooks/useElapsedTime';
import { TYPOGRAPHY } from '../constants/fonts';
import { COLORS } from '../constants/theme';

interface Props {
  date: string;
  time: string | null;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function ElapsedTimeDisplay({ date, time, style, size = 'md' }: Props) {
  const formatted = useElapsedTime(date, time);
  return <Text style={[styles.base, styles[size], style]}>{formatted}</Text>;
}

const styles = StyleSheet.create({
  base: { ...TYPOGRAPHY.mono, color: COLORS.textMuted },
  sm: { fontSize: 12 },
  md: { fontSize: 16 },
  lg: { fontSize: 28, fontFamily: TYPOGRAPHY.monoLg.fontFamily, color: COLORS.onSurface },
});

import { Text, StyleSheet, type TextStyle } from 'react-native';
import { useElapsedTime } from '../hooks/useElapsedTime';
import { FONTS } from '../constants/fonts';
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
  base: { fontFamily: FONTS.mono, color: COLORS.text },
  sm: { fontSize: 12 },
  md: { fontSize: 16 },
  lg: { fontSize: 28 },
});

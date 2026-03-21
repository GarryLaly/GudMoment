import { Text, StyleSheet, type TextStyle } from 'react-native';
import { useElapsedTime } from '../hooks/useElapsedTime';
import { TYPOGRAPHY } from '../constants/fonts';
import { useTheme } from '../hooks/useTheme';

interface Props {
  date: string;
  time: string | null;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function ElapsedTimeDisplay({ date, time, style, size = 'md' }: Props) {
  const { colors } = useTheme();
  const formatted = useElapsedTime(date, time);

  return (
    <Text
      style={[
        styles.base,
        { color: colors.textMuted },
        styles[size],
        size === 'lg' && { color: colors.onSurface },
        style,
      ]}
    >
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { ...TYPOGRAPHY.mono },
  sm: { fontSize: 12 },
  md: { fontSize: 16 },
  lg: { fontSize: 28, fontFamily: TYPOGRAPHY.monoLg.fontFamily },
});

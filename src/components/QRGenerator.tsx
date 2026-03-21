import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BORDERS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
  value: string;
  size?: number;
}

export function QRGenerator({ value, size = 250 }: Props) {
  const { colors, borders } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
      <QRCode value={value} size={size} backgroundColor={colors.surfaceContainerLowest} color={colors.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderWidth: BORDERS.width,
    alignItems: 'center',
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});

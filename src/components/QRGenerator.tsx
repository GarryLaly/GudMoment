import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, BORDERS, SPACING } from '../constants/theme';

interface Props {
  value: string;
  size?: number;
}

export function QRGenerator({ value, size = 250 }: Props) {
  return (
    <View style={styles.container}>
      <QRCode value={value} size={size} backgroundColor={COLORS.surfaceContainerLowest} color={COLORS.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});

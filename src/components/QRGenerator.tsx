import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, BORDERS } from '../constants/theme';

interface Props {
  value: string;
  size?: number;
}

export function QRGenerator({ value, size = 250 }: Props) {
  return (
    <View style={styles.container}>
      <QRCode value={value} size={size} backgroundColor={COLORS.surface} color={COLORS.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
});

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decodeMomentFromQR } from '../utils/qrCodec';
import { useMoments } from '../hooks/useMoments';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { addMoment } = useMoments();
  const router = useRouter();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const payload = decodeMomentFromQR(data);
    if (!payload) {
      Alert.alert('Invalid QR', "This QR doesn't contain a valid moment", [
        { text: 'Try Again', onPress: () => setScanned(false) },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
      return;
    }

    await addMoment({
      title: payload.title,
      date: payload.date,
      time: payload.time,
      timezone: payload.timezone,
      emoji: payload.icon,
      color: payload.color,
    });

    Alert.alert('Moment Added!', `"${payload.title}" has been saved`, [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permText}>Camera permission needed to scan QR codes</Text>
        <Pressable style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Scan Moment</Text>
        <View style={{ width: 60 }} />
      </View>
      <Text style={styles.instruction}>Point camera at a GudMoment QR code</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View style={styles.frame} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.text },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
  instruction: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.text, textAlign: 'center', padding: SPACING.md },
  cameraContainer: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  frame: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '50%',
    borderWidth: BORDERS.width + 1,
    borderColor: COLORS.primary,
  },
  permText: { fontFamily: FONTS.body, fontSize: 18, color: COLORS.text, textAlign: 'center', padding: SPACING.xl },
  permButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    margin: SPACING.xl,
    alignItems: 'center',
  },
  permButtonText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.surface },
});

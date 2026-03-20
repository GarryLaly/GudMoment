import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrosshairSimpleIcon, CheckCircleIcon } from 'phosphor-react-native';
import { decodeMomentFromQR } from '../utils/qrCodec';
import { useMoments } from '../hooks/useMoments';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';

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

  // Permission state
  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permCard}>
          <CrosshairSimpleIcon size={64} color={COLORS.onSurface} weight="bold" />
          <Text style={styles.permTitle}>Camera Access</Text>
          <Text style={styles.permText}>Camera permission is needed to scan QR codes</Text>
          <Pressable
            style={({ pressed }) => [styles.permButton, pressed && styles.permButtonPressed]}
            onPress={requestPermission}
          >
            <Text style={styles.permButtonText}>GRANT PERMISSION</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.scanContainer}>
      {/* Camera fills entire background */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay content */}
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Header - Logo chip */}
        <View style={styles.header}>
          <View style={styles.logoChip}>
            <Text style={styles.logoText}>GudMoment</Text>
          </View>
        </View>

        {/* Center area with instruction + frame */}
        <View style={styles.centerArea}>
          {/* Moment Found tooltip */}
          {scanned && (
            <View style={styles.foundTooltip}>
              <CheckCircleIcon size={22} color={COLORS.onPrimary} weight="fill" />
              <Text style={styles.foundText}>MOMENT FOUND!</Text>
            </View>
          )}

          {/* Instruction tag */}
          {!scanned && (
            <View style={styles.instructionTag}>
              <Text style={styles.instructionText}>POSITION QR CODE WITHIN THE FRAME</Text>
            </View>
          )}

          {/* Scanner frame */}
          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              <View style={styles.frameInner} />
            </View>

            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const FRAME_SIZE = 288;
const CORNER_SIZE = 48;
const CORNER_BORDER = 8;
const CORNER_OFFSET = -16;

const styles = StyleSheet.create({
  // Permission screen
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLow },
  permCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.page,
  },
  permTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onSurface,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  permButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  permButtonPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  permButtonText: {
    ...TYPOGRAPHY.title,
    color: COLORS.onPrimary,
    textTransform: 'uppercase',
  },

  // Scanner screen
  scanContainer: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  logoChip: {
    backgroundColor: COLORS.accentYellow,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },

  // Center area
  centerArea: {
    alignItems: 'center',
    gap: SPACING.md,
  },

  // Found tooltip
  foundTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.momentTeal,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: SPACING.sm,
  },
  foundText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onPrimary,
    fontSize: 18,
  },

  // Instruction
  instructionTag: {
    backgroundColor: COLORS.accentYellow,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontFamily: FONTS.monoBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.onSurface,
  },

  // Frame
  frameContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 6,
    borderColor: COLORS.onSurface,
    padding: 4,
  },
  frameInner: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.momentTeal + '80',
  },

  // Corners
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: CORNER_OFFSET,
    left: CORNER_OFFSET,
    borderTopWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderColor: COLORS.onSurface,
  },
  cornerTR: {
    top: CORNER_OFFSET,
    right: CORNER_OFFSET,
    borderTopWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderColor: COLORS.onSurface,
  },
  cornerBL: {
    bottom: CORNER_OFFSET,
    left: CORNER_OFFSET,
    borderBottomWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderColor: COLORS.onSurface,
  },
  cornerBR: {
    bottom: CORNER_OFFSET,
    right: CORNER_OFFSET,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderColor: COLORS.onSurface,
  },

  // Bottom controls
  bottomControls: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cancelButtonPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 6 }, { translateY: 6 }],
  },
  cancelText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    fontSize: 20,
  },
});

import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, DotsThreeVerticalIcon, DownloadSimpleIcon, ShareNetworkIcon, LinkIcon } from 'phosphor-react-native';
import { QRGenerator } from '../../../components/QRGenerator';
import { getMomentById } from '../../../db/moments';
import { encodeMomentForQR } from '../../../utils/qrCodec';
import { COLORS, BORDERS, SPACING } from '../../../constants/theme';
import { FONTS, TYPOGRAPHY } from '../../../constants/fonts';

export default function QRScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [qrData, setQrData] = useState<string | null>(null);
  const [momentTitle, setMomentTitle] = useState('');
  const [momentDate, setMomentDate] = useState('');
  const [momentEmoji, setMomentEmoji] = useState('');

  useEffect(() => {
    if (!id) return;
    getMomentById(id).then((m) => {
      if (!m) return;
      setMomentTitle(m.title);
      setMomentDate(m.date);
      setMomentEmoji(m.emoji);
      setQrData(encodeMomentForQR({
        v: 1,
        title: m.title,
        date: m.date,
        time: m.time || undefined,
        timezone: m.timezone,
        icon: m.emoji,
        color: m.color,
      }));
    });
  }, [id]);

  if (!qrData) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => router.back()}
        >
          <ArrowLeftIcon size={22} color={COLORS.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>SHARE MOMENT</Text>
        <Pressable style={styles.menuButton}>
          <DotsThreeVerticalIcon size={24} color={COLORS.onSurface} weight="bold" />
        </Pressable>
      </View>

      {/* Ticket Card */}
      <View style={styles.ticketWrapper}>
        <View style={styles.ticket}>
          {/* Top Section */}
          <View style={styles.ticketTop}>
            <Text style={styles.ticketEmoji}>{momentEmoji}</Text>
            <Text style={styles.ticketTitle}>{momentTitle}</Text>
            <View style={styles.dateTag}>
              <Text style={styles.dateTagText}>
                {new Date(momentDate).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Middle Section - QR */}
          <View style={styles.ticketMiddle}>
            {/* Perforated edge - left */}
            <View style={[styles.perforatedCircle, styles.perforatedLeft]} />
            {/* Perforated edge - right */}
            <View style={[styles.perforatedCircle, styles.perforatedRight]} />

            <View style={styles.qrBox}>
              <QRGenerator value={qrData} size={200} />
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.ticketBottom}>
            <Text style={styles.instructionText}>SCAN WITH GUDMOMENT APP</Text>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>GM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={({ pressed }) => [styles.downloadButton, pressed && styles.buttonPressed]}
        >
          <DownloadSimpleIcon size={22} color={COLORS.onSurface} weight="bold" />
          <Text style={styles.downloadText}>DOWNLOAD IMAGE</Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.shareButton, pressed && styles.buttonPressed]}
            onPress={() => Share.share({ message: `Check out this moment: ${momentTitle}` })}
          >
            <ShareNetworkIcon size={22} color={COLORS.onSurface} weight="bold" />
            <Text style={styles.actionButtonText}>SHARE</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.linkButton, pressed && styles.buttonPressed]}
          >
            <LinkIcon size={22} color={COLORS.onSurface} weight="bold" />
            <Text style={styles.actionButtonText}>LINK</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLow },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.page,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backButtonPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    flex: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Ticket
  ticketWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.page,
  },
  ticket: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'visible',
  },

  // Ticket Top
  ticketTop: {
    backgroundColor: COLORS.primaryContainer,
    padding: SPACING.lg,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  ticketEmoji: { fontSize: 60, marginBottom: SPACING.sm },
  ticketTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  dateTag: {
    backgroundColor: COLORS.onSurface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  dateTagText: {
    ...TYPOGRAPHY.monoXs,
    color: COLORS.onPrimary,
  },

  // Ticket Middle
  ticketMiddle: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  perforatedCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  perforatedLeft: {
    left: -16,
    top: '50%',
    marginTop: -16,
  },
  perforatedRight: {
    right: -16,
    top: '50%',
    marginTop: -16,
  },
  qrBox: {
    alignItems: 'center',
  },

  // Ticket Bottom
  ticketBottom: {
    backgroundColor: COLORS.surfaceContainerHigh,
    padding: SPACING.lg,
    borderTopWidth: BORDERS.width,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  instructionText: {
    ...TYPOGRAPHY.monoSm,
    color: COLORS.textMuted,
  },
  logoBadge: {
    backgroundColor: COLORS.accentYellow,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: SPACING.page,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.tertiaryContainer,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  downloadText: {
    ...TYPOGRAPHY.title,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  shareButton: {
    backgroundColor: COLORS.secondaryContainer,
  },
  linkButton: {
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  actionButtonText: {
    ...TYPOGRAPHY.title,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
  },
  buttonPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
});

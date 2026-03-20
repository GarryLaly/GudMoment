import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeftIcon, ArrowsClockwiseIcon } from 'phosphor-react-native';
import { MomentForm } from '../../../components/MomentForm';
import { useMoments } from '../../../hooks/useMoments';
import { getMomentById, type Moment } from '../../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../../constants/theme';
import { FONTS, TYPOGRAPHY } from '../../../constants/fonts';

export default function EditMomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { editMoment } = useMoments();
  const router = useRouter();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    if (id) getMomentById(id).then(setMoment);
  }, [id]);

  if (!moment) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const archiveId = `#GM-${moment.id.slice(-5).toUpperCase()}`;
  const capturedDate = moment.date
    ? new Date(moment.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const capturedTime = moment.time
    ? moment.time.slice(0, 5)
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={[styles.backBtn, backPressed && styles.backBtnPressed]}
          onPress={() => router.back()}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
        >
          <ArrowLeftIcon size={20} color={COLORS.onSurface} weight="bold" />
        </Pressable>

        <View style={styles.logoChip}>
          <Text style={styles.logoText}>GUDMOMENT</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.pageTitle}>EDIT MOMENT</Text>
          <View style={styles.titleUnderline} />
        </View>
        <Text style={styles.archiveId}>ARCHIVE ID: {archiveId}</Text>
      </View>

      {/* Context Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.emojiBox}>
          <Text style={styles.emojiText}>{moment.emoji}</Text>
        </View>
        <View style={styles.heroContent}>
          <View style={styles.currentEntryTag}>
            <Text style={styles.currentEntryText}>CURRENT ENTRY</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {moment.title}
          </Text>
          <Text style={styles.heroDate}>
            Captured {capturedDate}{capturedTime ? ` \u2022 ${capturedTime}` : ''}
          </Text>
        </View>
      </View>

      {/* Form */}
      <MomentForm
        initialValues={moment}
        submitLabel="Update Moment"
        onSubmit={async (values) => {
          await editMoment(id!, values);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.page,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  backBtnPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslate.x },
      { translateY: BORDERS.pressedTranslate.y },
    ],
  },
  logoChip: {
    backgroundColor: COLORS.accentYellow,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },

  // Title Section
  titleSection: {
    paddingHorizontal: SPACING.page,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  titleUnderline: {
    height: 8,
    backgroundColor: COLORS.primaryContainer,
    marginTop: -8,
    width: '60%',
  },
  archiveId: {
    ...TYPOGRAPHY.labelMono,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Context Hero Card
  heroCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.page,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.momentTeal,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowXl,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  emojiBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  emojiText: {
    fontSize: 36,
  },
  heroContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  currentEntryTag: {
    backgroundColor: COLORS.onSurface,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.xs,
  },
  currentEntryText: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    color: COLORS.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.onSurface,
    letterSpacing: -0.3,
    marginBottom: SPACING.xs,
  },
  heroDate: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0,
  },
});

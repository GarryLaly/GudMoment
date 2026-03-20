import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, QrCodeIcon, PencilSimpleIcon, TrashIcon, BellRingingIcon } from 'phosphor-react-native';
import { ElapsedTimeDisplay } from '../../components/ElapsedTimeDisplay';
import { NotificationPicker } from '../../components/NotificationPicker';
import { useMoments } from '../../hooks/useMoments';
import { getMomentById, type Moment } from '../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';

export default function MomentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { removeMoment } = useMoments();
  const router = useRouter();
  const [moment, setMoment] = useState<Moment | null>(null);

  useEffect(() => { if (id) getMomentById(id).then(setMoment); }, [id]);

  const handleDelete = () => {
    if (!moment) return;
    Alert.alert(`Delete ${moment.title}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await removeMoment(moment.id); router.replace('/'); } },
    ]);
  };

  if (!moment) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            onPress={() => router.back()}
          >
            <ArrowLeftIcon size={22} color={COLORS.onSurface} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>MOMENT DETAILS</Text>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: COLORS.primaryContainer + '33' }]}>
          <View style={styles.heroContent}>
            <Text style={styles.emoji}>{moment.emoji}</Text>
            <Text style={styles.title}>{moment.title}</Text>
            <ElapsedTimeDisplay
              date={moment.date}
              time={moment.time}
              size="lg"
              style={styles.elapsedTime}
            />
            <Text style={styles.dateLabel}>
              {new Date(moment.date).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.heroDivider} />
        </View>

        {/* Action Row */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionShare, pressed && styles.actionPressed]}
            onPress={() => router.push(`/moment/qr/${id}`)}
          >
            <QrCodeIcon size={28} color={COLORS.onSurface} weight="bold" />
            <Text style={styles.actionLabel}>SHARE QR</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionEdit, pressed && styles.actionPressed]}
            onPress={() => router.push(`/moment/edit/${id}`)}
          >
            <PencilSimpleIcon size={28} color={COLORS.onSurface} weight="bold" />
            <Text style={styles.actionLabel}>EDIT</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.actionDelete, pressed && styles.actionPressed]}
            onPress={handleDelete}
          >
            <TrashIcon size={28} color={COLORS.onPrimary} weight="bold" />
            <Text style={[styles.actionLabel, { color: COLORS.onPrimary }]}>DELETE</Text>
          </Pressable>
        </View>

        {/* Reminders Section */}
        <View style={styles.remindersSection}>
          <View style={styles.remindersHeader}>
            <BellRingingIcon size={24} color={COLORS.tertiaryContainer} weight="fill" />
            <Text style={styles.remindersHeading}>REMINDERS</Text>
          </View>
          <NotificationPicker momentId={moment.id} momentTitle={moment.title} momentDate={moment.date} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ACTION_SIZE = 100;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLow },
  content: { padding: SPACING.page, paddingBottom: 60 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
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
  },

  // Hero
  heroCard: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'hidden',
  },
  heroContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emoji: { fontSize: 80, marginBottom: SPACING.md },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    letterSpacing: -1,
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  elapsedTime: {
    fontFamily: FONTS.monoBold,
    fontSize: 24,
    color: COLORS.primary,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  dateLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  heroDivider: {
    height: 3,
    backgroundColor: COLORS.border + '1A',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  actionShare: { backgroundColor: COLORS.accentYellow },
  actionEdit: { backgroundColor: COLORS.momentTeal },
  actionDelete: { backgroundColor: COLORS.primaryContainer },
  actionLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.onSurface,
  },

  // Reminders
  remindersSection: {
    marginBottom: SPACING.xl,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  remindersHeading: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
  },
});

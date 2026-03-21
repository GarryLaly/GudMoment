import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { QrCodeIcon, PlusIcon } from 'phosphor-react-native';
import { useMoments } from '../../hooks/useMoments';
import { useTheme } from '../../hooks/useTheme';
import { MomentCard } from '../../components/MomentCard';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';
import type { Moment } from '../../db/moments';

export default function HomeScreen() {
  const { moments, loading, reorderMoments } = useMoments();
  const { colors, borders } = useTheme();
  const router = useRouter();

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Moment>) => (
    <ScaleDecorator>
      <MomentCard moment={item} onPress={(id) => router.push(`/moment/${id}`)} onLongPress={drag} disabled={isActive} />
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceContainerLowest }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surfaceContainerLowest }]}>
        <View style={[styles.logoChip, { backgroundColor: colors.accentYellow, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <Text style={[styles.logoText, { color: colors.onSurface }]}>GUDMOMENT</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.scanButton, { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest, shadowColor: borders.shadowColor }, pressed && styles.scanButtonPressed]}
          onPress={() => router.push('/scan')}
        >
          <QrCodeIcon size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
      </View>

      {/* Section header */}
      <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={styles.sectionLeft}>
          <Text style={[styles.liveFeedLabel, { color: colors.primary }]}>LIVE FEED</Text>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Your Moments</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <Text style={[styles.countText, { color: colors.onSurface }]}>COUNT: {moments.length.toString().padStart(2, '0')}</Text>
        </View>
      </View>

      {/* Content */}
      {moments.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.surfaceContainerLow }}>
          <DraggableFlatList
            data={moments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => reorderMoments(data)}
            contentContainerStyle={styles.list}
          />
        </GestureHandlerRootView>
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, { backgroundColor: colors.accentYellow, borderColor: colors.border, shadowColor: borders.shadowColor }, pressed && styles.fabPressed]}
        onPress={() => router.push('/moment/create')}
      >
        <PlusIcon size={32} color={colors.onSurface} weight="bold" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.page,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  logoChip: {
    backgroundColor: COLORS.accentYellow,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  scanButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  scanButtonPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [{ translateX: BORDERS.pressedTranslateSm.x }, { translateY: BORDERS.pressedTranslateSm.y }],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.page,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionLeft: {
    flex: 1,
  },
  liveFeedLabel: {
    ...TYPOGRAPHY.labelMono,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    fontSize: 32,
    color: COLORS.onSurface,
  },
  countBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  countText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
  },
  list: {
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: SPACING.page,
    bottom: SPACING.xl + 60,
    width: 64,
    height: 64,
    backgroundColor: COLORS.accentYellow,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  fabPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [{ translateX: BORDERS.pressedTranslate.x }, { translateY: BORDERS.pressedTranslate.y }],
  },
});

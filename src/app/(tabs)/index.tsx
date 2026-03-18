import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoments } from '../../hooks/useMoments';
import { MomentCard } from '../../components/MomentCard';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function HomeScreen() {
  const { moments, loading } = useMoments();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>GudMoment</Text>
        <Pressable style={styles.scanButton} onPress={() => router.push('/scan')}>
          <Text style={styles.scanIcon}>📷</Text>
        </Pressable>
      </View>

      {moments.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <FlatList data={moments} keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MomentCard moment={item} onPress={(id) => router.push(`/moment/${id}`)} />
          )}
          contentContainerStyle={styles.list} />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/moment/create')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, borderBottomWidth: BORDERS.width, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.text },
  scanButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderWidth: BORDERS.width, borderColor: COLORS.border },
  scanIcon: { fontSize: 22 },
  list: { paddingTop: SPACING.md, paddingBottom: 100 },
  fab: {
    position: 'absolute', right: SPACING.lg, bottom: SPACING.xl + 60,
    width: 64, height: 64, backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: BORDERS.shadowColor, shadowOffset: BORDERS.shadowOffset, shadowOpacity: 1, shadowRadius: 0, elevation: 6,
  },
  fabText: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.surface, marginTop: -2 },
});

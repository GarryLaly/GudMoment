import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ElapsedTimeDisplay } from '../../components/ElapsedTimeDisplay';
import { NotificationPicker } from '../../components/NotificationPicker';
import { useMoments } from '../../hooks/useMoments';
import { getMomentById, type Moment } from '../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <View style={[styles.heroCard, { backgroundColor: moment.color + '22' }]}>
          <Text style={styles.emoji}>{moment.emoji}</Text>
          <Text style={styles.title}>{moment.title}</Text>
          <ElapsedTimeDisplay date={moment.date} time={moment.time} size="lg" />
          <Text style={styles.dateLabel}>
            {new Date(moment.date).toLocaleDateString(undefined, {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, { backgroundColor: COLORS.secondary }]} onPress={() => router.push(`/moment/qr/${id}`)}>
            <Text style={styles.actionText}>Share via QR</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: COLORS.accent }]} onPress={() => router.push(`/moment/edit/${id}`)}>
            <Text style={[styles.actionText, { color: COLORS.text }]}>Edit</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: COLORS.error }]} onPress={handleDelete}>
            <Text style={styles.actionText}>Delete</Text>
          </Pressable>
        </View>
        <NotificationPicker momentId={moment.id} momentTitle={moment.title} momentDate={moment.date} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  backButton: { marginBottom: SPACING.md },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
  heroCard: {
    borderWidth: BORDERS.width, borderColor: COLORS.border, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xl,
    shadowColor: BORDERS.shadowColor, shadowOffset: BORDERS.shadowOffset, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  dateLabel: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textLight, marginTop: SPACING.sm },
  actions: { gap: SPACING.md },
  actionButton: {
    padding: SPACING.lg, borderWidth: BORDERS.width, borderColor: COLORS.border, alignItems: 'center',
    shadowColor: BORDERS.shadowColor, shadowOffset: BORDERS.shadowOffset, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  actionText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.surface },
});

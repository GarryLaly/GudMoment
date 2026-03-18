import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { MomentForm } from '../../../components/MomentForm';
import { useMoments } from '../../../hooks/useMoments';
import { getMomentById, type Moment } from '../../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../../constants/theme';
import { FONTS } from '../../../constants/fonts';

export default function EditMomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { editMoment } = useMoments();
  const router = useRouter();
  const [moment, setMoment] = useState<Moment | null>(null);

  useEffect(() => { if (id) getMomentById(id).then(setMoment); }, [id]);

  if (!moment) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable>
        <Text style={styles.title}>Edit Moment</Text>
        <View style={{ width: 60 }} />
      </View>
      <MomentForm initialValues={moment} submitLabel="Save Changes" onSubmit={async (values) => { await editMoment(id!, values); router.back(); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: BORDERS.width, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  title: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.text },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
});

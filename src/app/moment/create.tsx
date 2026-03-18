import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MomentForm } from '../../components/MomentForm';
import { useMoments } from '../../hooks/useMoments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function CreateMomentScreen() {
  const { addMoment } = useMoments();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>New Moment</Text>
        <View style={{ width: 60 }} />
      </View>
      <MomentForm submitLabel="Save Moment" onSubmit={async (values) => { await addMoment(values); router.back(); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: BORDERS.width, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  title: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.text },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
});

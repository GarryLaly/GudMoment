import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QRGenerator } from '../../../components/QRGenerator';
import { getMomentById } from '../../../db/moments';
import { encodeMomentForQR } from '../../../utils/qrCodec';
import { COLORS, BORDERS, SPACING } from '../../../constants/theme';
import { FONTS } from '../../../constants/fonts';

export default function QRScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [qrData, setQrData] = useState<string | null>(null);
  const [momentTitle, setMomentTitle] = useState('');
  const [momentDate, setMomentDate] = useState('');

  useEffect(() => {
    if (!id) return;
    getMomentById(id).then((m) => {
      if (!m) return;
      setMomentTitle(m.title);
      setMomentDate(m.date);
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
      <View style={styles.content}>
        <Text style={styles.title}>{momentTitle}</Text>
        <QRGenerator value={qrData} size={280} />
        <Text style={styles.date}>{new Date(momentDate).toLocaleDateString()}</Text>
        <Text style={styles.hint}>Ask your partner to scan this in GudMoment</Text>
        <Pressable style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  title: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.text, marginBottom: SPACING.xl },
  date: { fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textLight, marginTop: SPACING.lg },
  hint: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textLight, marginTop: SPACING.sm },
  doneButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  doneText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.surface },
});

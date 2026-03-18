import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoments } from '../../hooks/useMoments';
import { getAllMoments, createMoment } from '../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { loadMoments } = useMoments();

  const handleExport = async () => {
    const moments = await getAllMoments();
    const data = JSON.stringify({ v: 1, moments, exportedAt: new Date().toISOString() }, null, 2);
    const path = `${FileSystem.cacheDirectory}gudmoment-backup.json`;
    await FileSystem.writeAsStringAsync(path, data);
    await Sharing.shareAsync(path, { mimeType: 'application/json' });
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled) return;

    try {
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);
      if (!data.v || !Array.isArray(data.moments)) {
        Alert.alert('Invalid file', 'This file is not a valid GudMoment backup');
        return;
      }

      let imported = 0;
      for (const m of data.moments) {
        await createMoment({
          title: m.title,
          date: m.date,
          time: m.time,
          timezone: m.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          emoji: m.emoji,
          color: m.color,
        });
        imported++;
      }

      await loadMoments();
      Alert.alert('Import Complete', `${imported} moments imported`);
    } catch {
      Alert.alert('Import Failed', 'Could not read the backup file');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionTitle}>Data</Text>
        <Pressable style={styles.button} onPress={handleExport}>
          <Text style={styles.buttonText}>Export All Moments</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleImport}>
          <Text style={styles.buttonText}>Import Moments</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>GudMoment</Text>
          <Text style={styles.version}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={styles.aboutText}>Track your special moments.</Text>
          <Text style={styles.aboutText}>Open source on GitHub.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.text, marginBottom: SPACING.xl },
  sectionTitle: { fontFamily: FONTS.bodySemiBold, fontSize: 18, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  button: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonText: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.text },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  appName: { fontFamily: FONTS.heading, fontSize: 22, color: COLORS.primary },
  version: { fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textLight, marginTop: SPACING.xs },
  aboutText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, marginTop: SPACING.sm },
});

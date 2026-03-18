import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useMoments } from '../../hooks/useMoments';
import { getAllMoments, createMoment, Moment } from '../../db/moments';
import { upsertWidgetConfig, getWidgetConfigs } from '../../db/widgetConfig';
import { updateWidgetData } from '../../utils/widgetBridge';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';
import Constants from 'expo-constants';

const INTERVAL_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
];

export default function SettingsScreen() {
  const { loadMoments } = useMoments();

  const [moments, setMoments] = useState<Moment[]>([]);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [selectedRandomIds, setSelectedRandomIds] = useState<string[]>([]);
  const [rotationInterval, setRotationInterval] = useState<number>(30);
  const [widgetSaving, setWidgetSaving] = useState(false);

  useEffect(() => {
    loadWidgetConfig();
  }, []);

  const loadWidgetConfig = async () => {
    const allMoments = await getAllMoments();
    setMoments(allMoments);

    const configs = await getWidgetConfigs();
    const multiConfig = configs.find((c) => c.widget_type === 'multi');
    const randomConfig = configs.find((c) => c.widget_type === 'random');

    if (multiConfig) {
      try {
        setSelectedMultiIds(JSON.parse(multiConfig.moment_ids));
      } catch {
        setSelectedMultiIds([]);
      }
    }

    if (randomConfig) {
      try {
        setSelectedRandomIds(JSON.parse(randomConfig.moment_ids));
        if (randomConfig.rotation_interval) {
          setRotationInterval(randomConfig.rotation_interval);
        }
      } catch {
        setSelectedRandomIds([]);
      }
    }
  };

  const toggleMultiId = (id: string) => {
    setSelectedMultiIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleRandomId = (id: string) => {
    setSelectedRandomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveWidgetConfig = async () => {
    setWidgetSaving(true);
    try {
      await upsertWidgetConfig('multi', selectedMultiIds);
      await upsertWidgetConfig('random', selectedRandomIds, rotationInterval);
      await updateWidgetData();
      Alert.alert('Saved', 'Widget configuration updated');
    } catch {
      Alert.alert('Error', 'Failed to save widget configuration');
    } finally {
      setWidgetSaving(false);
    }
  };

  const handleExport = async () => {
    const allMoments = await getAllMoments();
    const data = JSON.stringify({ v: 1, moments: allMoments, exportedAt: new Date().toISOString() }, null, 2);
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

        {/* Widget Configuration */}
        <Text style={styles.sectionTitle}>Widget Configuration</Text>

        <View style={styles.widgetCard}>
          <Text style={styles.widgetCardTitle}>Multi-Moment List Widget</Text>
          <Text style={styles.widgetCardSubtitle}>Select moments to show in the list widget</Text>
          {moments.length === 0 ? (
            <Text style={styles.emptyText}>No moments yet</Text>
          ) : (
            moments.map((m) => {
              const selected = selectedMultiIds.includes(m.id);
              return (
                <Pressable
                  key={m.id}
                  style={[styles.checkRow, selected && styles.checkRowSelected]}
                  onPress={() => toggleMultiId(m.id)}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    <Text style={styles.checkboxText}>{selected ? '✓' : '☐'}</Text>
                  </View>
                  <Text style={styles.momentEmoji}>{m.emoji}</Text>
                  <Text style={styles.checkRowLabel} numberOfLines={1}>{m.title}</Text>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.widgetCard}>
          <Text style={styles.widgetCardTitle}>Random Rotation Widget</Text>
          <Text style={styles.widgetCardSubtitle}>Select moments for the random rotation pool</Text>
          {moments.length === 0 ? (
            <Text style={styles.emptyText}>No moments yet</Text>
          ) : (
            moments.map((m) => {
              const selected = selectedRandomIds.includes(m.id);
              return (
                <Pressable
                  key={m.id}
                  style={[styles.checkRow, selected && styles.checkRowSelected]}
                  onPress={() => toggleRandomId(m.id)}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    <Text style={styles.checkboxText}>{selected ? '✓' : '☐'}</Text>
                  </View>
                  <Text style={styles.momentEmoji}>{m.emoji}</Text>
                  <Text style={styles.checkRowLabel} numberOfLines={1}>{m.title}</Text>
                </Pressable>
              );
            })
          )}

          <Text style={styles.intervalLabel}>Rotation Interval</Text>
          <View style={styles.intervalRow}>
            {INTERVAL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.intervalBtn, rotationInterval === opt.value && styles.intervalBtnActive]}
                onPress={() => setRotationInterval(opt.value)}
              >
                <Text
                  style={[styles.intervalBtnText, rotationInterval === opt.value && styles.intervalBtnTextActive]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.button, styles.saveButton, widgetSaving && styles.buttonDisabled]}
          onPress={handleSaveWidgetConfig}
          disabled={widgetSaving}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>
            {widgetSaving ? 'Saving...' : 'Save Widget Config'}
          </Text>
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.text },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.surface,
  },
  widgetCard: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  widgetCardTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  widgetCardSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checkRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF0F0',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.surface,
  },
  momentEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  checkRowLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  intervalLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  intervalBtn: {
    flex: 1,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  intervalBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.border,
  },
  intervalBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.text,
  },
  intervalBtnTextActive: {
    fontFamily: FONTS.monoBold,
    color: COLORS.text,
  },
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

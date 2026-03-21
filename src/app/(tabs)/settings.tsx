import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import {
  DownloadSimpleIcon,
  UploadSimpleIcon,
  SquaresFourIcon,
  ShuffleIcon,
  SunIcon,
  MoonIcon,
  DevicesIcon,
} from 'phosphor-react-native';
import type { ThemePreference } from '../../context/ThemeContext';
import { useMoments } from '../../hooks/useMoments';
import { useTheme } from '../../hooks/useTheme';
import { getAllMoments, createMoment, Moment } from '../../db/moments';
import { upsertWidgetConfig, getWidgetConfigs } from '../../db/widgetConfig';
import { updateWidgetData } from '../../utils/widgetBridge';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';
import Constants from 'expo-constants';

const INTERVAL_OPTIONS = [
  { label: '1H', value: 60 },
  { label: '6H', value: 360 },
  { label: '1D', value: 1440 },
];

export default function SettingsScreen() {
  const { loadMoments } = useMoments();
  const { colors, borders, isDark, preference, setPreference } = useTheme();

  const THEME_OPTIONS: { label: string; value: ThemePreference; icon: typeof SunIcon }[] = [
    { label: 'SYSTEM', value: 'system', icon: DevicesIcon },
    { label: 'LIGHT', value: 'light', icon: SunIcon },
    { label: 'DARK', value: 'dark', icon: MoonIcon },
  ];

  const [moments, setMoments] = useState<Moment[]>([]);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [selectedRandomIds, setSelectedRandomIds] = useState<string[]>([]);
  const [rotationInterval, setRotationInterval] = useState<number>(360);
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
    const data = JSON.stringify(
      { v: 1, moments: allMoments, exportedAt: new Date().toISOString() },
      null,
      2
    );
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceContainerLowest }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.surfaceContainerLow }]}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.onSurface }]}>SETTINGS</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Configuration & Curator Profile</Text>

        {/* Data Management */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>DATA MANAGEMENT</Text>
        <View style={styles.dataRow}>
          <Pressable
            style={({ pressed }) => [styles.dataButton, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }, pressed && styles.dataButtonPressed]}
            onPress={handleExport}
          >
            <View style={styles.dataButtonContent}>
              <Text style={[styles.dataButtonAction, { color: colors.textMuted }]}>ACTION</Text>
              <Text style={[styles.dataButtonLabel, { color: colors.onSurface }]}>Export Data</Text>
            </View>
            <DownloadSimpleIcon size={30} color={colors.onSurface} weight="bold" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.dataButton, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }, pressed && styles.dataButtonPressed]}
            onPress={handleImport}
          >
            <View style={styles.dataButtonContent}>
              <Text style={[styles.dataButtonAction, { color: colors.textMuted }]}>ACTION</Text>
              <Text style={[styles.dataButtonLabel, { color: colors.onSurface }]}>Import Data</Text>
            </View>
            <UploadSimpleIcon size={30} color={colors.onSurface} weight="bold" />
          </Pressable>
        </View>

        {/* Widget Config */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>WIDGET CONFIG</Text>

        {/* Multi-moment widget */}
        <View style={[styles.widgetCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <View style={styles.widgetCardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: colors.momentTeal, borderColor: colors.border }]}>
              <SquaresFourIcon size={24} color={colors.onSurface} weight="bold" />
            </View>
            <View style={styles.widgetCardHeaderText}>
              <Text style={[styles.widgetCardTitle, { color: colors.onSurface }]}>Multi-moment widget</Text>
              <Text style={[styles.widgetCardSubtitle, { color: colors.textMuted }]}>SELECT UP TO 5 MOMENTS TO DISPLAY</Text>
            </View>
          </View>
          {moments.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No moments yet</Text>
          ) : (
            <View style={[styles.checkList, { backgroundColor: colors.surfaceContainerLow }]}>
              {moments.map((m) => {
                const selected = selectedMultiIds.includes(m.id);
                return (
                  <Pressable
                    key={m.id}
                    style={[styles.checkRow, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.border }]}
                    onPress={() => toggleMultiId(m.id)}
                  >
                    <View
                      style={[styles.checkbox, { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest }, selected && [styles.checkboxSelected, { backgroundColor: colors.primaryContainer, borderColor: colors.border }]]}
                    >
                      {selected && <Text style={[styles.checkboxText, { color: colors.onPrimary }]}>{'\u2713'}</Text>}
                    </View>
                    <Text style={styles.momentEmoji}>{m.emoji}</Text>
                    <Text style={[styles.checkRowLabel, { color: colors.onSurface }]} numberOfLines={1}>
                      {m.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Random widget */}
        <View style={[styles.widgetCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <View style={styles.widgetCardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: colors.accentYellow, borderColor: colors.border }]}>
              <ShuffleIcon size={24} color={colors.onSurface} weight="bold" />
            </View>
            <View style={styles.widgetCardHeaderText}>
              <Text style={[styles.widgetCardTitle, { color: colors.onSurface }]}>Random widget</Text>
              <Text style={[styles.widgetCardSubtitle, { color: colors.textMuted }]}>ROTATE THROUGH SELECTED MOMENTS</Text>
            </View>
          </View>
          {moments.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No moments yet</Text>
          ) : (
            <View style={[styles.checkList, { backgroundColor: colors.surfaceContainerLow }]}>
              {moments.map((m) => {
                const selected = selectedRandomIds.includes(m.id);
                return (
                  <Pressable
                    key={m.id}
                    style={[styles.checkRow, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.border }]}
                    onPress={() => toggleRandomId(m.id)}
                  >
                    <View
                      style={[styles.checkbox, { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest }, selected && [styles.checkboxSelected, { backgroundColor: colors.primaryContainer, borderColor: colors.border }]]}
                    >
                      {selected && <Text style={[styles.checkboxText, { color: colors.onPrimary }]}>{'\u2713'}</Text>}
                    </View>
                    <Text style={styles.momentEmoji}>{m.emoji}</Text>
                    <Text style={[styles.checkRowLabel, { color: colors.onSurface }]} numberOfLines={1}>
                      {m.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={[styles.intervalLabel, { color: colors.textMuted }]}>Rotation Interval</Text>
          <View style={styles.intervalRow}>
            {INTERVAL_OPTIONS.map((opt) => {
              const active = rotationInterval === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={({ pressed }) => [
                    styles.intervalBtn,
                    { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest },
                    active && [styles.intervalBtnActive, { backgroundColor: colors.primaryContainer, shadowColor: borders.shadowColor }],
                    pressed && styles.intervalBtnPressed,
                  ]}
                  onPress={() => setRotationInterval(opt.value)}
                >
                  <Text
                    style={[
                      styles.intervalBtnText,
                      { color: colors.onSurface },
                      active && [styles.intervalBtnTextActive, { color: colors.onPrimary }],
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Save Widget Config */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: colors.primaryContainer, borderColor: colors.border, shadowColor: borders.shadowColor },
            widgetSaving && styles.buttonDisabled,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={handleSaveWidgetConfig}
          disabled={widgetSaving}
        >
          <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
            {widgetSaving ? 'SAVING...' : 'SAVE WIDGET CONFIG'}
          </Text>
        </Pressable>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>APPEARANCE</Text>
        <View style={[styles.widgetCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <View style={styles.widgetCardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: colors.momentTeal, borderColor: colors.border }]}>
              <MoonIcon size={24} color={colors.onSurface} weight="bold" />
            </View>
            <View style={styles.widgetCardHeaderText}>
              <Text style={[styles.widgetCardTitle, { color: colors.onSurface }]}>Theme</Text>
              <Text style={[styles.widgetCardSubtitle, { color: colors.textMuted }]}>CHOOSE LIGHT, DARK, OR SYSTEM DEFAULT</Text>
            </View>
          </View>
          <View style={styles.intervalRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.value;
              const Icon = opt.icon;
              return (
                <Pressable
                  key={opt.value}
                  style={({ pressed }) => [
                    styles.themeBtn,
                    { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest },
                    active && { backgroundColor: colors.primaryContainer, shadowColor: borders.shadowColor, shadowOffset: BORDERS.shadowSm, shadowOpacity: 1, shadowRadius: 0, elevation: 2 },
                    pressed && styles.intervalBtnPressed,
                  ]}
                  onPress={() => setPreference(opt.value)}
                >
                  <Icon size={18} color={active ? colors.onPrimary : colors.onSurface} weight={active ? 'fill' : 'regular'} />
                  <Text
                    style={[
                      styles.intervalBtnText,
                      { color: colors.onSurface },
                      active && { color: colors.onPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>ABOUT</Text>
        <View style={[styles.aboutCard, {
          backgroundColor: isDark ? colors.surfaceContainerHigh : '#1C1B1B',
          borderColor: colors.border,
          shadowColor: borders.shadowColor,
        }]}>
          <Text style={[styles.aboutBuildLabel, { color: colors.momentTeal }]}>BUILD VERSION</Text>
          <Text style={[styles.aboutVersion, { color: isDark ? colors.onSurface : '#FFFFFF' }]}>
            v{Constants.expoConfig?.version ?? '2.4.0'}-{'\n'}BRUTAL
          </Text>
          <Text style={[styles.aboutLink, { color: colors.primaryContainer }]}>
            VISIT OFFICIAL SITE {'->'}
          </Text>
          <View style={[styles.aboutDivider, { backgroundColor: isDark ? colors.outlineVariant : '#444' }]} />
          <Text style={[styles.aboutFooter, { color: isDark ? colors.textMuted : '#999' }]}>
            Made with {'<3'} for moments
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  content: {
    padding: SPACING.page,
    paddingBottom: 80,
    backgroundColor: COLORS.surfaceContainerLow,
  },

  // Title
  title: {
    fontFamily: FONTS.heading,
    fontSize: 40,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },

  // Section Titles
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },

  // Data Management Buttons
  dataRow: {
    gap: SPACING.sm,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  dataButtonPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslate.x },
      { translateY: BORDERS.pressedTranslate.y },
    ],
  },
  dataButtonContent: {
    flex: 1,
  },
  dataButtonAction: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  dataButtonLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.onSurface,
  },

  // Widget Cards
  widgetCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
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
  widgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetCardHeaderText: {
    flex: 1,
  },
  widgetCardTitle: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  widgetCardSubtitle: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  // Checklist
  checkList: {
    backgroundColor: COLORS.surfaceContainerLow,
    gap: SPACING.xs,
    padding: SPACING.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.border,
  },
  checkboxText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.onPrimary,
  },
  momentEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  checkRowLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.onSurface,
    flex: 1,
  },

  // Interval buttons
  intervalLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: SPACING.lg,
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
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: BORDERS.width,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  intervalBtnActive: {
    backgroundColor: COLORS.primaryContainer,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  intervalBtnPressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  intervalBtnText: {
    fontFamily: FONTS.monoBold,
    fontSize: 12,
    color: COLORS.onSurface,
  },
  intervalBtnTextActive: {
    color: COLORS.onPrimary,
  },

  // Save button
  saveButton: {
    backgroundColor: COLORS.primaryContainer,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  saveButtonPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslate.x },
      { translateY: BORDERS.pressedTranslate.y },
    ],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },

  // About
  aboutCard: {
    backgroundColor: COLORS.onSurface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  aboutBuildLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    color: COLORS.momentTeal,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  aboutVersion: {
    fontFamily: FONTS.heading,
    fontSize: 30,
    color: COLORS.onPrimary,
    letterSpacing: -1,
    marginTop: SPACING.xs,
  },
  aboutLink: {
    fontFamily: FONTS.monoBold,
    fontSize: 12,
    color: COLORS.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.md,
    textDecorationLine: 'underline',
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: SPACING.md,
  },
  aboutFooter: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

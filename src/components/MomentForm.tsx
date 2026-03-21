import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EmojiPicker } from './EmojiPicker';
import { ColorPicker } from './ColorPicker';
import { BORDERS, SPACING } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';
import { useTheme } from '../hooks/useTheme';
import type { CreateMomentInput } from '../db/moments';

interface Props {
  initialValues?: Partial<CreateMomentInput & { time?: string | null }>;
  onSubmit: (values: CreateMomentInput) => void;
  submitLabel: string;
}

export function MomentForm({ initialValues, onSubmit, submitLabel }: Props) {
  const { colors, borders } = useTheme();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [date, setDate] = useState<Date>(() => {
    if (initialValues?.date) return new Date(initialValues.date);
    return new Date();
  });
  const [includeTime, setIncludeTime] = useState(!!initialValues?.time);
  const [time, setTime] = useState<Date>(() => {
    if (initialValues?.time) {
      const [h, m, s] = initialValues.time.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, s || 0);
      return d;
    }
    return new Date();
  });
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? '\u2764\uFE0F');
  const [color, setColor] = useState(initialValues?.color ?? '#FF6B6B');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) { Alert.alert('Title required', 'Please give your moment a name'); return; }
    if (date > new Date()) { Alert.alert('Invalid date', 'Date must be in the past'); return; }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = includeTime
      ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:00`
      : undefined;

    onSubmit({ title: title.slice(0, 100), date: dateStr, time: timeStr, timezone, emoji, color });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* MOMENT IDENTITY */}
      <Text style={[styles.sectionHeader, { color: colors.primary }]}>MOMENT IDENTITY</Text>

      <TextInput
        style={[
          styles.input,
          { color: colors.onSurface, borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest, shadowColor: borders.shadowColor },
          titleFocused && [styles.inputFocused, { borderColor: colors.primary, shadowColor: colors.primary }],
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="GIVE IT A CHUNKY NAME..."
        placeholderTextColor={colors.textMuted}
        maxLength={100}
        testID="title-input"
        accessibilityLabel="Moment title"
        autoFocus
        onFocus={() => setTitleFocused(true)}
        onBlur={() => setTitleFocused(false)}
      />

      <View style={styles.dateTimeSection}>
        <Pressable
          style={({ pressed }) => [
            styles.dateButton,
            { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest, shadowColor: borders.shadowColor },
            pressed && styles.dateButtonPressed,
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: colors.onSurface }]}>{date.toLocaleDateString()}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" maximumDate={new Date()}
            onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }} />
        )}

        <View style={styles.timeToggleRow}>
          <Text style={[styles.timeToggleLabel, { color: colors.onSurface }]}>Enable</Text>
          <Switch value={includeTime} onValueChange={setIncludeTime}
            trackColor={{ true: colors.primary, false: colors.surfaceContainerHigh }}
            thumbColor={includeTime ? colors.primaryContainer : colors.surfaceContainerLowest}
          />
        </View>

        {includeTime && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.dateButton,
                { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest, shadowColor: borders.shadowColor },
                pressed && styles.dateButtonPressed,
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.dateText, { color: colors.onSurface }]}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker value={time} mode="time"
                onChange={(_, t) => { setShowTimePicker(Platform.OS === 'ios'); if (t) setTime(t); }} />
            )}
          </>
        )}
      </View>

      {/* THE VIBE */}
      <Text style={[styles.sectionHeader, { color: colors.primary }]}>THE VIBE</Text>
      <EmojiPicker selected={emoji} onSelect={setEmoji} />

      {/* MOMENT PALETTE */}
      <Text style={[styles.sectionHeader, { color: colors.primary }]}>MOMENT PALETTE</Text>
      <ColorPicker selected={color} onSelect={setColor} />

      {/* Submit */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: colors.momentTeal, borderColor: colors.border, shadowColor: borders.shadowColor },
          pressed && styles.submitPressed,
        ]}
        onPress={handleSubmit}
      >
        <Text style={[styles.submitText, { color: colors.onPrimary }]}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.page, paddingBottom: 100 },
  sectionHeader: {
    ...TYPOGRAPHY.section,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  input: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    borderWidth: BORDERS.width,
    padding: SPACING.md,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  inputFocused: {
    shadowOffset: BORDERS.shadowXl,
    elevation: 8,
  },
  dateTimeSection: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  dateButton: {
    borderWidth: BORDERS.width,
    padding: SPACING.md,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  dateButtonPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslate.x },
      { translateY: BORDERS.pressedTranslate.y },
    ],
  },
  dateText: {
    ...TYPOGRAPHY.monoLg,
  },
  timeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timeToggleLabel: {
    ...TYPOGRAPHY.mono,
  },
  submitButton: {
    marginTop: SPACING.xl,
    borderWidth: BORDERS.width,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  submitPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslate.x },
      { translateY: BORDERS.pressedTranslate.y },
    ],
  },
  submitText: {
    ...TYPOGRAPHY.headline,
    textTransform: 'uppercase',
  },
});

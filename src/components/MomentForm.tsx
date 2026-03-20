import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EmojiPicker } from './EmojiPicker';
import { ColorPicker } from './ColorPicker';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';
import type { CreateMomentInput } from '../db/moments';

interface Props {
  initialValues?: Partial<CreateMomentInput & { time?: string | null }>;
  onSubmit: (values: CreateMomentInput) => void;
  submitLabel: string;
}

export function MomentForm({ initialValues, onSubmit, submitLabel }: Props) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* MOMENT IDENTITY */}
      <Text style={styles.sectionHeader}>MOMENT IDENTITY</Text>

      <TextInput
        style={[styles.input, titleFocused && styles.inputFocused]}
        value={title}
        onChangeText={setTitle}
        placeholder="GIVE IT A CHUNKY NAME..."
        placeholderTextColor={COLORS.textMuted}
        maxLength={100}
        testID="title-input"
        accessibilityLabel="Moment title"
        autoFocus
        onFocus={() => setTitleFocused(true)}
        onBlur={() => setTitleFocused(false)}
      />

      <View style={styles.dateTimeSection}>
        <Pressable
          style={({ pressed }) => [styles.dateButton, pressed && styles.dateButtonPressed]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" maximumDate={new Date()}
            onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }} />
        )}

        <View style={styles.timeToggleRow}>
          <Text style={styles.timeToggleLabel}>Enable</Text>
          <Switch value={includeTime} onValueChange={setIncludeTime}
            trackColor={{ true: COLORS.primary, false: COLORS.surfaceContainerHigh }}
            thumbColor={includeTime ? COLORS.primaryContainer : COLORS.surfaceContainerLowest}
          />
        </View>

        {includeTime && (
          <>
            <Pressable
              style={({ pressed }) => [styles.dateButton, pressed && styles.dateButtonPressed]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker value={time} mode="time"
                onChange={(_, t) => { setShowTimePicker(Platform.OS === 'ios'); if (t) setTime(t); }} />
            )}
          </>
        )}
      </View>

      {/* THE VIBE */}
      <Text style={styles.sectionHeader}>THE VIBE</Text>
      <EmojiPicker selected={emoji} onSelect={setEmoji} />

      {/* MOMENT PALETTE */}
      <Text style={styles.sectionHeader}>MOMENT PALETTE</Text>
      <ColorPicker selected={color} onSelect={setColor} />

      {/* Submit */}
      <Pressable
        style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.page, paddingBottom: 100 },
  sectionHeader: {
    ...TYPOGRAPHY.section,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  input: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.onSurface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowOffset: BORDERS.shadowXl,
    shadowColor: COLORS.primary,
    elevation: 8,
  },
  dateTimeSection: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  dateButton: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    shadowColor: BORDERS.shadowColor,
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
    color: COLORS.onSurface,
  },
  timeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timeToggleLabel: {
    ...TYPOGRAPHY.mono,
    color: COLORS.onSurface,
  },
  submitButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.momentTeal,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
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
    color: COLORS.onPrimary,
    textTransform: 'uppercase',
  },
});

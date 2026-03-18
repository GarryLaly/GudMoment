import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EmojiPicker } from './EmojiPicker';
import { ColorPicker } from './ColorPicker';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';
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
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? '❤️');
  const [color, setColor] = useState(initialValues?.color ?? '#FF6B6B');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      <Text style={styles.label}>What's the moment?</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle}
        placeholder="Our Wedding Day" placeholderTextColor={COLORS.textLight} maxLength={100}
        testID="title-input" accessibilityLabel="Moment title" autoFocus />

      <Text style={styles.label}>Date</Text>
      <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" maximumDate={new Date()}
          onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }} />
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Include time?</Text>
        <Switch value={includeTime} onValueChange={setIncludeTime} trackColor={{ true: COLORS.primary }} />
      </View>

      {includeTime && (
        <>
          <Pressable style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker value={time} mode="time"
              onChange={(_, t) => { setShowTimePicker(Platform.OS === 'ios'); if (t) setTime(t); }} />
          )}
        </>
      )}

      <Text style={styles.label}>Pick an emoji</Text>
      <EmojiPicker selected={emoji} onSelect={setEmoji} />

      <Text style={[styles.label, { marginTop: SPACING.lg }]}>Pick a color</Text>
      <ColorPicker selected={color} onSelect={setColor} />

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  label: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.md },
  input: { fontFamily: FONTS.body, fontSize: 20, color: COLORS.text, borderBottomWidth: BORDERS.width, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm },
  dateButton: { borderWidth: BORDERS.width, borderColor: COLORS.border, padding: SPACING.md, backgroundColor: COLORS.surface },
  dateText: { fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submitButton: {
    marginTop: SPACING.xl, backgroundColor: COLORS.primary, borderWidth: BORDERS.width, borderColor: COLORS.border,
    padding: SPACING.lg, alignItems: 'center',
    shadowColor: BORDERS.shadowColor, shadowOffset: BORDERS.shadowOffset, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  submitText: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.surface },
});

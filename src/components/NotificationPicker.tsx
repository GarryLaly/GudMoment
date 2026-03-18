import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { getNotificationsForMoment, deleteNotificationsForMoment } from '../db/notifications';
import { saveAndScheduleNotification, requestNotificationPermissions } from '../hooks/useNotifications';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';

const RECURRING_OPTIONS = [
  { label: 'Every Year', value: 'yearly' },
  { label: 'Every 2 Years', value: '2yearly' },
  { label: 'Every 6 Months', value: '6monthly' },
  { label: 'Monthly', value: 'monthly' },
] as const;

interface Props {
  momentId: string;
  momentTitle: string;
  momentDate: string;
}

export function NotificationPicker({ momentId, momentTitle, momentDate }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getNotificationsForMoment(momentId).then((configs) => {
      const recurring = configs.find((c) => c.type === 'recurring');
      if (recurring) setSelected(recurring.recurring_interval);
    });
  }, [momentId]);

  const handleSelect = async (interval: string) => {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    const newValue = selected === interval ? null : interval;
    setSelected(newValue);

    await deleteNotificationsForMoment(momentId);

    if (newValue) {
      await saveAndScheduleNotification(
        { moment_id: momentId, type: 'recurring', recurring_interval: newValue },
        momentTitle,
        momentDate
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Remind me</Text>
      <View style={styles.options}>
        {RECURRING_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.option, selected === opt.value && styles.optionSelected]}
            onPress={() => handleSelect(opt.value)}
          >
            <Text style={[styles.optionText, selected === opt.value && styles.optionTextSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.lg },
  label: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.text, marginBottom: SPACING.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  option: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionSelected: { backgroundColor: COLORS.primary },
  optionText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text },
  optionTextSelected: { color: COLORS.surface },
});

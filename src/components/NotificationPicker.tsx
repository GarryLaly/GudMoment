import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { getNotificationsForMoment, deleteNotificationsForMoment } from '../db/notifications';
import { saveAndScheduleNotification, requestNotificationPermissions } from '../hooks/useNotifications';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anniversary Alerts</Text>
        <Text style={styles.headerSubtitle}>Get reminded when this moment comes around</Text>
      </View>

      <Text style={styles.label}>RECURRING FREQUENCY</Text>

      <View style={styles.options}>
        {RECURRING_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={({ pressed }) => [
              styles.option,
              selected === opt.value && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
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
  container: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  label: {
    ...TYPOGRAPHY.labelMono,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    width: '48%' as unknown as number,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  optionSelected: {
    backgroundColor: COLORS.secondary,
    shadowOffset: BORDERS.shadowOffset,
    elevation: 4,
  },
  optionPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslateSm.x },
      { translateY: BORDERS.pressedTranslateSm.y },
    ],
  },
  optionText: {
    ...TYPOGRAPHY.mono,
    color: COLORS.onSurface,
  },
  optionTextSelected: {
    color: COLORS.onSecondary,
  },
});

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { getNotificationsForMoment, deleteNotificationsForMoment } from '../db/notifications';
import { saveAndScheduleNotification, requestNotificationPermissions } from '../hooks/useNotifications';
import { BORDERS, SPACING } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';
import { useTheme } from '../hooks/useTheme';

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
  const { colors, borders } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Anniversary Alerts</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Get reminded when this moment comes around</Text>
      </View>

      <Text style={[styles.label, { color: colors.textMuted }]}>RECURRING FREQUENCY</Text>

      <View style={styles.options}>
        {RECURRING_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={({ pressed }) => [
              styles.option,
              { borderColor: colors.border, backgroundColor: colors.surfaceContainerLowest, shadowColor: borders.shadowColor },
              selected === opt.value && [styles.optionSelected, { backgroundColor: colors.secondary }],
              pressed && styles.optionPressed,
            ]}
            onPress={() => handleSelect(opt.value)}
          >
            <Text style={[
              styles.optionText,
              { color: colors.onSurface },
              selected === opt.value && { color: colors.onSecondary },
            ]}>
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
    borderWidth: BORDERS.width,
    padding: SPACING.lg,
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
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
  },
  label: {
    ...TYPOGRAPHY.labelMono,
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
    alignItems: 'center',
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  optionSelected: {
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
  },
});

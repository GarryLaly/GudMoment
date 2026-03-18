import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { getNotificationsForMoment, createNotification, deleteNotificationsForMoment, type CreateNotificationInput } from '../db/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotificationsForMoment(
  momentId: string,
  momentTitle: string,
  momentDate: string
): Promise<void> {
  // Cancel existing scheduled notifications for this moment
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of existing) {
    if (notif.content.data?.momentId === momentId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  const configs = await getNotificationsForMoment(momentId);
  const momentDateObj = new Date(momentDate);

  for (const config of configs) {
    if (!config.enabled) continue;

    if (config.type === 'recurring' && config.recurring_interval) {
      await scheduleRecurring(momentId, momentTitle, momentDateObj, config.recurring_interval);
    } else if (config.type === 'specific' && config.specific_years) {
      const years = JSON.parse(config.specific_years) as number[];
      await scheduleSpecificYears(momentId, momentTitle, momentDateObj, years);
    } else if (config.type === 'custom_dates' && config.custom_dates) {
      const dates = JSON.parse(config.custom_dates) as string[];
      await scheduleCustomDates(momentId, momentTitle, dates);
    }
  }
}

async function scheduleRecurring(
  momentId: string,
  title: string,
  momentDate: Date,
  interval: string
): Promise<void> {
  const day = momentDate.getDate();
  const month = momentDate.getMonth() + 1;
  const now = new Date();

  const makeContent = (yearsAgo?: number) => ({
    title: `${title}`,
    body: yearsAgo
      ? `${title} — ${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago today!`
      : `Today marks a milestone for "${title}"!`,
    data: { momentId },
  });

  switch (interval) {
    case 'yearly': {
      await Notifications.scheduleNotificationAsync({
        content: makeContent(),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, month, day, hour: 9, minute: 0, repeats: true },
      });
      break;
    }
    case 'monthly': {
      await Notifications.scheduleNotificationAsync({
        content: makeContent(),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, day, hour: 9, minute: 0, repeats: true },
      });
      break;
    }
    case '6monthly': {
      const month2 = ((month - 1 + 6) % 12) + 1;
      await Notifications.scheduleNotificationAsync({
        content: makeContent(),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, month, day, hour: 9, minute: 0, repeats: true },
      });
      await Notifications.scheduleNotificationAsync({
        content: makeContent(),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, month: month2, day, hour: 9, minute: 0, repeats: true },
      });
      break;
    }
    case '2yearly': {
      // Schedule for next 20 even-numbered years from moment date
      for (let y = 2; y <= 40; y += 2) {
        const targetDate = new Date(momentDate);
        targetDate.setFullYear(momentDate.getFullYear() + y);
        targetDate.setHours(9, 0, 0, 0);
        if (targetDate > now) {
          await Notifications.scheduleNotificationAsync({
            content: makeContent(y),
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
          });
        }
      }
      break;
    }
  }
}

async function scheduleSpecificYears(
  momentId: string,
  title: string,
  momentDate: Date,
  years: number[]
): Promise<void> {
  const now = new Date();
  for (const year of years) {
    const targetDate = new Date(momentDate);
    targetDate.setFullYear(momentDate.getFullYear() + year);
    targetDate.setHours(9, 0, 0, 0);

    if (targetDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${title} - ${year} year${year > 1 ? 's' : ''}!`,
          body: `It's been ${year} year${year > 1 ? 's' : ''} since "${title}"!`,
          data: { momentId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
      });
    }
  }
}

async function scheduleCustomDates(
  momentId: string,
  title: string,
  dates: string[]
): Promise<void> {
  const now = new Date();
  for (const dateStr of dates) {
    const targetDate = new Date(dateStr);
    targetDate.setHours(9, 0, 0, 0);

    if (targetDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${title}`,
          body: `You set a reminder for "${title}" today!`,
          data: { momentId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
      });
    }
  }
}

export async function saveAndScheduleNotification(
  input: CreateNotificationInput,
  momentTitle: string,
  momentDate: string
): Promise<void> {
  await createNotification(input);
  await scheduleNotificationsForMoment(input.moment_id, momentTitle, momentDate);
}

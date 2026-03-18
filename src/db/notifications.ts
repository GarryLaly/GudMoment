import { getDatabase } from './database';
import * as Crypto from 'expo-crypto';

export interface NotificationConfig {
  id: string;
  moment_id: string;
  type: 'recurring' | 'specific' | 'custom_dates';
  recurring_interval: string | null;
  specific_years: string | null;
  custom_dates: string | null;
  enabled: number;
}

export type CreateNotificationInput = Pick<NotificationConfig, 'moment_id' | 'type'> & {
  recurring_interval?: string;
  specific_years?: number[];
  custom_dates?: string[];
};

export async function getNotificationsForMoment(momentId: string): Promise<NotificationConfig[]> {
  const db = await getDatabase();
  return db.getAllAsync<NotificationConfig>(
    'SELECT * FROM notifications WHERE moment_id = ?',
    [momentId]
  );
}

export async function createNotification(input: CreateNotificationInput): Promise<NotificationConfig> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO notifications (id, moment_id, type, recurring_interval, specific_years, custom_dates, enabled)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      id,
      input.moment_id,
      input.type,
      input.recurring_interval ?? null,
      input.specific_years ? JSON.stringify(input.specific_years) : null,
      input.custom_dates ? JSON.stringify(input.custom_dates) : null,
    ]
  );

  return (await db.getFirstAsync<NotificationConfig>('SELECT * FROM notifications WHERE id = ?', [id]))!;
}

export async function deleteNotification(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications WHERE id = ?', [id]);
}

export async function deleteNotificationsForMoment(momentId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications WHERE moment_id = ?', [momentId]);
}

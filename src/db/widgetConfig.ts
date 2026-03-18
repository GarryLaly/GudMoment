import { getDatabase } from './database';
import * as Crypto from 'expo-crypto';

export interface WidgetConfig {
  id: string;
  widget_type: 'multi' | 'random';
  moment_ids: string;
  rotation_interval: number | null;
  updated_at: string;
}

export async function getWidgetConfigs(): Promise<WidgetConfig[]> {
  const db = await getDatabase();
  return db.getAllAsync<WidgetConfig>('SELECT * FROM widget_config');
}

export async function upsertWidgetConfig(
  widgetType: 'multi' | 'random',
  momentIds: string[],
  rotationInterval?: number
): Promise<WidgetConfig> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<WidgetConfig>(
    'SELECT * FROM widget_config WHERE widget_type = ?',
    [widgetType]
  );

  if (existing) {
    await db.runAsync(
      `UPDATE widget_config SET moment_ids = ?, rotation_interval = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(momentIds), rotationInterval ?? null, now, existing.id]
    );
    return (await db.getFirstAsync<WidgetConfig>('SELECT * FROM widget_config WHERE id = ?', [existing.id]))!;
  }

  const id = Crypto.randomUUID();
  await db.runAsync(
    `INSERT INTO widget_config (id, widget_type, moment_ids, rotation_interval, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, widgetType, JSON.stringify(momentIds), rotationInterval ?? null, now]
  );
  return (await db.getFirstAsync<WidgetConfig>('SELECT * FROM widget_config WHERE id = ?', [id]))!;
}

import { getDatabase } from './database';
import * as Crypto from 'expo-crypto';

export interface Moment {
  id: string;
  title: string;
  date: string;
  time: string | null;
  timezone: string;
  emoji: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateMomentInput = Pick<Moment, 'title' | 'date' | 'timezone' | 'emoji' | 'color'> & {
  time?: string | null;
};

export type UpdateMomentInput = Partial<Pick<Moment, 'title' | 'date' | 'time' | 'timezone' | 'emoji' | 'color' | 'sort_order'>>;

export async function getAllMoments(): Promise<Moment[]> {
  const db = await getDatabase();
  return db.getAllAsync<Moment>('SELECT * FROM moments ORDER BY sort_order ASC, date DESC');
}

export async function getMomentById(id: string): Promise<Moment | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Moment>('SELECT * FROM moments WHERE id = ?', [id]);
}

export async function createMoment(input: CreateMomentInput): Promise<Moment> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  const maxOrder = await db.getFirstAsync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM moments'
  );
  const sortOrder = (maxOrder?.max_order ?? -1) + 1;

  await db.runAsync(
    `INSERT INTO moments (id, title, date, time, timezone, emoji, color, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.title, input.date, input.time ?? null, input.timezone, input.emoji, input.color, sortOrder, now, now]
  );

  return (await getMomentById(id))!;
}

export async function updateMoment(id: string, input: UpdateMomentInput): Promise<Moment | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value as string | number | null);
    }
  }

  if (fields.length === 0) return getMomentById(id);

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE moments SET ${fields.join(', ')} WHERE id = ?`, values);
  return getMomentById(id);
}

export async function deleteMoment(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM moments WHERE id = ?', [id]);
}

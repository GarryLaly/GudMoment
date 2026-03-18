import type { SQLiteDatabase } from 'expo-sqlite';

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS moments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      timezone TEXT NOT NULL,
      emoji TEXT DEFAULT '❤️',
      color TEXT DEFAULT '#FF6B6B',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      moment_id TEXT NOT NULL,
      type TEXT NOT NULL,
      recurring_interval TEXT,
      specific_years TEXT,
      custom_dates TEXT,
      enabled INTEGER DEFAULT 1,
      FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS widget_config (
      id TEXT PRIMARY KEY,
      widget_type TEXT NOT NULL,
      moment_ids TEXT NOT NULL,
      rotation_interval INTEGER,
      updated_at TEXT NOT NULL
    );
  `);
}

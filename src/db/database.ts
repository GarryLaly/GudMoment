import * as SQLite from 'expo-sqlite';
import { up as migration001 } from './migrations/001_initial';

const DB_NAME = 'gudmoment.db';
const MIGRATIONS = [migration001];

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(dbInstance);
  return dbInstance;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = result?.user_version ?? 0;

  for (let i = currentVersion; i < MIGRATIONS.length; i++) {
    await db.withTransactionAsync(async () => {
      await MIGRATIONS[i](db);
      await db.execAsync(`PRAGMA user_version = ${i + 1};`);
    });
  }
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

# GudMoment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Native (Expo) app that tracks special dates and displays elapsed time, with QR sharing, widgets, and a brutalist UI.

**Architecture:** Local-first SQLite storage with Expo Router for navigation, React Context for state, and native widgets via config plugins. All data stays on-device; sharing is explicit via QR codes encoding moment JSON.

**Tech Stack:** Expo SDK (dev build), TypeScript, Expo SQLite, Expo Router, Expo Notifications, expo-camera, react-native-qrcode-svg, react-native-android-widget, Fredoka One + Space Mono + Nunito fonts.

**Spec:** `docs/superpowers/specs/2026-03-19-gudmoment-app-design.md`

---

## File Structure

```
src/
  app/
    _layout.tsx              # Root layout — loads fonts, initializes DB, wraps MomentsProvider
    (tabs)/
      _layout.tsx            # Tab navigator layout
      index.tsx              # Home screen — moments list
      settings.tsx           # Settings screen
    moment/
      [id].tsx               # Moment detail screen
      create.tsx             # Create moment screen
      edit/[id].tsx          # Edit moment screen
      qr/[id].tsx            # QR code display screen
    scan.tsx                 # QR scanner screen
  components/
    ElapsedTimeDisplay.tsx   # Smart elapsed time with adaptive format
    MomentCard.tsx           # Card component for list items
    MomentForm.tsx           # Shared form for create/edit
    EmojiPicker.tsx          # Grid of emoji choices
    ColorPicker.tsx          # Brutalist color swatch picker
    NotificationPicker.tsx   # Notification config UI
    QRGenerator.tsx          # QR code rendering wrapper
    EmptyState.tsx           # Empty list illustration
  db/
    database.ts              # DB initialization, migration runner
    migrations/
      001_initial.ts         # Initial schema (moments, notifications, widget_config)
    moments.ts               # Moment CRUD functions
    notifications.ts         # Notification CRUD functions
    widgetConfig.ts          # Widget config CRUD functions
  hooks/
    useMoments.ts            # Hook wrapping MomentsContext
    useElapsedTime.ts        # Hook for real-time elapsed time updates
  context/
    MomentsContext.tsx        # React Context + useReducer for moments state
  utils/
    timeCalculator.ts        # Pure functions: elapsed time calculation + smart formatting
    qrCodec.ts               # Encode/decode moment JSON for QR
    widgetBridge.ts          # Write denormalized data to shared storage for widgets
  constants/
    theme.ts                 # Colors, spacing, borders, shadows
    fonts.ts                 # Font family mappings
    colors.ts                # Brutalist color palette for moment accent colors
  widgets/
    MultiMomentWidget/       # Android multi-moment list widget
    RandomMomentWidget/      # Android random rotation widget
assets/
  fonts/
    FredokaOne-Regular.ttf
    SpaceMono-Regular.ttf
    SpaceMono-Bold.ttf
    Nunito-Regular.ttf
    Nunito-Bold.ttf
    Nunito-SemiBold.ttf
```

---

## Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `app.json`, `.gitignore`
- Create: `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`
- Create: `src/constants/theme.ts`, `src/constants/fonts.ts`, `src/constants/colors.ts`

- [ ] **Step 1: Initialize Expo project**

```bash
npx create-expo-app@latest GudMoment --template blank-typescript
cd GudMoment
```

Move existing `docs/` folder into the new project if scaffold creates a subdirectory.

- [ ] **Step 2: Install core dependencies**

```bash
npx expo install expo-router expo-sqlite expo-notifications expo-camera expo-font expo-splash-screen expo-dev-client expo-constants expo-crypto expo-status-bar expo-file-system expo-sharing expo-document-picker react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated @react-native-community/datetimepicker
```

- [ ] **Step 3: Install QR and widget dependencies**

```bash
npx expo install react-native-qrcode-svg react-native-svg
npm install react-native-android-widget
```

- [ ] **Step 4: Install dev dependencies**

```bash
npm install -D jest @testing-library/react-native @testing-library/jest-native @types/jest ts-jest
```

- [ ] **Step 5: Configure app.json for Expo Router and dev build**

Update `app.json`:
```json
{
  "expo": {
    "name": "GudMoment",
    "slug": "gudmoment",
    "version": "1.0.0",
    "scheme": "gudmoment",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow GudMoment to access camera for scanning QR codes"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF6B6B"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 6: Download fonts to assets/fonts/**

Download these font files into `assets/fonts/`:
- FredokaOne-Regular.ttf (from Google Fonts)
- SpaceMono-Regular.ttf, SpaceMono-Bold.ttf (from Google Fonts)
- Nunito-Regular.ttf, Nunito-Bold.ttf, Nunito-SemiBold.ttf (from Google Fonts)

- [ ] **Step 7: Create theme constants**

Create `src/constants/theme.ts`:
```typescript
export const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#1A1A1A',
  text: '#1A1A1A',
  textLight: '#666666',
  error: '#E74C3C',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BORDERS = {
  width: 3,
  radius: 0, // brutalist — no rounded corners
  shadowOffset: { width: 4, height: 4 },
  shadowColor: '#1A1A1A',
} as const;
```

Create `src/constants/fonts.ts`:
```typescript
export const FONTS = {
  heading: 'FredokaOne-Regular',
  mono: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
  body: 'Nunito-Regular',
  bodyBold: 'Nunito-Bold',
  bodySemiBold: 'Nunito-SemiBold',
} as const;
```

Create `src/constants/colors.ts`:
```typescript
export const MOMENT_COLORS = [
  '#FF6B6B', // coral red
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#A8E6CF', // mint
  '#DDA0DD', // plum
  '#FF9F43', // orange
  '#74B9FF', // sky blue
  '#FDA7DF', // pink
  '#55E6C1', // emerald
  '#FFEAA7', // cream yellow
] as const;

export const EMOJI_PRESETS = [
  '❤️', '💍', '🎂', '🎓', '✈️', '🏠', '👶', '🐾',
  '🎉', '💐', '🌟', '📅', '🎯', '🏆', '💝', '🌈',
] as const;
```

- [ ] **Step 8: Create root layout with font loading**

Create `src/app/_layout.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { FONTS } from '../constants/fonts';
import { getDatabase } from '../db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    [FONTS.heading]: require('../../assets/fonts/FredokaOne-Regular.ttf'),
    [FONTS.mono]: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    [FONTS.monoBold]: require('../../assets/fonts/SpaceMono-Bold.ttf'),
    [FONTS.body]: require('../../assets/fonts/Nunito-Regular.ttf'),
    [FONTS.bodyBold]: require('../../assets/fonts/Nunito-Bold.ttf'),
    [FONTS.bodySemiBold]: require('../../assets/fonts/Nunito-SemiBold.ttf'),
  });

  useEffect(() => {
    getDatabase()
      .then(() => setDbReady(true))
      .catch((err) => console.error('DB init failed:', err));
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

- [ ] **Step 9: Create tab layout**

Create `src/app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: {
          fontFamily: FONTS.bodySemiBold,
          fontSize: 12,
        },
        tabBarStyle: {
          borderTopWidth: 3,
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Moments',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💝</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 10: Create placeholder screens**

Create `src/app/(tabs)/index.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GudMoment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.text },
});
```

Create `src/app/(tabs)/settings.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.text },
});
```

- [ ] **Step 11: Verify project runs**

```bash
npx expo start
```

Confirm no errors. Stop the dev server.

- [ ] **Step 12: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold Expo project with fonts, theme, and routing"
```

---

## Task 2: Time Calculator Utility (TDD)

**Files:**
- Create: `src/utils/timeCalculator.ts`
- Create: `src/utils/__tests__/timeCalculator.test.ts`

- [ ] **Step 1: Write failing tests for time calculator**

Create `src/utils/__tests__/timeCalculator.test.ts`:
```typescript
import { calculateElapsedTime, formatElapsedTime } from '../timeCalculator';

describe('calculateElapsedTime', () => {
  it('returns years, months, days for dates > 1 year ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2018-01-30T10:00:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.years).toBe(8);
    expect(result.months).toBe(1);
    expect(result.days).toBe(17);
  });

  it('returns months, days for dates < 1 year ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2025-11-01T12:00:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.years).toBe(0);
    expect(result.months).toBe(4);
    expect(result.days).toBe(18);
  });

  it('returns days, hours for dates < 30 days ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-10T08:00:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.days).toBe(9);
    expect(result.hours).toBe(4);
  });

  it('returns hours, minutes for dates < 24 hours ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-19T03:30:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.hours).toBe(8);
    expect(result.minutes).toBe(30);
  });

  it('returns minutes, seconds for dates < 1 hour ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-19T11:45:30Z');
    const result = calculateElapsedTime(past, now);
    expect(result.minutes).toBe(14);
    expect(result.seconds).toBe(30);
  });
});

describe('formatElapsedTime', () => {
  it('formats >= 1 year as "X years X months X days ago"', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2018-01-30T10:00:00Z');
    const result = formatElapsedTime(past, now);
    expect(result).toContain('years');
    expect(result).toContain('months');
    expect(result).toContain('days');
    expect(result).toContain('ago');
  });

  it('formats < 1 hour as "X minutes X seconds ago"', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-19T11:45:30Z');
    const result = formatElapsedTime(past, now);
    expect(result).toBe('14 minutes 30 seconds ago');
  });

  it('uses singular for 1 unit', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2025-03-19T12:00:00Z');
    const result = formatElapsedTime(past, now);
    expect(result).toContain('1 year');
    expect(result).not.toContain('1 years');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/utils/__tests__/timeCalculator.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement timeCalculator.ts**

Create `src/utils/timeCalculator.ts`:
```typescript
export interface ElapsedTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function calculateElapsedTime(past: Date, now: Date = new Date()): ElapsedTime {
  const totalMs = now.getTime() - past.getTime();

  let years = now.getFullYear() - past.getFullYear();
  let months = now.getMonth() - past.getMonth();
  let days = now.getDate() - past.getDate();
  let hours = now.getHours() - past.getHours();
  let minutes = now.getMinutes() - past.getMinutes();
  let seconds = now.getSeconds() - past.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  return { years, months, days, hours, minutes, seconds, totalMs };
}

type Tier = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';

export function getDisplayTier(elapsed: ElapsedTime): Tier {
  const { totalMs } = elapsed;
  const ONE_HOUR = 3_600_000;
  const ONE_DAY = 86_400_000;
  const THIRTY_DAYS = 30 * ONE_DAY;
  const ONE_YEAR = 365.25 * ONE_DAY;

  if (totalMs < ONE_HOUR) return 'seconds';
  if (totalMs < ONE_DAY) return 'minutes';
  if (totalMs < THIRTY_DAYS) return 'hours';
  if (totalMs < ONE_YEAR) return 'days';
  return 'years';
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function formatElapsedTime(past: Date, now: Date = new Date()): string {
  const e = calculateElapsedTime(past, now);
  const tier = getDisplayTier(e);

  switch (tier) {
    case 'seconds':
      return `${plural(e.minutes, 'minute')} ${plural(e.seconds, 'second')} ago`;
    case 'minutes':
      return `${plural(e.hours, 'hour')} ${plural(e.minutes, 'minute')} ago`;
    case 'hours':
      return `${plural(e.days, 'day')} ${plural(e.hours, 'hour')} ago`;
    case 'days':
      return `${plural(e.months, 'month')} ${plural(e.days, 'day')} ago`;
    case 'years':
      return `${plural(e.years, 'year')} ${plural(e.months, 'month')} ${plural(e.days, 'day')} ago`;
  }
}

export function getRefreshInterval(elapsed: ElapsedTime): number {
  const tier = getDisplayTier(elapsed);
  return tier === 'seconds' ? 1000 : 60_000;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/utils/__tests__/timeCalculator.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add time calculator with smart elapsed time formatting"
```

---

## Task 3: QR Codec Utility (TDD)

**Files:**
- Create: `src/utils/qrCodec.ts`
- Create: `src/utils/__tests__/qrCodec.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/__tests__/qrCodec.test.ts`:
```typescript
import { encodeMomentForQR, decodeMomentFromQR, QRPayload } from '../qrCodec';

describe('qrCodec', () => {
  const validPayload: QRPayload = {
    v: 1,
    title: 'Our Wedding',
    date: '2018-01-30',
    time: '10:00:00',
    timezone: 'Asia/Jakarta',
    icon: '💍',
    color: '#FF6B6B',
  };

  it('encodes a moment to a JSON string', () => {
    const encoded = encodeMomentForQR(validPayload);
    expect(typeof encoded).toBe('string');
    const parsed = JSON.parse(encoded);
    expect(parsed.v).toBe(1);
    expect(parsed.title).toBe('Our Wedding');
  });

  it('decodes a valid JSON string back to a payload', () => {
    const encoded = encodeMomentForQR(validPayload);
    const decoded = decodeMomentFromQR(encoded);
    expect(decoded).toEqual(validPayload);
  });

  it('returns null for invalid JSON', () => {
    expect(decodeMomentFromQR('not json')).toBeNull();
  });

  it('returns null for missing required fields', () => {
    expect(decodeMomentFromQR(JSON.stringify({ v: 1 }))).toBeNull();
  });

  it('returns null for unsupported version', () => {
    expect(decodeMomentFromQR(JSON.stringify({ ...validPayload, v: 99 }))).toBeNull();
  });

  it('handles payload without optional time field', () => {
    const noTime = { ...validPayload, time: undefined };
    const encoded = encodeMomentForQR(noTime);
    const decoded = decodeMomentFromQR(encoded);
    expect(decoded?.time).toBeUndefined();
  });

  it('truncates titles longer than 100 characters', () => {
    const longTitle = { ...validPayload, title: 'A'.repeat(120) };
    const encoded = encodeMomentForQR(longTitle);
    const decoded = decodeMomentFromQR(encoded);
    expect(decoded?.title.length).toBe(100);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/utils/__tests__/qrCodec.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement qrCodec.ts**

Create `src/utils/qrCodec.ts`:
```typescript
export interface QRPayload {
  v: number;
  title: string;
  date: string;
  time?: string;
  timezone: string;
  icon: string;
  color: string;
}

const CURRENT_VERSION = 1;
const MAX_TITLE_LENGTH = 100;

export function encodeMomentForQR(payload: QRPayload): string {
  const truncated = {
    ...payload,
    title: payload.title.slice(0, MAX_TITLE_LENGTH),
    v: CURRENT_VERSION,
  };
  if (!truncated.time) {
    delete truncated.time;
  }
  return JSON.stringify(truncated);
}

export function decodeMomentFromQR(data: string): QRPayload | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.v !== CURRENT_VERSION) return null;
    if (!parsed.title || !parsed.date || !parsed.timezone || !parsed.icon || !parsed.color) return null;

    return {
      v: parsed.v,
      title: String(parsed.title).slice(0, MAX_TITLE_LENGTH),
      date: parsed.date,
      time: parsed.time || undefined,
      timezone: parsed.timezone,
      icon: parsed.icon,
      color: parsed.color,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest src/utils/__tests__/qrCodec.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/qrCodec.ts src/utils/__tests__/qrCodec.test.ts
git commit -m "feat: add QR codec for encoding/decoding moment data"
```

---

## Task 4: Database Layer (TDD)

**Files:**
- Create: `src/db/database.ts`
- Create: `src/db/migrations/001_initial.ts`
- Create: `src/db/moments.ts`
- Create: `src/db/notifications.ts`
- Create: `src/db/widgetConfig.ts`
- Create: `src/db/__tests__/moments.test.ts`

- [ ] **Step 1: Create migration file**

Create `src/db/migrations/001_initial.ts`:
```typescript
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
```

- [ ] **Step 2: Create database initialization module**

Create `src/db/database.ts`:
```typescript
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
```

- [ ] **Step 3: Create Moment type and CRUD functions**

Create `src/db/moments.ts`:
```typescript
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
```

- [ ] **Step 4: Create notification CRUD functions**

Create `src/db/notifications.ts`:
```typescript
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
```

- [ ] **Step 5: Create widget config CRUD functions**

Create `src/db/widgetConfig.ts`:
```typescript
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
```

- [ ] **Step 6: Commit**

```bash
git add src/db/
git commit -m "feat: add database layer with migrations, moments/notifications/widget CRUD"
```

---

## Task 5: Moments Context (State Management)

**Files:**
- Create: `src/context/MomentsContext.tsx`
- Create: `src/hooks/useMoments.ts`
- Create: `src/hooks/useElapsedTime.ts`

- [ ] **Step 1: Create MomentsContext**

Create `src/context/MomentsContext.tsx`:
```typescript
import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import * as MomentsDB from '../db/moments';
import type { Moment, CreateMomentInput, UpdateMomentInput } from '../db/moments';

interface MomentsState {
  moments: Moment[];
  loading: boolean;
  error: string | null;
}

type MomentsAction =
  | { type: 'SET_MOMENTS'; payload: Moment[] }
  | { type: 'ADD_MOMENT'; payload: Moment }
  | { type: 'UPDATE_MOMENT'; payload: Moment }
  | { type: 'DELETE_MOMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface MomentsContextValue extends MomentsState {
  loadMoments: () => Promise<void>;
  addMoment: (input: CreateMomentInput) => Promise<Moment>;
  editMoment: (id: string, input: UpdateMomentInput) => Promise<Moment | null>;
  removeMoment: (id: string) => Promise<void>;
}

export const MomentsContext = createContext<MomentsContextValue | null>(null);

function momentsReducer(state: MomentsState, action: MomentsAction): MomentsState {
  switch (action.type) {
    case 'SET_MOMENTS':
      return { ...state, moments: action.payload, loading: false };
    case 'ADD_MOMENT':
      return { ...state, moments: [...state.moments, action.payload] };
    case 'UPDATE_MOMENT':
      return {
        ...state,
        moments: state.moments.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case 'DELETE_MOMENT':
      return { ...state, moments: state.moments.filter((m) => m.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function MomentsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(momentsReducer, {
    moments: [],
    loading: true,
    error: null,
  });

  const loadMoments = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const moments = await MomentsDB.getAllMoments();
      dispatch({ type: 'SET_MOMENTS', payload: moments });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load moments' });
    }
  }, []);

  const addMoment = useCallback(async (input: CreateMomentInput) => {
    const moment = await MomentsDB.createMoment(input);
    dispatch({ type: 'ADD_MOMENT', payload: moment });
    return moment;
  }, []);

  const editMoment = useCallback(async (id: string, input: UpdateMomentInput) => {
    const moment = await MomentsDB.updateMoment(id, input);
    if (moment) dispatch({ type: 'UPDATE_MOMENT', payload: moment });
    return moment;
  }, []);

  const removeMoment = useCallback(async (id: string) => {
    await MomentsDB.deleteMoment(id);
    dispatch({ type: 'DELETE_MOMENT', payload: id });
  }, []);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  return (
    <MomentsContext.Provider value={{ ...state, loadMoments, addMoment, editMoment, removeMoment }}>
      {children}
    </MomentsContext.Provider>
  );
}
```

- [ ] **Step 2: Create useMoments hook**

Create `src/hooks/useMoments.ts`:
```typescript
import { useContext } from 'react';
import { MomentsContext } from '../context/MomentsContext';

export function useMoments() {
  const ctx = useContext(MomentsContext);
  if (!ctx) throw new Error('useMoments must be used within MomentsProvider');
  return ctx;
}
```

- [ ] **Step 3: Create useElapsedTime hook**

Create `src/hooks/useElapsedTime.ts`:
```typescript
import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { formatElapsedTime, calculateElapsedTime, getRefreshInterval } from '../utils/timeCalculator';

export function useElapsedTime(dateStr: string, timeStr: string | null): string {
  const [formatted, setFormatted] = useState(() => {
    const d = timeStr ? `${dateStr}T${timeStr}Z` : `${dateStr}T00:00:00Z`;
    return formatElapsedTime(new Date(d));
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const getMomentDate = () => {
      const d = timeStr ? `${dateStr}T${timeStr}Z` : `${dateStr}T00:00:00Z`;
      return new Date(d);
    };

    const update = () => {
      const past = getMomentDate();
      setFormatted(formatElapsedTime(past));
      return past;
    };

    const startTimer = () => {
      const past = update();
      const elapsed = calculateElapsedTime(past);
      const interval = getRefreshInterval(elapsed);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(update, interval);
    };

    startTimer();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') startTimer();
      else if (intervalRef.current) clearInterval(intervalRef.current);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [dateStr, timeStr]);

  return formatted;
}
```

- [ ] **Step 4: Wire MomentsProvider into root layout**

Update `src/app/_layout.tsx` — wrap the `<Stack>` with `<MomentsProvider>`:

Add import:
```typescript
import { MomentsProvider } from '../context/MomentsContext';
```

Wrap Stack:
```tsx
<MomentsProvider>
  <Stack screenOptions={{ headerShown: false }} />
</MomentsProvider>
```

- [ ] **Step 5: Commit**

```bash
git add src/context/ src/hooks/ src/app/_layout.tsx
git commit -m "feat: add MomentsContext, useMoments, and useElapsedTime hooks"
```

---

## Task 6: Core UI Components

**Files:**
- Create: `src/components/ElapsedTimeDisplay.tsx`
- Create: `src/components/MomentCard.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/components/EmojiPicker.tsx`
- Create: `src/components/ColorPicker.tsx`
- Create: `src/components/MomentForm.tsx`

- [ ] **Step 1: Create ElapsedTimeDisplay component**

Create `src/components/ElapsedTimeDisplay.tsx`:
```typescript
import { Text, StyleSheet, type TextStyle } from 'react-native';
import { useElapsedTime } from '../hooks/useElapsedTime';
import { FONTS } from '../constants/fonts';
import { COLORS } from '../constants/theme';

interface Props {
  date: string;
  time: string | null;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function ElapsedTimeDisplay({ date, time, style, size = 'md' }: Props) {
  const formatted = useElapsedTime(date, time);

  return (
    <Text style={[styles.base, styles[size], style]}>
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FONTS.mono,
    color: COLORS.text,
  },
  sm: { fontSize: 12 },
  md: { fontSize: 16 },
  lg: { fontSize: 28 },
});
```

- [ ] **Step 2: Create MomentCard component**

Create `src/components/MomentCard.tsx`:
```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ElapsedTimeDisplay } from './ElapsedTimeDisplay';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';
import type { Moment } from '../db/moments';

interface Props {
  moment: Moment;
  onPress: (id: string) => void;
}

export function MomentCard({ moment, onPress }: Props) {
  return (
    <Pressable onPress={() => onPress(moment.id)} style={styles.container}>
      <View style={[styles.stripe, { backgroundColor: moment.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{moment.emoji}</Text>
          <Text style={styles.title} numberOfLines={1}>{moment.title}</Text>
        </View>
        <ElapsedTimeDisplay date={moment.date} time={moment.time} size="sm" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  stripe: {
    width: 8,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  emoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.text,
    flex: 1,
  },
});
```

- [ ] **Step 3: Create EmptyState component**

Create `src/components/EmptyState.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📅</Text>
      <Text style={styles.title}>No moments yet!</Text>
      <Text style={styles.subtitle}>Tap + to add your first special date</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
});
```

- [ ] **Step 4: Create EmojiPicker component**

Create `src/components/EmojiPicker.tsx`:
```typescript
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { EMOJI_PRESETS } from '../constants/colors';
import { COLORS, BORDERS, SPACING } from '../constants/theme';

interface Props {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {EMOJI_PRESETS.map((emoji) => (
        <Pressable
          key={emoji}
          style={[styles.cell, selected === emoji && styles.selected]}
          onPress={() => onSelect(emoji)}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cell: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.accent,
  },
  emoji: { fontSize: 28 },
});
```

- [ ] **Step 5: Create ColorPicker component**

Create `src/components/ColorPicker.tsx`:
```typescript
import { View, Pressable, StyleSheet } from 'react-native';
import { MOMENT_COLORS } from '../constants/colors';
import { COLORS, BORDERS, SPACING } from '../constants/theme';

interface Props {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {MOMENT_COLORS.map((color) => (
        <Pressable
          key={color}
          style={[
            styles.swatch,
            { backgroundColor: color },
            selected === color && styles.selected,
          ]}
          onPress={() => onSelect(color)}
          accessibilityLabel={`Color ${color}`}
          accessibilityRole="button"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  swatch: {
    width: 44,
    height: 44,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
  },
  selected: {
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});
```

- [ ] **Step 6: Create MomentForm shared component**

Create `src/components/MomentForm.tsx`:
```typescript
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
    if (!title.trim()) {
      Alert.alert('Title required', 'Please give your moment a name');
      return;
    }
    if (date > new Date()) {
      Alert.alert('Invalid date', 'Date must be in the past');
      return;
    }

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
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Our Wedding Day"
        placeholderTextColor={COLORS.textLight}
        maxLength={100}
      />

      <Text style={styles.label}>Date</Text>
      <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }}
        />
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Include time?</Text>
        <Switch value={includeTime} onValueChange={setIncludeTime} trackColor={{ true: COLORS.primary }} />
      </View>

      {includeTime && (
        <>
          <Pressable style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateText}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              onChange={(_, t) => { setShowTimePicker(Platform.OS === 'ios'); if (t) setTime(t); }}
            />
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
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    fontFamily: FONTS.body,
    fontSize: 20,
    color: COLORS.text,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  dateButton: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  dateText: { fontFamily: FONTS.mono, fontSize: 18, color: COLORS.text },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  submitText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.surface,
  },
});
```

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add core UI components (MomentCard, ElapsedTimeDisplay, Form, Pickers)"
```

---

## Task 7: Home Screen (Moments List)

**Files:**
- Modify: `src/app/(tabs)/index.tsx`

- [ ] **Step 1: Implement Home screen with moments list**

Replace `src/app/(tabs)/index.tsx`:
```typescript
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoments } from '../../hooks/useMoments';
import { MomentCard } from '../../components/MomentCard';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function HomeScreen() {
  const { moments, loading } = useMoments();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>GudMoment</Text>
        <Pressable style={styles.scanButton} onPress={() => router.push('/scan')}>
          <Text style={styles.scanIcon}>📷</Text>
        </Pressable>
      </View>

      {moments.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <FlatList
          data={moments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MomentCard moment={item} onPress={(id) => router.push(`/moment/${id}`)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/moment/create')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.text },
  scanButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
  },
  scanIcon: { fontSize: 22 },
  list: { paddingTop: SPACING.md, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl + 60,
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  fabText: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.surface, marginTop: -2 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(tabs\)/index.tsx
git commit -m "feat: implement home screen with moments list and FAB"
```

---

## Task 8: Create & Edit Moment Screens

**Files:**
- Create: `src/app/moment/create.tsx`
- Create: `src/app/moment/edit/[id].tsx`

- [ ] **Step 1: Implement Create Moment screen**

Create `src/app/moment/create.tsx`:
```typescript
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MomentForm } from '../../components/MomentForm';
import { useMoments } from '../../hooks/useMoments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function CreateMomentScreen() {
  const { addMoment } = useMoments();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>New Moment</Text>
        <View style={{ width: 60 }} />
      </View>
      <MomentForm
        submitLabel="Save Moment"
        onSubmit={async (values) => {
          await addMoment(values);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.text },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
});
```

- [ ] **Step 2: Implement Edit Moment screen**

Create `src/app/moment/edit/[id].tsx`:
```typescript
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { MomentForm } from '../../../components/MomentForm';
import { useMoments } from '../../../hooks/useMoments';
import { getMomentById, type Moment } from '../../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../../constants/theme';
import { FONTS } from '../../../constants/fonts';

export default function EditMomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { editMoment } = useMoments();
  const router = useRouter();
  const [moment, setMoment] = useState<Moment | null>(null);

  useEffect(() => {
    if (id) getMomentById(id).then(setMoment);
  }, [id]);

  if (!moment) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Moment</Text>
        <View style={{ width: 60 }} />
      </View>
      <MomentForm
        initialValues={moment}
        submitLabel="Save Changes"
        onSubmit={async (values) => {
          await editMoment(id!, values);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.text },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/app/moment/
git commit -m "feat: add create and edit moment screens"
```

---

## Task 9: Moment Detail Screen

**Files:**
- Create: `src/app/moment/[id].tsx`

- [ ] **Step 1: Implement Moment Detail screen**

Create `src/app/moment/[id].tsx`:
```typescript
import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ElapsedTimeDisplay } from '../../components/ElapsedTimeDisplay';
import { useMoments } from '../../hooks/useMoments';
import { getMomentById, type Moment } from '../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function MomentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { removeMoment } = useMoments();
  const router = useRouter();
  const [moment, setMoment] = useState<Moment | null>(null);

  useEffect(() => {
    if (id) getMomentById(id).then(setMoment);
  }, [id]);

  const handleDelete = () => {
    if (!moment) return;
    Alert.alert(
      `Delete ${moment.title}?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeMoment(moment.id);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!moment) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <View style={[styles.heroCard, { backgroundColor: moment.color + '22' }]}>
          <Text style={styles.emoji}>{moment.emoji}</Text>
          <Text style={styles.title}>{moment.title}</Text>
          <ElapsedTimeDisplay date={moment.date} time={moment.time} size="lg" />
          <Text style={styles.dateLabel}>
            {new Date(moment.date).toLocaleDateString(undefined, {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
            onPress={() => router.push(`/moment/qr/${id}`)}
          >
            <Text style={styles.actionText}>Share via QR</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: COLORS.accent }]}
            onPress={() => router.push(`/moment/edit/${id}`)}
          >
            <Text style={[styles.actionText, { color: COLORS.text }]}>Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            onPress={handleDelete}
          >
            <Text style={styles.actionText}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  backButton: { marginBottom: SPACING.md },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
  heroCard: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  dateLabel: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textLight, marginTop: SPACING.sm },
  actions: { gap: SPACING.md },
  actionButton: {
    padding: SPACING.lg,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.surface },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/moment/\\[id\\].tsx
git commit -m "feat: add moment detail screen with delete confirmation"
```

---

## Task 10: QR Code Screens (Generate & Scan)

**Files:**
- Create: `src/app/moment/qr/[id].tsx`
- Create: `src/components/QRGenerator.tsx`
- Create: `src/app/scan.tsx`

- [ ] **Step 1: Create QRGenerator component**

Create `src/components/QRGenerator.tsx`:
```typescript
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, BORDERS } from '../constants/theme';

interface Props {
  value: string;
  size?: number;
}

export function QRGenerator({ value, size = 250 }: Props) {
  return (
    <View style={styles.container}>
      <QRCode value={value} size={size} backgroundColor={COLORS.surface} color={COLORS.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
});
```

- [ ] **Step 2: Create QR display screen**

Create `src/app/moment/qr/[id].tsx`:
```typescript
import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QRGenerator } from '../../../components/QRGenerator';
import { getMomentById } from '../../../db/moments';
import { encodeMomentForQR } from '../../../utils/qrCodec';
import { COLORS, BORDERS, SPACING } from '../../../constants/theme';
import { FONTS } from '../../../constants/fonts';

export default function QRScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [qrData, setQrData] = useState<string | null>(null);
  const [momentTitle, setMomentTitle] = useState('');
  const [momentDate, setMomentDate] = useState('');

  useEffect(() => {
    if (!id) return;
    getMomentById(id).then((m) => {
      if (!m) return;
      setMomentTitle(m.title);
      setMomentDate(m.date);
      setQrData(encodeMomentForQR({
        v: 1,
        title: m.title,
        date: m.date,
        time: m.time || undefined,
        timezone: m.timezone,
        icon: m.emoji,
        color: m.color,
      }));
    });
  }, [id]);

  if (!qrData) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{momentTitle}</Text>
        <QRGenerator value={qrData} size={280} />
        <Text style={styles.date}>{new Date(momentDate).toLocaleDateString()}</Text>
        <Text style={styles.hint}>Ask your partner to scan this in GudMoment</Text>
        <Pressable style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  title: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.text, marginBottom: SPACING.xl },
  date: { fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textLight, marginTop: SPACING.lg },
  hint: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textLight, marginTop: SPACING.sm },
  doneButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  doneText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.surface },
});
```

- [ ] **Step 3: Create QR Scanner screen**

Create `src/app/scan.tsx`:
```typescript
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decodeMomentFromQR } from '../utils/qrCodec';
import { useMoments } from '../hooks/useMoments';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { addMoment } = useMoments();
  const router = useRouter();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const payload = decodeMomentFromQR(data);
    if (!payload) {
      Alert.alert('Invalid QR', "This QR doesn't contain a valid moment", [
        { text: 'Try Again', onPress: () => setScanned(false) },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
      return;
    }

    await addMoment({
      title: payload.title,
      date: payload.date,
      time: payload.time,
      timezone: payload.timezone,
      emoji: payload.icon,
      color: payload.color,
    });

    Alert.alert('Moment Added!', `"${payload.title}" has been saved`, [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permText}>Camera permission needed to scan QR codes</Text>
        <Pressable style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Scan Moment</Text>
        <View style={{ width: 60 }} />
      </View>
      <Text style={styles.instruction}>Point camera at a GudMoment QR code</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View style={styles.frame} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.text },
  back: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.primary },
  instruction: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.text, textAlign: 'center', padding: SPACING.md },
  cameraContainer: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  frame: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '50%',
    borderWidth: BORDERS.width + 1,
    borderColor: COLORS.primary,
  },
  permText: { fontFamily: FONTS.body, fontSize: 18, color: COLORS.text, textAlign: 'center', padding: SPACING.xl },
  permButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    margin: SPACING.xl,
    alignItems: 'center',
  },
  permButtonText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.surface },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/QRGenerator.tsx src/app/moment/qr/ src/app/scan.tsx
git commit -m "feat: add QR code generation and scanning screens"
```

---

## Task 11: Notifications System

**Files:**
- Create: `src/hooks/useNotifications.ts`
- Create: `src/components/NotificationPicker.tsx`

- [ ] **Step 1: Create useNotifications hook**

Create `src/hooks/useNotifications.ts`:
```typescript
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { getNotificationsForMoment, createNotification, deleteNotificationsForMoment, type CreateNotificationInput } from '../db/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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
```

- [ ] **Step 2: Create NotificationPicker component**

Create `src/components/NotificationPicker.tsx`:
```typescript
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
```

- [ ] **Step 3: Add NotificationPicker to Moment Detail screen**

In `src/app/moment/[id].tsx`, add the `NotificationPicker` component after the action buttons:

```typescript
import { NotificationPicker } from '../../components/NotificationPicker';
```

Add inside the ScrollView, after the actions View:
```tsx
<NotificationPicker momentId={moment.id} momentTitle={moment.title} momentDate={moment.date} />
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useNotifications.ts src/components/NotificationPicker.tsx src/app/moment/\\[id\\].tsx
git commit -m "feat: add notification system with recurring milestone reminders"
```

---

## Task 12: Settings Screen (Export/Import)

**Files:**
- Modify: `src/app/(tabs)/settings.tsx`

- [ ] **Step 1: Implement Settings screen with export/import**

Replace `src/app/(tabs)/settings.tsx`:
```typescript
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoments } from '../../hooks/useMoments';
import { getAllMoments, createMoment } from '../../db/moments';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { loadMoments } = useMoments();

  const handleExport = async () => {
    const moments = await getAllMoments();
    const data = JSON.stringify({ v: 1, moments, exportedAt: new Date().toISOString() }, null, 2);
    const path = `${FileSystem.cacheDirectory}gudmoment-backup.json`;
    await FileSystem.writeAsStringAsync(path, data);
    await Sharing.shareAsync(path, { mimeType: 'application/json' });
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled) return;

    try {
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);
      if (!data.v || !Array.isArray(data.moments)) {
        Alert.alert('Invalid file', 'This file is not a valid GudMoment backup');
        return;
      }

      let imported = 0;
      for (const m of data.moments) {
        await createMoment({
          title: m.title,
          date: m.date,
          time: m.time,
          timezone: m.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          emoji: m.emoji,
          color: m.color,
        });
        imported++;
      }

      await loadMoments();
      Alert.alert('Import Complete', `${imported} moments imported`);
    } catch {
      Alert.alert('Import Failed', 'Could not read the backup file');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionTitle}>Data</Text>
        <Pressable style={styles.button} onPress={handleExport}>
          <Text style={styles.buttonText}>Export All Moments</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleImport}>
          <Text style={styles.buttonText}>Import Moments</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>GudMoment</Text>
          <Text style={styles.version}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={styles.aboutText}>Track your special moments.</Text>
          <Text style={styles.aboutText}>Open source on GitHub.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.text, marginBottom: SPACING.xl },
  sectionTitle: { fontFamily: FONTS.bodySemiBold, fontSize: 18, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  button: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonText: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.text },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  appName: { fontFamily: FONTS.heading, fontSize: 22, color: COLORS.primary },
  version: { fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textLight, marginTop: SPACING.xs },
  aboutText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, marginTop: SPACING.sm },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(tabs\)/settings.tsx
git commit -m "feat: add settings screen with data export/import"
```

---

## Task 13: Widgets (Android)

**Files:**
- Create: `src/utils/widgetBridge.ts`
- Create: `src/widgets/MultiMomentWidget/index.tsx`
- Create: `src/widgets/RandomMomentWidget/index.tsx`

> **Note:** iOS WidgetKit requires native Swift code and an Expo config plugin. Android widgets via `react-native-android-widget` are simpler to implement first. iOS widget implementation should be tracked as a follow-up task after the core app is working.

- [ ] **Step 1: Create widget bridge utility**

Create `src/utils/widgetBridge.ts`:
```typescript
import { SharedGroupPreferences } from 'react-native-shared-group-preferences';
import { Platform } from 'react-native';
import { getAllMoments } from '../db/moments';
import { formatElapsedTime } from './timeCalculator';

const WIDGET_DATA_KEY = 'gudmoment_widget_data';
const APP_GROUP = 'group.com.gudmoment.shared'; // iOS App Group

export interface WidgetMomentData {
  id: string;
  title: string;
  emoji: string;
  color: string;
  elapsed: string;
  date: string;
  time: string | null;
}

export async function updateWidgetData(): Promise<void> {
  const moments = await getAllMoments();
  const widgetData: WidgetMomentData[] = moments.map((m) => ({
    id: m.id,
    title: m.title,
    emoji: m.emoji,
    color: m.color,
    elapsed: formatElapsedTime(new Date(m.time ? `${m.date}T${m.time}Z` : `${m.date}T00:00:00Z`)),
    date: m.date,
    time: m.time,
  }));

  try {
    await SharedGroupPreferences.setItem(
      WIDGET_DATA_KEY,
      JSON.stringify(widgetData),
      Platform.OS === 'ios' ? APP_GROUP : undefined
    );
  } catch {
    // Widget data update is best-effort; don't crash the app
    console.warn('Failed to update widget data');
  }
}

export async function getWidgetData(): Promise<WidgetMomentData[]> {
  try {
    const data = await SharedGroupPreferences.getItem(
      WIDGET_DATA_KEY,
      Platform.OS === 'ios' ? APP_GROUP : undefined
    );
    if (!data) return [];
    return JSON.parse(data as string);
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Install SharedGroupPreferences**

```bash
npm install react-native-shared-group-preferences
```

- [ ] **Step 3: Create Android widget components**

Create `src/widgets/MultiMomentWidget/index.tsx`:
```typescript
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetMomentData } from '../../utils/widgetBridge';

interface Props {
  moments: WidgetMomentData[];
}

export function MultiMomentWidget({ moments }: Props) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FAFAFA',
        borderRadius: 0,
        padding: 12,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <TextWidget
        text="GudMoment"
        style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }}
      />
      {moments.slice(0, 5).map((m) => (
        <FlexWidget
          key={m.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 4,
            borderWidth: 2,
            borderColor: '#1A1A1A',
          }}
        >
          <TextWidget text={m.emoji} style={{ fontSize: 18 }} />
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget text={m.title} style={{ fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' }} />
            <TextWidget text={m.elapsed} style={{ fontSize: 11, color: '#666666' }} />
          </FlexWidget>
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}
```

Create `src/widgets/RandomMomentWidget/index.tsx`:
```typescript
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetMomentData } from '../../utils/widgetBridge';

interface Props {
  moment: WidgetMomentData | null;
}

export function RandomMomentWidget({ moment }: Props) {
  if (!moment) {
    return (
      <FlexWidget
        style={{ height: 'match_parent', width: 'match_parent', backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}
      >
        <TextWidget text="No moments yet" style={{ fontSize: 14, color: '#666666' }} />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FAFAFA',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: moment.color,
      }}
    >
      <TextWidget text={moment.emoji} style={{ fontSize: 40 }} />
      <TextWidget text={moment.title} style={{ fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginTop: 8 }} />
      <TextWidget text={moment.elapsed} style={{ fontSize: 14, color: '#1A1A1A', marginTop: 4 }} />
    </FlexWidget>
  );
}
```

- [ ] **Step 4: Wire widget data updates into MomentsContext**

In `src/context/MomentsContext.tsx`, import and call `updateWidgetData` after every CRUD operation:

```typescript
import { updateWidgetData } from '../utils/widgetBridge';
```

Add `updateWidgetData()` calls after `dispatch` in `addMoment`, `editMoment`, and `removeMoment`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/widgetBridge.ts src/widgets/ src/context/MomentsContext.tsx
git commit -m "feat: add Android widgets and widget data bridge"
```

---

## Task 14: Final Polish & Open Source Setup

**Files:**
- Create: `LICENSE`
- Create: `.github/workflows/ci.yml`
- Modify: `.gitignore`

- [ ] **Step 1: Add MIT License**

Create `LICENSE` with MIT License text, copyright holder: the user's name.

- [ ] **Step 2: Add GitHub Actions CI**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx jest --passWithNoTests
```

- [ ] **Step 3: Update .gitignore**

Ensure `.gitignore` includes:
```
node_modules/
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
.env.local
eas.json
```

- [ ] **Step 4: Commit**

```bash
git add LICENSE .github/ .gitignore
git commit -m "chore: add MIT license, CI workflow, and gitignore"
```

---

## Task Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Project scaffold & dependencies | 12 |
| 2 | Time calculator utility (TDD) | 5 |
| 3 | QR codec utility (TDD) | 5 |
| 4 | Database layer | 6 |
| 5 | Moments context & hooks | 5 |
| 6 | Core UI components | 8 |
| 7 | Home screen | 2 |
| 8 | Create & edit screens | 3 |
| 9 | Moment detail screen | 2 |
| 10 | QR code screens | 4 |
| 11 | Notifications system | 4 |
| 12 | Settings screen | 3 |
| 13 | Widgets (Android) | 5 |
| 14 | Final polish & open source | 4 |
| **Total** | | **68 steps** |

## Follow-up Tasks (Post-MVP)

These are tracked but not included in this plan:
- iOS WidgetKit implementation (requires native Swift code + Expo config plugin)
- Drag-to-reorder moments on home screen
- Widget configuration screen in Settings
- App icon and splash screen design
- Store listing assets
- EAS Build configuration for production

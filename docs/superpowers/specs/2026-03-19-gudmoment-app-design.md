# GudMoment - Special Date Tracker App

## Overview

GudMoment is a React Native (Expo) app for Android and iOS that lets users save special dates and see how long ago they happened. Each saved date is called a "moment." The app displays elapsed time using a smart format that adapts granularity based on how long ago the moment occurred.

The app is local-first (no server), supports sharing moments via QR code, and provides two home screen widgets. It will be open-sourced on GitHub and published to both Play Store and App Store.

**Target users**: Couples and individuals who want to track meaningful dates together.

## Core Features

### 1. Moments (CRUD)

Each moment contains:
- **Title** — e.g., "Our Wedding Day"
- **Date & Time** — the special date (required: date, optional: time)
- **Icon/Emoji** — a visual identifier picked by the user
- **Color** — accent color for the moment card (brutalist palette)
- **Notification settings** — customizable milestone reminders

Users can create, edit, and delete moments. Moments are stored locally in SQLite.

### 2. Smart Time Display

Elapsed time adapts based on the moment's age:

| Age of moment | Display format |
|---|---|
| < 1 hour | X minutes X seconds ago |
| < 24 hours | X hours X minutes ago |
| < 30 days | X days X hours ago |
| < 1 year | X months X days ago |
| >= 1 year | X years X months X days ago |

The detail screen updates every 1 second when moment is < 1 hour old, otherwise every 1 minute. Timer pauses when screen loses focus. The list screen updates every minute.

**Future dates**: The app only tracks past dates. The create/edit form validates that dates cannot be in the future.

### 3. Customizable Milestone Notifications

Users configure reminders per moment:
- **Recurring**: Every year, every 2 years, every 6 months, monthly
- **Custom specific**: Notify on specific anniversaries (e.g., 1st, 5th, 10th year)
- **Custom date list**: User adds specific dates to be reminded

Notifications are scheduled locally using Expo Notifications. When a notification fires, it shows: "[Moment Title] — X years ago today!"

### 4. QR Code Sharing

Users can share a single moment via QR code:
- Generate QR from moment detail screen
- QR encodes a compact JSON payload: `{ v: 1, title, date, time?, timezone, icon, color }`
- Title limited to 100 characters to stay within QR capacity
- Version field (`v`) allows backward-compatible schema evolution
- Recipient scans QR from within the app to import the moment
- Imported moments are independent copies (no sync)

### 5. Home Screen Widgets

Two widget types:

**Multi-Moment List Widget**
- Displays a fixed list of up to 4-5 selected moments with their elapsed time (widgets do not support smooth scrolling)
- User picks which moments appear in widget settings
- Compact display: icon + title + "X years X months ago"
- Updates every 15 minutes

**Random Rotation Widget (Single Moment)**
- Shows one moment at a time with full elapsed time display
- Rotates to a random moment from the user's selected pool
- Rotation interval configurable (e.g., every 30 min, every hour, every tap)
- Tap to open the moment in the app

## Technical Architecture

### Tech Stack

- **Framework**: React Native with Expo (development build via `expo-dev-client` — required for native widgets)
- **Language**: TypeScript
- **Storage**: Expo SQLite
- **Notifications**: Expo Notifications (local only)
- **QR Code**: `react-native-qrcode-svg` (generate) + `expo-camera` (scan)
- **Widgets**: `react-native-android-widget` + iOS WidgetKit via Expo config plugin
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + useReducer (simple, no external lib)
- **OTA Updates**: EAS Update
- **Build/Deploy**: EAS Build for Play Store and App Store

### Project Structure

```
src/
  app/                    # Expo Router screens
    (tabs)/
      index.tsx           # Home — moments list
      settings.tsx        # Settings screen
    moment/
      [id].tsx            # Moment detail
      create.tsx          # Add moment
      edit/[id].tsx       # Edit moment
      qr/[id].tsx         # QR code view
    scan.tsx              # QR scanner
    _layout.tsx           # Root layout
  components/
    MomentCard.tsx        # Moment card for list view
    ElapsedTimeDisplay.tsx # Smart elapsed time display component
    QRGenerator.tsx       # QR code generator
    QRScanner.tsx         # QR code scanner
    NotificationPicker.tsx # Notification config UI
    EmojiPicker.tsx       # Emoji/icon selector
    ColorPicker.tsx       # Color selector
  db/
    schema.ts             # SQLite schema definitions
    moments.ts            # Moment CRUD operations
    notifications.ts      # Notification schedule storage
  hooks/
    useMoments.ts         # Moments data hook
    useElapsedTime.ts     # Real-time elapsed time calculator
    useNotifications.ts   # Notification scheduling hook
  utils/
    timeCalculator.ts     # Smart time format logic
    qrCodec.ts            # JSON encode/decode for QR
  widgets/
    MultiMomentWidget/    # List widget
    RandomMomentWidget/   # Rotation widget
  constants/
    theme.ts              # Brutalist theme tokens
    fonts.ts              # Font configuration
```

### Data Model (SQLite)

```sql
CREATE TABLE moments (
  id TEXT PRIMARY KEY,        -- UUID
  title TEXT NOT NULL,         -- max 100 characters
  date TEXT NOT NULL,          -- ISO 8601 date (UTC)
  time TEXT,                   -- HH:MM:SS or null (UTC)
  timezone TEXT NOT NULL,      -- IANA timezone e.g. 'Asia/Jakarta' (original timezone at creation)
  emoji TEXT DEFAULT '❤️',
  color TEXT DEFAULT '#FF0000',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  moment_id TEXT NOT NULL,
  type TEXT NOT NULL,           -- 'recurring' | 'specific' | 'custom_dates'
  recurring_interval TEXT,     -- 'yearly' | '2yearly' | '6monthly' | 'monthly'
  specific_years TEXT,         -- JSON array e.g. [1, 5, 10, 25]
  custom_dates TEXT,           -- JSON array of ISO date strings e.g. ["2026-06-15", "2027-01-30"]
  enabled INTEGER DEFAULT 1,
  FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE
);

CREATE TABLE widget_config (
  id TEXT PRIMARY KEY,
  widget_type TEXT NOT NULL,   -- 'multi' | 'random'
  moment_ids TEXT NOT NULL,    -- JSON array of moment IDs
  rotation_interval INTEGER,   -- minutes (for random widget)
  updated_at TEXT NOT NULL
);
```

### Widget Data Sharing

Widgets run in a separate process and cannot access the app's SQLite directly.

- **iOS**: Use App Groups with shared UserDefaults. The app writes denormalized widget data (JSON with moment titles, dates, elapsed times) to the shared container whenever moments are created, updated, or deleted.
- **Android**: Use SharedPreferences written by the app and read by the widget via `react-native-android-widget`.

The app updates the shared widget data store on every moment CRUD operation.

### Database Migrations

The app uses SQLite's `user_version` pragma to track schema version:
- On app launch, check `PRAGMA user_version`
- Run any pending migration scripts sequentially
- Migration scripts are stored in `src/db/migrations/` as numbered files (e.g., `001_initial.ts`, `002_add_timezone.ts`)
- Each migration is wrapped in a transaction for atomicity

This ensures users who update the app via the store don't lose data when the schema evolves.

### Timezone Handling

- Moments store dates in UTC with the original IANA timezone (e.g., `Asia/Jakarta`) captured at creation
- Elapsed time is always calculated from UTC, so timezone changes don't affect accuracy
- Display formatting respects the original timezone for showing the moment's date

## UI Design: Brutalism + Cute/Funny Font

### Design Principles

- **Bold borders**: Thick black outlines (3-4px) on all cards and buttons
- **Raw backgrounds**: Solid, flat colors — no gradients, no shadows (or offset hard shadows)
- **Offset shadows**: Hard-edged box shadows offset 4-6px (black)
- **High contrast**: Black text on bright backgrounds
- **Chunky buttons**: Large, rectangular, with thick borders
- **Playful typography**: A rounded/bubbly display font for headings, monospace for countdown numbers

### Font Choices

- **Headings/Titles**: Fredoka One or Baloo 2 (rounded, playful, cute)
- **Countdown numbers**: Space Mono or JetBrains Mono (monospace, gives the numbers weight)
- **Body text**: Nunito (friendly, readable)

### Color Palette

```
Primary:     #FF6B6B (coral red)
Secondary:   #4ECDC4 (teal)
Accent:      #FFE66D (yellow)
Background:  #FAFAFA (off-white)
Surface:     #FFFFFF (white)
Border:      #1A1A1A (near-black)
Text:        #1A1A1A (near-black)
```

Users can pick custom accent colors per moment from a preset brutalist palette.

### Screen Layouts

**Home Screen (Moments List)**
- Top bar: App title "GudMoment" in playful font + scan QR button
- Floating "+" button (bottom right) to add new moment
- Default sort: most recent moment date first; user can reorder manually (drag to rearrange)
- Cards in a vertical list, each showing:
  - Emoji + Title (bold)
  - Elapsed time in smart format
  - Thick border, offset shadow, moment's accent color as left stripe

**Add/Edit Moment Screen**
- Large text input for title (brutalist underline style)
- Date picker (native)
- Optional time picker toggle
- Emoji picker grid
- Color picker (brutalist swatches with thick borders)
- Notification settings section (expandable)
- Save button (big, chunky, full-width)

**Moment Detail Screen**
- Full-width header with emoji and title
- Large countdown display (animated numbers in monospace)
- "Share via QR" button
- Notification settings summary
- Edit / Delete actions

**QR Share Screen**
- Large QR code centered
- Moment title and date below
- "Done" button

**QR Scanner Screen**
- Camera viewfinder with brutalist frame overlay
- Instructions text at top

**Settings Screen**
- Widget configuration
- Export/Import data (JSON backup for device migration)
- About section (version, GitHub link)
- Open source licenses

**Delete Confirmation**
- Uses native alert dialog: "Delete [Moment Title]? This cannot be undone." with Cancel/Delete buttons

## Screens Flow

```
Home (Moments List)
  ├── + → Add Moment → (save) → Home
  ├── Card tap → Moment Detail
  │     ├── Share QR → QR View
  │     ├── Edit → Edit Moment → (save) → Detail
  │     └── Delete → (confirm) → Home
  ├── Scan QR → Scanner → (import) → Home
  └── Settings
        └── Widget Config
```

## Error Handling

- **Empty state**: Show friendly illustration + "Add your first moment!" prompt
- **QR scan failure**: Toast message "Couldn't read QR code, try again"
- **QR invalid data**: Toast "This QR doesn't contain a valid moment"
- **Notification permission denied**: Show in-app banner explaining why notifications matter
- **SQLite errors**: Graceful fallback with user-friendly error message

## Accessibility

- Support VoiceOver (iOS) and TalkBack (Android) with meaningful content descriptions
- Minimum 44pt tap targets on all interactive elements
- Respect system font size settings (dynamic type)
- Emoji/icons include text alternatives for screen readers
- High contrast design (brutalist aesthetic naturally supports this)

## Testing Strategy

- **Unit tests**: Time calculator logic, QR codec, data model operations
- **Component tests**: Key UI components (MomentCard, ElapsedTimeDisplay)
- **Integration tests**: Full CRUD flow, QR share/import flow
- **Manual testing**: Widgets on both platforms, notification delivery

## Open Source Considerations

- MIT License
- README with screenshots, setup instructions, contribution guide
- GitHub Actions for CI (lint, type-check, tests)
- `.env.example` for any configuration
- EAS project ID excluded from repo (added to `.gitignore`)

## App Assets

- **App icon**: Brutalist-style icon (designed separately)
- **Splash screen**: App name "GudMoment" in playful font on solid color background
- **Store listing**: Screenshots, description, and feature graphic (designed during publishing phase)

## Publishing

- **Play Store**: EAS Build for Android, standard listing
- **App Store**: EAS Build for iOS, standard listing
- **OTA Updates**: EAS Update for non-native changes

# GudMoment

Track your special moments and see how long ago they happened. A React Native app with a brutalist UI and cute fonts.

## Features

- Save special dates with custom emoji and colors
- Smart elapsed time display (adapts format based on age)
- Share moments with your partner via QR code
- Customizable milestone notifications (yearly, monthly, custom)
- Home screen widgets (multi-moment list + random rotation)
- Export/import data for device migration
- Drag to reorder your moments

## Tech Stack

- React Native with Expo (development build)
- TypeScript
- Expo SQLite (local storage)
- Expo Router (file-based navigation)
- Expo Notifications (local scheduling)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Expo CLI: `npm install -g eas-cli`
- iOS Simulator (Mac) or Android Emulator

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GudMoment.git
   cd GudMoment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy EAS config:
   ```bash
   cp eas.json.example eas.json
   ```

4. Start development build:
   ```bash
   npx expo start --dev-client
   ```

   Or run on a specific platform:
   ```bash
   npx expo run:ios
   npx expo run:android
   ```

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
  app/          # Expo Router screens
  components/   # Reusable UI components
  constants/    # Theme, fonts, colors
  context/      # React Context (state management)
  db/           # SQLite database layer
  hooks/        # Custom React hooks
  utils/        # Pure utility functions
  widgets/      # Android widget components
```

## Design

Brutalist UI with playful typography:
- **Headings**: Fredoka One
- **Numbers**: Space Mono
- **Body**: Nunito

Color palette: Coral red, teal, yellow on off-white with thick black borders.

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

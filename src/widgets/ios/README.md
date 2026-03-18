# iOS WidgetKit Integration

## Overview

iOS home screen widgets require Apple's **WidgetKit** framework, which is written in Swift and runs as a separate extension target. Unlike Android widgets (which can be built with `react-native-android-widget`), iOS widgets cannot be implemented in JavaScript/TypeScript alone.

## Current State

The data layer is already prepared:

- **`src/utils/widgetBridge.ts`** writes moment data to shared storage using `react-native-shared-group-preferences`. This is the same pattern used by native WidgetKit extensions to read data from the main app via App Groups.
- **`src/db/widgetConfig.ts`** manages widget configuration (selected moments, display order).

## What Is Needed

To add iOS widgets to this Expo development build:

1. **Create a WidgetKit extension** in Swift that reads from the shared App Groups container.
2. **Create an Expo config plugin** (`withWidgetExtension`) that:
   - Adds the WidgetKit extension target to the Xcode project during prebuild.
   - Configures App Groups for both the main app and the widget extension.
   - Copies the Swift widget source files into the generated iOS project.
3. **Configure App Groups** so the main app and widget extension share the same `UserDefaults` suite (e.g., `group.com.gudmoment.shared`).
4. **Update `app.json`** to register the config plugin.

## Implementation Approach

The recommended approach for Expo development builds:

```
plugins/
  withWidgetExtension.js    # Expo config plugin
ios-widget/
  GudMomentWidget.swift     # Widget entry point
  MomentTimelineProvider.swift  # Timeline provider
  MomentWidgetView.swift    # SwiftUI view
```

The config plugin uses Expo's `withXcodeProject` mod to inject the extension target during `expo prebuild`.

## Resources

- [Expo Config Plugins Introduction](https://docs.expo.dev/config-plugins/introduction/)
- [Expo Config Plugins Development](https://docs.expo.dev/config-plugins/development-and-debugging/)
- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Groups for Data Sharing](https://developer.apple.com/documentation/foundation/userdefaults/init(suitename:))

## Status

**Planned for a future release.** The data bridge is ready; the native Swift extension and Expo config plugin still need to be built and tested in Xcode.

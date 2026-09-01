# Mobile App Strategy & Native Packaging (Phase 14)

## 1. Native Packaging Architecture (Capacitor)
- Configuration: `client/capacitor.config.ts`
- Package Identifier: `com.astrologer.app`
- App Name: `Astrologer`
- Web Asset Directory: `dist`

---

## 2. Core Native Capabilities Mapping

| Web Feature | Native Equivalent (Capacitor) | Native Permission / Scope |
|---|---|---|
| **PWA Web Push** | `@capacitor/push-notifications` | Android Notification Permission / iOS APNs |
| **PWA Deep Links** | `@capacitor/app` (`appUrlOpen`) | Universal Links (iOS) / Android App Links |
| **Voice AI STT** | Web Audio API / Native Speech Plugin | `RECORD_AUDIO` / `NSMicrophoneUsageDescription` |
| **PWA Share** | `navigator.share` / `@capacitor/share` | Native system share sheet |

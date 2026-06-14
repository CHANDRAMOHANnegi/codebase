# StyleMirror 💈

> Scan your face. Find your cut. Walk into the barber ready.

StyleMirror is a React Native (Expo) Android app that uses real ML Kit face detection to analyse your face shape and recommend personalised hairstyles — with animated overlays, barber notes, and a saved looks library.

---

## Screenshots

| Welcome | Try On | Scan Result | Saved Looks |
|---------|--------|-------------|-------------|
| Face scan intro | Camera + overlay | Face signals | Persisted library |

---

## Features

- **Real face detection** — ML Kit scans a photo taken by the front camera and detects face bounds, eye positions, cheek positions, and chin
- **Face shape classification** — oval, round, square, rectangle, diamond, heart, triangle — calculated from real landmark measurements
- **Hairstyle recommendations** — scored against your face shape and hairline stage from a curated catalog
- **Animated scan ring** — rotating segments + pulse animation while processing
- **Hairstyle overlay** — coloured silhouette positioned over your detected face bounds
- **Saved Looks** — AsyncStorage-backed library with real photo thumbnails, timestamps, and delete/clear
- **Barber notes** — plain-language cut descriptions ready to show at the salon
- **Hairline guidance** — style-safe language, no medical claims

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.74 + Expo SDK 51 |
| Language | TypeScript 5 |
| Face Detection | `expo-face-detector` 12.7 (Google ML Kit) |
| Camera | `expo-camera` 15 |
| Persistence | `@react-native-async-storage/async-storage` 1.23 |
| Monorepo | npm workspaces |
| Build | `expo run:android` (native dev build) |

---

## Project Structure

```
codebase/
├── apps/
│   └── stylemirror-mobile/        # Expo app
│       ├── App.tsx                # Root — wires all hooks
│       ├── app.json               # Expo config + permissions
│       ├── android/               # Generated native project (Java 17 required)
│       └── src/
│           ├── components/
│           │   ├── AppHeader.tsx
│           │   ├── BottomTabs.tsx
│           │   ├── HairstyleOverlay.tsx   # Face-bounds-positioned hair silhouette
│           │   └── ScanRingOverlay.tsx    # Animated ML scan ring
│           ├── features/
│           │   ├── scan/
│           │   │   └── useFaceScan.ts     # Real ML Kit scan hook
│           │   └── saved/
│           │       └── useSavedLooks.ts   # AsyncStorage saved looks hook
│           ├── screens/
│           │   ├── CameraTryOnScreen.tsx  # Camera + capture + overlay
│           │   ├── ScanResultScreen.tsx   # Face signals + recommendations
│           │   ├── SavedLooksScreen.tsx   # Persisted looks library
│           │   └── WelcomeScreen.tsx      # Onboarding
│           └── theme/
│               └── theme.ts              # Dark design tokens
│
└── packages/
    ├── face-analysis/             # Face measurement + shape logic
    │   └── src/index.ts           # classifyFaceShape, landmarksFromFaceDetection
    ├── shared/                    # Shared TypeScript types
    │   └── src/index.ts           # FaceLandmarks, FaceScanResult, FaceShape
    └── style-engine/              # Hairstyle catalog + recommendation engine
        └── src/index.ts           # recommendHairstyles, getHairlineGuidance
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Java | **17** (Gradle 8.8 requires Java ≤ 22) |
| Android SDK | 34+ |
| Android Emulator | API 33+ recommended |

> ⚠️ **Java 17 is required.** Java 21+ will cause Gradle to fail with `Unsupported class file major version`. The project pins Java 17 in `android/gradle.properties`.

### Install

```bash
# Clone and install root deps
cd codebase
npm install

# Install app deps
cd apps/stylemirror-mobile
npm install
```

### Run in Expo Go (mock scan, no real ML Kit)

```bash
cd apps/stylemirror-mobile
npx expo start --android
```

> Face detection falls back to a mock scan in Expo Go because `expo-face-detector` requires a native build.

### Run with real ML Kit face detection (recommended)

```bash
cd apps/stylemirror-mobile

# Generate the Android native project (one-time)
npx expo prebuild --platform android

# Build and install the dev client on your emulator
JAVA_HOME=/path/to/java17 npx expo run:android
```

On macOS with Homebrew:
```bash
JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home npx expo run:android
```

### Run a stable Android demo with embedded JavaScript

Use this when Metro/dev-client gets stale or you want to test the same app bundle an installed APK will run:

```bash
cd codebase
npm run android:mobile:release
```

This builds a release APK, embeds the current `index.android.bundle`, installs it on the emulator, and runs without depending on Metro for JavaScript.

### TypeScript check

```bash
cd apps/stylemirror-mobile
npx tsc --noEmit
```

---

## How the Scan Pipeline Works

```
User taps shutter
      ↓
CameraView.takePictureAsync()          ← real photo from front camera
      ↓
FaceDetector.detectFacesAsync(uri)     ← ML Kit: bounds, eye/cheek/ear positions
      ↓
landmarksFromFaceDetection()           ← normalise to 0..1 coordinate space
      ↓
analyzeFaceLandmarks()                 ← measure face length, widths, chin roundness
      ↓
classifyFaceShape()                    ← oval / round / square / diamond / heart / ...
      ↓
recommendHairstyles()                  ← score catalog against face shape + hairline
      ↓
HairstyleOverlay                       ← render silhouette over face bounds in preview
      ↓
User taps Save → useSavedLooks         ← persist to AsyncStorage
```

---

## Face Shape Classification

Shapes are determined from five measurements derived from ML Kit landmarks:

| Measurement | Derived from |
|-------------|-------------|
| Face length | Hairline centre → chin |
| Forehead width | Left forehead → right forehead |
| Cheekbone width | Left cheek → right cheek |
| Jaw width | Left jaw point → right jaw point |
| Chin roundness | Jaw midpoint depth relative to jaw width |

Rules (in priority order):

```
length / width > 1.55              → rectangle
cheekbone dominant (×1.08)         → diamond
forehead / jaw > 1.18              → heart
jaw / cheekbone > 1.12             → triangle
jaw / cheekbone > 0.94 + flat chin → square
short + round chin                 → round
default                            → oval
```

---

## Hairstyle Catalog

| Style | Category | Best for |
|-------|----------|----------|
| Textured Crop | hairline | oval, round, square, heart |
| Clean Side Fade | modern | oval, round, square, diamond |
| Medium Layers | long | oval, rectangle, diamond, heart |
| Side-Swept Fringe | hairline | rectangle, diamond, heart, oval |
| Classic Side Part | classic | oval, square, rectangle |
| Conservative Hairline Preview | transplant_preview | all shapes |

---

## Hairline Disclaimer

> Hairline suggestions are style guidance only and are not a medical diagnosis or treatment recommendation. Consult a dermatologist or hair-restoration surgeon for medical advice.

---

## Git History

| Commit | Description |
|--------|-------------|
| `bdb05db` | Initialize StyleMirror mobile MVP |
| `9a51850` | Implement dynamic face scanning via landmarks |
| `1fc21fc` | Install expo-face-detector, expo-media-library, async-storage |
| `7eae729` | Real photo capture + ML Kit face detection + landmarksFromFaceDetection() |
| `6949658` | Animated ScanRingOverlay |
| `a0df5e3` | HairstyleOverlay positioned from detected face bounds |
| `55a464e` | useSavedLooks with AsyncStorage + real SavedLooksScreen |
| `df2ea21` | Polish — WelcomeScreen chips, error banner, camera permission card |
| `c1ec1fd` | Document app and stabilize native scan dependencies |
| `293fbb4` | Add style preference filtering |
| `4f22ee9` | Add scan quality guidance |
| `c43fac9` | Update mobile git history |
| `1659635` | Surface style preference in try-on |
| `1dbb65a` | Cover style recommendation rules |
| `63475c0` | Align Expo SDK dependency versions |
| `7968643` | Add reliable Android release run scripts |

---

## Roadmap

- [ ] Real transparent PNG hairstyle overlays (replace coloured silhouettes)
- [ ] Save scan result to camera roll (`expo-media-library`)
- [ ] Before / after split view
- [ ] Vision Camera + MediaPipe 468-point face mesh for higher accuracy
- [ ] Women's / unisex style catalog
- [ ] Share barber note as image

---

## License

MIT

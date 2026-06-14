# StyleMirror

React Native app for face-structure based hairstyle recommendations and virtual try-on.

## Current Scope

- Face-shape scan flow with mock analysis
- Hairline-aware hairstyle suggestions
- Celebrity-style reference cards
- Manual try-on screen placeholder
- Shared rule engine packages for future camera/AI integration

## Structure

- `apps/stylemirror-mobile` - React Native/Expo mobile app
- `packages/face-analysis` - face measurements and scan result types
- `packages/style-engine` - hairstyle recommendation rules
- `packages/shared` - shared product types
- `docs/product` - product notes and roadmap

## Next Steps

1. Install Expo dependencies.
2. Add camera permission and live camera preview.
3. Integrate MediaPipe/ML Kit landmarks.
4. Replace mock scan with measured face proportions.
5. Add hairstyle overlay assets and manual positioning.

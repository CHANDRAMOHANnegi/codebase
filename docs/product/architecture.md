# Architecture

StyleMirror starts as one React Native app inside a small monorepo.

## App Layer

`apps/stylemirror-mobile` owns screens, navigation, camera UI, overlays, and saved looks.

## Logic Packages

`packages/face-analysis` owns scan measurements and face-shape classification.

`packages/style-engine` owns hairstyle, hairline, and reference-look recommendations.

`packages/shared` owns shared TypeScript types used across apps and packages.

## Why This Shape

Camera and UI will change quickly, but face analysis and recommendation rules should stay reusable. This keeps the mobile app light while leaving space for a future web app, admin catalog, clothes try-on module, or clinic/salon mode.

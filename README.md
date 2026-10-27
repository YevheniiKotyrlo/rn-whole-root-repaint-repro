# A caret blink repaints the whole React root on Android

[react/react-native#59534](https://github.com/react/react-native/issues/59534)

React Native 0.88.0, from the [React Native reproducer template](https://github.com/react-native-community/reproducer-react-native). `App.tsx` focuses a `TextInput` above a list, so the blinking caret is the only thing on screen that changes.

## Steps

On a phone: the emulator repaints its whole window for every app, Android's Settings included, so it shows no difference.

1. Build and install the release APK: `cd ReproducerApp/android && ./gradlew assembleRelease && adb install -r app/build/outputs/apk/release/app-release.apk`.
2. Open the app and leave it untouched while the caret blinks.
3. Record six seconds of frames with this repository's `caret.pbtxt`: `adb shell perfetto -c - --txt -o /data/misc/perfetto-traces/caret.pftrace < caret.pbtxt`, then `adb pull /data/misc/perfetto-traces/caret.pftrace` and open it in https://ui.perfetto.dev.
4. On the app's `RenderThread`, each frame's `Drawing <left> <top> <right> <bottom>` slice is the rectangle that frame repainted.
5. Open Android's Settings search, whose field is focused when it opens (`adb shell am start -a com.android.settings.action.SETTINGS_SEARCH`), and record the same.

On a RedMagic NX809J (Android 16), every caret frame here repainted `0 0 1216 2688`, the whole window the React root fills, on 12 of 12 frames. Settings search repainted its field, `228 146 1148 263`, on 10 of 12.

With Developer options › Show GPU view updates on, each blink flashes the whole screen here and only the search field in Settings. One blink of each on the RedMagic, status bar and keyboard cropped, Settings' search history blacked out:

![A caret blink: the whole screen repainted here, only the search field in Settings](readings/caret-blink-repaint.png)

## What it costs

The fill: every caret blink redraws every pixel of the root. I couldn't measure a frame-time cost beyond that. On the two Snapdragon phones below, the frame after the caret's 500 ms pause waits for the GPU to wake from idle, and putting the field inside a parent that clips its children (the [`verify/clip-children`](https://github.com/YevheniiKotyrlo/rn-whole-root-repaint-repro/tree/verify/clip-children) branch, whose `ReproducerClippingView` is a `ReactViewGroup` with `clipChildren` on) bounds each blink's repaint to the field without changing how late those frames finish. Release APKs of both branches, 12 s each with `dumpsys gfxinfo <package> framestats`, counting the caret frames after 400 ms or more with no frame:

| Phone | Branch | Repainted per blink frame | GPU done after the swap | Missed the deadline |
| --- | --- | --- | --- | --- |
| Galaxy S23 (SM-S911B), Android 14, HWUI on GL | `main` | `0 0 1080 2340`, the whole window, on 23 of 23 | 6.8–16.5 ms, median 14.6 | 25 of 26 at 16.67 ms |
| Galaxy S23 | `verify/clip-children` | `48 129 1032 271`, the field, on 23 of 24 | 9.4–16.9 ms, median 15.3 | 23 of 24 |
| RedMagic NX809J, Android 16, HWUI on Vulkan | `main` | `0 0 1216 2688`, the whole window, on 24 of 24 | 10.7–16.2 ms, median 14.6 | 19 of 24 at 13.67 ms |
| RedMagic NX809J | `verify/clip-children` | `52 159 1164 312`, the field, on 22 of 24 | 11.6–15.4 ms, median 14.2 | 20 of 23 |

The GPU columns leave out the few frames the GPU was still awake for, which finish about 1 ms after the swap on both branches. The frame tables are in [`readings/`](readings/), beside a release RNTester and Android's Settings search on the same S23.

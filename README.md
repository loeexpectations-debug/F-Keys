# F Keys for Android

Native Android input-method app, Android 8.0+ (API 26), Java, no third-party runtime dependencies. Includes a basic English keyboard, F1–F12, one-shot Ctrl/Alt/Shift modifiers, Escape, Tab, left/right arrows, symbols, backspace and Enter. No network permission, logging or analytics.

## Build an installable APK

This delivery contains source code, not a prebuilt APK. It has not been compiled or run on an Android device in the authoring environment (no Android SDK or Gradle installed).

### Android Studio (recommended)

1. Unzip this package. In Android Studio choose **Open**, then select the **FKeys** folder containing settings.gradle.
2. Allow Gradle sync and install Android SDK Platform 35 if prompted. Use JDK 17 or newer supported by Gradle 8.9.
3. If asked for a Gradle distribution, choose Gradle **8.9**. The project intentionally has no bundled Gradle wrapper JAR. With Gradle 8.9 installed, `gradle wrapper --gradle-version 8.9` creates the wrapper locally.
4. Choose **Build > Build App Bundle(s) / APK(s) > Build APK(s)**. Debug output: `app/build/outputs/apk/debug/app-debug.apk`.
5. Transfer that APK to your phone, open it, and permit installation from that source if Android asks. Alternatively connect your phone with USB debugging and run the app from Android Studio.

Command-line build with SDK 35 and Gradle 8.9 installed:

```sh
gradle :app:assembleDebug :app:lintDebug
```

### GitHub build option

Put the contents of FKeys at a GitHub repository root, including .github. The included Actions workflow builds and lints the app and uploads **F-Keys-installable-APK**. Download and unzip that artifact to get app-debug.apk. This requires your own GitHub repository; none was created automatically. Debug signing is suitable for personal testing, not store publication. CI debug keys can differ between builds; uninstalling an older build may be needed if Android reports a signature conflict.

## Enable and use

Open **F Keys** on your phone. Tap **Enable keyboard**, enable F Keys, then tap **Choose keyboard** and select it. Android’s generic keyboard warning is expected. Tap the test field and press each F key. The tester should show KEYCODE_F1 through KEYCODE_F12. Tap Ctrl, Alt or Shift before a function key for a combination. Modifiers reset after one special key. Shift resets after one typed character. Use Switch to return to your usual keyboard. If a hardware keyboard is connected, Android may require enabling “show on-screen keyboard” in its keyboard settings.

## Compatibility boundaries

The app sends real Android KEYCODE_F1–KEYCODE_F12 down/up events with modifier metadata and soft-keyboard flags through the focused InputConnection. Letters and ordinary punctuation use commitText, as recommended by Android. Ctrl/Alt letter shortcuts use key events. These are Android software-input events, not a Bluetooth/USB HID device, global event injector, accessibility service or root tool.

The receiving app must handle those events. A successful send return value only means the input connection accepted the request; it does not prove that the app performed an action. Remote desktop, terminal, emulator and game apps vary. Apps with no editable focus may not display the keyboard at all. This keyboard cannot add a row inside Gboard or bypass another app’s input restrictions. Terminal escape-sequence mode is not implemented. No autocorrect, swipe typing, multilingual layouts, key repeat, emoji panel or predictive text is included in this first version.

## Verification checklist

- Build and lint, install on Android 8+ and Android 15+, check portrait and landscape.
- Enable/select the keyboard; verify the built-in tester receives F1 through F12.
- Verify Ctrl+F1, Alt+F4 and Shift+F12 retain their modifier and the next key has no modifier.
- In the intended target app, confirm its actual function-key action; tester success alone is insufficient.
- Test ordinary text, selected-text deletion, emoji backspace, arrows, Enter/Send, symbols and keyboard switching.
- Reopen in another field and confirm modifiers have reset.

## Official API references

- https://developer.android.com/reference/android/inputmethodservice/InputMethodService
- https://developer.android.com/reference/android/view/inputmethod/InputConnection#sendKeyEvent(android.view.KeyEvent)
- https://developer.android.com/reference/android/view/KeyEvent

Project package: ca.sparky.fkeys. Build configuration: Android Gradle Plugin 8.7.3 / Gradle 8.9 / compile and target SDK 35. Review target SDK requirements before any future Play Store release.

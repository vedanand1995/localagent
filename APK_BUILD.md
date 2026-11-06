# LocalAgent Android APK build handoff

LocalAgent is ready for a native Android build from the Manus WebDev Dashboard.

## Build

1. Open the LocalAgent project in the Manus Dashboard.
2. Open the native build action and choose **Android APK** for direct device installation, or **Android AAB** for Play Store distribution.
3. Build from the latest accepted checkpoint on `main`.
4. Install the generated APK on an Android phone.
5. Open **Models**, choose **Qwen2.5 0.5B Instruct — FASTEST**, and tap **DOWNLOAD**.
6. After the GGUF file finishes downloading, use Chat. Inference runs through llama.cpp on-device.

## Performance defaults

The app defaults to a small Q4 model, a 1536-token context, 512-token batch size, four CPU threads, GPU offload where supported, and a 256-token response budget. This is tuned for faster first replies and lower memory use. Larger model suggestions remain visible in Model Manager but are marked as suggestions until their direct download entries are added.

## Native requirements

The project includes the `llama.rn` Expo config plugin, native artifact postinstall, ARM64/ARMv7 Android architectures, and model download support. Models are intentionally not bundled inside the APK; downloading them after installation keeps the APK smaller and lets users switch models.

## Latest source checkpoint

`111c381` on the managed `main` branch.

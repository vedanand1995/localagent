# LocalAgent TODO

- [ ] **Fast local chat works in the Android app.** The app must provide a multi-turn task chat, use a lightweight Hugging Face GGUF model on-device when a native build is installed, and show a clear fallback state in preview when native inference is unavailable.
- [ ] **Plan-before-run flow is visible.** A user task must produce a concise multi-step plan preview and allow the user to start execution from a thumb-reachable action.
- [ ] **Model manager supports fast setup.** The app must show a Fast model first, show approximate download size, download the selected GGUF from Hugging Face with progress, persist its path, validate/load it, and let the user switch models.
- [ ] **Local-first data handling is explicit.** Conversations, selected model metadata, and task state must persist locally on the device; UI copy must explain that the model is local after download.
- [ ] **Safe task progress is displayed.** Running tasks must show current step, completed steps, pending work, tool activity, errors, and a final result state.
- [ ] **Confirmation boundaries are present.** Destructive file changes, deletion, login, email sending, and other external side effects must stop for explicit confirmation rather than executing silently.
- [ ] **Task history is available.** Past tasks must be listed locally with status and timestamp and be reopenable.
- [ ] **Android portrait UX is polished.** Controls must be compact, thumb-reachable, readable, and usable in portrait mode.
- [ ] **APK build handoff is ready.** The project must include the native model plugin configuration and be ready for an Android APK/AAB build from the WebDev Dashboard, without bundling a large model in the APK.

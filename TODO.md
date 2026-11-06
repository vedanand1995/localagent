# LocalAgent TODO

- [x] **Fast local chat works in the Android app.** The app provides multi-turn task chat, uses a lightweight Hugging Face GGUF model on-device when a native build is installed, and shows a clear fallback state in preview when native inference is unavailable.
- [x] **Plan-before-run flow is visible.** A user task produces a concise multi-step plan preview and a thumb-reachable safe-run action.
- [x] **Model manager supports fast setup.** The app shows a Fast model first, shows approximate download size, downloads the selected GGUF from Hugging Face with progress, persists its path, and supports model switching.
- [x] **Local-first data handling is explicit.** Conversations, selected model metadata, task state, and generated project metadata persist locally on the device; the UI explains the local model behavior.
- [x] **Safe task progress is displayed.** Running plans show current, completed, and pending steps plus a final result state.
- [ ] **Confirmation boundaries are expanded.** Destructive file changes, deletion, login, email sending, and other external side effects still need their full native permission/confirmation flows as more tools are added.
- [x] **Task history is available.** Past tasks are listed locally with status and timestamps.
- [x] **Android portrait UX is polished.** Controls are compact, thumb-reachable, readable, and usable in portrait mode.
- [x] **APK build handoff is ready.** The project includes the native model plugin configuration, native artifact postinstall, and Android APK/AAB build handoff without bundling a large model.
- [x] **Task-to-project builder works for a first MVP.** Prompts that ask for a website, web app, landing page, HTML, or app create a real local project artifact containing `index.html`, `style.css`, `app.js`, and `README.md`; the Build tab previews files and saves them to device storage.
- [ ] **Native project generation remains next.** Extend the builder from web/app-style starter files to full Expo/React Native project scaffolds and add ZIP/share/export handoff.

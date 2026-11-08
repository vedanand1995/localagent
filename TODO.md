
- [x] **Safe Terminal tab is available.** The app has a Termux-style terminal UI with `pwd`, `ls`, `cd`, `cat`, `touch`, `mkdir`, `echo > file`, `whoami`, `clear`, and `help`, operating inside the app-owned terminal workspace.
- [x] **Conversation file attachments are connected to the workspace.** Users can attach multiple files in Chat; readable text is added to the model context and every attachment is copied into `terminal-root/inbox/`.
- [x] **Generated projects are visible to Terminal.** Saving a Build project also writes it under `terminal-root/projects/<project-id>/` for terminal inspection.
- [x] **AI activity visibility is available.** Chat shows live entries for task receipt, plan creation, file reading, thinking/search, project creation, tool results, errors, and completion.
- [x] **Assistant modes are available.** Fast uses short local answers, Think uses a larger concise decision summary, and Web performs an internet lookup through DuckDuckGo Instant Answers before local synthesis.
- [x] **Native Termux bridge is implemented in source.** Android native code sends explicitly confirmed shell commands to Termux and returns stdout, stderr, exit code, and bridge errors to the in-app Terminal log.
- [x] **Termux mode is visible in the Terminal screen.** The user can choose Safe Workspace or Real Termux; Real Termux commands show an Android confirmation dialog before execution.
- [ ] **Termux runtime verification remains open.** A fresh Android release build and a real device with Termux installed must verify Kotlin compilation, RUN_COMMAND permission, `allow-external-apps=true`, and result callbacks.
- [ ] **Full root/hidden remote execution is excluded.** No root commands, hidden background commands, remote C2, keylogging, or data exfiltration are included.

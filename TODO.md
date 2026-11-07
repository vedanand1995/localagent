
- [x] **Safe Terminal tab is available.** The app has a Termux-style terminal UI with `pwd`, `ls`, `cd`, `cat`, `touch`, `mkdir`, `echo > file`, `whoami`, `clear`, and `help`, operating inside the app-owned terminal workspace.
- [x] **Conversation file attachments are connected to the workspace.** Users can attach multiple files in Chat; readable text is added to the model context and every attachment is copied into `terminal-root/inbox/`.
- [x] **Generated projects are visible to Terminal.** Saving a Build project also writes it under `terminal-root/projects/<project-id>/` for terminal inspection.
- [x] **AI activity visibility is available.** Chat shows live entries for task receipt, plan creation, file reading, thinking/search, project creation, tool results, errors, and completion.
- [x] **Assistant modes are available.** Fast uses short local answers, Think uses a larger concise decision summary, and Web performs an internet lookup through DuckDuckGo Instant Answers before local synthesis.
- [ ] **Full Termux runtime remains a native follow-up.** Arbitrary Python, Java/Javac, Node, GCC, apt packages, Android shell, and root commands are not executed inside the safe Expo workspace. A real Termux bridge or embedded runtimes require a separate native Android build and explicit permissions.

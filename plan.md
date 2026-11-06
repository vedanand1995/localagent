# LocalAgent implementation plan

## Scope
LocalAgent is a fast, local-first Android assistant MVP inspired by Manus. It uses a small GGUF instruct model downloaded from Hugging Face and runs inference on-device through `llama.rn`/llama.cpp in a native build. The app is deliberately optimized for a first useful run: a compact model is the default, while a larger balanced model is optional.

## Implementation
- **Chat:** one-handed React Native chat screen with quick prompts, streaming-like progress state, message bubbles, and a structured task plan preview before execution.
- **Local inference:** a native-only adapter around `llama.rn`; web preview uses a clearly labeled demo fallback so the interface remains inspectable without native inference. `AsyncStorage` stores selected model and local conversation history.
- **Model manager:** model catalog with Fast and Balanced GGUF options, Hugging Face download progress, local file path persistence, model validation/loading, and switching. Fast model is the default recommendation for responsiveness.
- **Task execution:** local agent loop starts with a plan, shows steps and tool activity, and runs a safe first set of local tools (workspace summary/read-only file simulation in this MVP). External side effects and destructive actions remain confirmation-gated.
- **Navigation:** Chat, Tasks, and Model tabs; portrait layout with thumb-reachable controls.
- **Native build:** Expo managed mobile starter with `llama.rn` config plugin and `expo-file-system`. APK output is prepared for the WebDev Dashboard native build; the source remains buildable if the dashboard build is not available in this session.

## Design
Three candidate directions: **Quiet Operator** (<0.10): sparse dark command-center UI with neon mint accents; **Paper Pilot** (<0.10): warm editorial workspace with amber actions; **Signal Desk** (<0.10): high-contrast slate UI with electric cyan status indicators.

Chosen direction: **Quiet Operator**.

- **Design Movement:** calm dark command-center utility, closer to a focused instrument panel than a social chatbot.
- **Core Principles:** immediate clarity, visible system state, low-friction thumb actions, and safe-by-default execution.
- **Color Philosophy:** ink navy grounds long sessions; mint indicates readiness and completion; amber signals model/setup work; red is reserved for risk.
- **Layout Paradigm:** a vertical conversation rail with a pinned composer and small status islands, avoiding dense card grids.
- **Signature Elements:** mint status dot, thin progress rail, and compact “LOCAL / READY” badges.
- **Interaction Philosophy:** every action exposes state; tasks move from plan to run to result, and risky actions stop at a confirmation boundary.
- **Animation:** short 160–220ms fades and progress transitions; no distracting loops; loading uses a subtle pulsing status dot.
- **Typography System:** system sans with bold compact headings, 15–16px body text, and 11px uppercase metadata labels.
- **Brand Essence:** a private local operator for getting real work done; calm, fast, trustworthy.
- **Brand Voice:** direct and practical. Example lines: “Plan first. Run when ready.” and “Your model stays on this device.”
- **Wordmark/mark:** a small mint square with a single diagonal signal line, paired with the LocalAgent wordmark.
- **Signature Brand Color:** electric mint `#B8F36B`.

## Project structure
- `app/(tabs)/_layout.tsx`: bottom navigation for Chat, Tasks, and Model.
- `app/(tabs)/index.tsx`: chat, task planning/execution, quick actions, and history entry point.
- `app/(tabs)/tasks.tsx`: local task history and step state.
- `app/(tabs)/model.tsx`: model catalog, Hugging Face download state, storage and load controls.
- `lib/local-inference.ts`: platform-gated llama.rn adapter and demo fallback.
- `lib/model-manager.ts`: model catalog, download, file paths, and persistence.
- `lib/task-engine.ts`: plan generation and safe local MVP execution state.
- `components/`: shared UI primitives as needed.

## Material constraints
A fully capable Manus clone would need more native tools, a large model, browser automation, sandboxed code execution, and permissions. This first APK focuses on a fast, installable foundation. A downloaded local model is not bundled into the APK; users choose and download it on-device to keep the APK small.

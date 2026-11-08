import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isTermuxBridgeAvailable, runTermuxCommand } from "@localagent/termux-bridge";
import { ensureTerminalRoot, executeTerminalCommand, promptPath } from "@/lib/terminal";

type Line = { id: string; kind: "command" | "output" | "system" | "error"; text: string };

export default function TerminalScreen() {
  const [cwd, setCwd] = useState("");
  const [draft, setDraft] = useState("");
  const [termuxAvailable, setTermuxAvailable] = useState(false);
  const [termuxMode, setTermuxMode] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ id: "welcome", kind: "system", text: "LocalAgent Terminal · sandbox workspace ready\nType help to see commands." }]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    ensureTerminalRoot().catch((error) => setLines((old) => [...old, { id: "error", kind: "error", text: error instanceof Error ? error.message : "Storage unavailable" }]));
    const availability = isTermuxBridgeAvailable();
    const timer = setTimeout(() => setTermuxAvailable(availability), 0);
    return () => clearTimeout(timer);
  }, []);

  const append = (kind: Line["kind"], text: string) => {
    if (!text) return;
    setLines((old) => [...old, { id: `${Date.now()}-${Math.random()}`, kind, text }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
  };

  const runInTermux = async (raw: string) => {
    append("command", `~/ $ ${raw}`);
    append("system", "Termux · running command and waiting for stdout/stderr…");
    try {
      const result = await runTermuxCommand(raw, "~/", true);
      if (result.stdout) append("output", result.stdout);
      if (result.stderr) append("error", result.stderr);
      append(result.exitCode === 0 ? "system" : "error", `Termux exit code: ${result.exitCode}`);
      if (result.error) append("error", result.error);
    } catch (error) {
      append("error", error instanceof Error ? error.message : "Termux command failed");
    }
  };

  const run = async () => {
    const raw = draft.trim();
    if (!raw) return;
    setDraft("");
    if (termuxMode) {
      if (Platform.OS !== "android") {
        append("error", "Termux mode is available only in the Android APK.");
        return;
      }
      Alert.alert("Run in Termux?", `${raw}\n\nCommand output will be returned to this log.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Run", onPress: () => { void runInTermux(raw); } },
      ]);
      return;
    }
    const commandLine = { id: `${Date.now()}-cmd`, kind: "command" as const, text: `${promptPath(cwd)} $ ${raw}` };
    setLines((old) => [...old, commandLine]);
    try {
      const result = await executeTerminalCommand(raw, cwd);
      if (result.clear) setLines([]);
      else { setCwd(result.cwd); if (result.output) append("output", result.output); }
    } catch (error) {
      append("error", `error: ${error instanceof Error ? error.message : "command failed"}`);
    }
  };

  return <SafeAreaView style={styles.safe} edges={["top"]}><KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <View style={styles.header}><View><Text style={styles.kicker}>LOCAL SHELL</Text><Text style={styles.title}>Terminal</Text></View><View style={styles.badge}><View style={[styles.dot, termuxMode && styles.termuxDot]} /><Text style={styles.badgeText}>{termuxMode ? "TERMUX" : "SANDBOX"}</Text></View></View>
    <View style={styles.modeRow}><Pressable onPress={() => setTermuxMode(false)} style={[styles.modeButton, !termuxMode && styles.modeActive]}><Text style={[styles.modeText, !termuxMode && styles.modeTextActive]}>SAFE WORKSPACE</Text></Pressable><Pressable onPress={() => setTermuxMode(true)} disabled={!termuxAvailable} style={[styles.modeButton, termuxMode && styles.modeActive, !termuxAvailable && styles.disabled]}><Text style={[styles.modeText, termuxMode && styles.modeTextActive]}>REAL TERMUX</Text></Pressable></View>
    <View style={styles.terminal}><ScrollView ref={scrollRef} contentContainerStyle={styles.output} showsVerticalScrollIndicator={false}>{lines.map((line) => <Text key={line.id} style={[styles.line, line.kind === "command" && styles.command, line.kind === "system" && styles.system, line.kind === "error" && styles.error]}>{line.text}</Text>)}</ScrollView><View style={styles.promptRow}><Text style={styles.prompt}>{termuxMode ? "~/ $" : `${promptPath(cwd)} $`}</Text><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={run} autoCapitalize="none" autoCorrect={false} returnKeyType="send" placeholder={termuxMode ? "python, node, javac…" : "help"} placeholderTextColor="#52636D" style={styles.input} /><Pressable onPress={run} style={styles.runButton}><MaterialCommunityIcons name="arrow-up" size={20} color="#0B1118" /></Pressable></View></View>
    <Text style={styles.note}>{termuxMode ? "Visible confirmation · stdout/stderr returns here · no root or hidden commands" : termuxAvailable ? "Select REAL TERMUX to run Python, Node, Java, GCC and apt" : "Install Termux from F-Droid and rebuild this APK for REAL TERMUX"}</Text>
  </KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#0B1118" }, container: { flex: 1, padding: 16 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12 }, kicker: { color: "#B8F36B", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, title: { color: "#F3F7FB", fontSize: 25, fontWeight: "900", marginTop: 3 }, badge: { borderColor: "#31434F", borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 6 }, dot: { width: 7, height: 7, borderRadius: 7, backgroundColor: "#7A8B93" }, termuxDot: { backgroundColor: "#B8F36B" }, badgeText: { color: "#B8F36B", fontSize: 9, fontWeight: "900", letterSpacing: 1 }, modeRow: { flexDirection: "row", gap: 7, paddingBottom: 10 }, modeButton: { flex: 1, height: 32, borderRadius: 9, borderColor: "#2A3B47", borderWidth: 1, alignItems: "center", justifyContent: "center" }, modeActive: { backgroundColor: "#B8F36B", borderColor: "#B8F36B" }, modeText: { color: "#92A3AE", fontSize: 9, fontWeight: "900" }, modeTextActive: { color: "#0B1118" }, disabled: { opacity: 0.45 }, terminal: { flex: 1, backgroundColor: "#080D12", borderColor: "#293B44", borderWidth: 1, borderRadius: 16, overflow: "hidden" }, output: { padding: 14, gap: 8, flexGrow: 1 }, line: { color: "#9FB6B1", fontFamily: "monospace", fontSize: 12, lineHeight: 18 }, command: { color: "#B8F36B" }, system: { color: "#6D8A84" }, error: { color: "#FF9B8E" }, promptRow: { borderTopColor: "#25343A", borderTopWidth: 1, minHeight: 52, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }, prompt: { color: "#B8F36B", fontFamily: "monospace", fontSize: 11 }, input: { color: "#E4F0EC", fontFamily: "monospace", fontSize: 13, flex: 1, paddingVertical: 8 }, runButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#B8F36B", alignItems: "center", justifyContent: "center" }, note: { color: "#70828D", fontSize: 10, textAlign: "center", marginTop: 9 } });

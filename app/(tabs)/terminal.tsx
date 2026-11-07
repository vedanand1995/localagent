import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ensureTerminalRoot, executeTerminalCommand, promptPath } from "@/lib/terminal";

type Line = { id: string; kind: "command" | "output" | "system"; text: string };
export default function TerminalScreen() {
  const [cwd, setCwd] = useState("");
  const [draft, setDraft] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: "welcome", kind: "system", text: "LocalAgent Terminal · sandbox workspace ready\nType help to see commands." }]);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => { ensureTerminalRoot().catch((error) => setLines((old) => [...old, { id: "error", kind: "output", text: error instanceof Error ? error.message : "Storage unavailable" }])); }, []);
  const run = async () => {
    const raw = draft.trim(); if (!raw) return;
    setDraft("");
    const commandLine = { id: `${Date.now()}-cmd`, kind: "command" as const, text: `${promptPath(cwd)} $ ${raw}` };
    setLines((old) => [...old, commandLine]);
    try { const result = await executeTerminalCommand(raw, cwd); if (result.clear) setLines([]); else { setCwd(result.cwd); if (result.output) setLines((old) => [...old, { id: `${Date.now()}-out`, kind: "output", text: result.output }]); } }
    catch (error) { setLines((old) => [...old, { id: `${Date.now()}-err`, kind: "output", text: `error: ${error instanceof Error ? error.message : "command failed"}` }]); }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
  };
  return <SafeAreaView style={styles.safe} edges={["top"]}><KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}><View style={styles.header}><View><Text style={styles.kicker}>LOCAL SHELL</Text><Text style={styles.title}>Terminal</Text></View><View style={styles.badge}><View style={styles.dot} /><Text style={styles.badgeText}>SANDBOX</Text></View></View><View style={styles.terminal}><ScrollView ref={scrollRef} contentContainerStyle={styles.output} showsVerticalScrollIndicator={false}>{lines.map((line) => <Text key={line.id} style={[styles.line, line.kind === "command" && styles.command, line.kind === "system" && styles.system]}>{line.text}</Text>)}</ScrollView><View style={styles.promptRow}><Text style={styles.prompt}>{promptPath(cwd)} $</Text><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={run} autoCapitalize="none" autoCorrect={false} returnKeyType="send" placeholder="help" placeholderTextColor="#52636D" style={styles.input} /><Pressable onPress={run} style={styles.runButton}><MaterialCommunityIcons name="arrow-up" size={20} color="#0B1118" /></Pressable></View></View><Text style={styles.note}>Safe workspace only · Android system/root commands disabled</Text></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#0B1118" }, container: { flex: 1, padding: 16 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14 }, kicker: { color: "#B8F36B", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, title: { color: "#F3F7FB", fontSize: 25, fontWeight: "900", marginTop: 3 }, badge: { borderColor: "#31434F", borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 6 }, dot: { width: 7, height: 7, borderRadius: 7, backgroundColor: "#B8F36B" }, badgeText: { color: "#B8F36B", fontSize: 9, fontWeight: "900", letterSpacing: 1 }, terminal: { flex: 1, backgroundColor: "#080D12", borderColor: "#293B44", borderWidth: 1, borderRadius: 16, overflow: "hidden" }, output: { padding: 14, gap: 8, flexGrow: 1 }, line: { color: "#9FB6B1", fontFamily: "monospace", fontSize: 12, lineHeight: 18 }, command: { color: "#B8F36B" }, system: { color: "#6D8A84" }, promptRow: { borderTopColor: "#25343A", borderTopWidth: 1, minHeight: 52, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }, prompt: { color: "#B8F36B", fontFamily: "monospace", fontSize: 11 }, input: { color: "#E4F0EC", fontFamily: "monospace", fontSize: 13, flex: 1, paddingVertical: 8 }, runButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#B8F36B", alignItems: "center", justifyContent: "center" }, note: { color: "#70828D", fontSize: 10, textAlign: "center", marginTop: 9 } });

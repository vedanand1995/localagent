import * as FileSystem from "expo-file-system/legacy";

export const TERMINAL_ROOT = `${FileSystem.documentDirectory ?? ""}terminal-root/`;

function safeRelative(input = ".", cwd = "") {
  const joined = `${cwd}/${input}`.replace(/\\/g, "/");
  const parts: string[] = [];
  for (const part of joined.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part.replace(/[^a-zA-Z0-9._-]/g, "_"));
  }
  return parts.join("/");
}

function toPath(relative: string) { return `${TERMINAL_ROOT}${relative ? `${relative}/` : ""}`; }
export async function ensureTerminalRoot() { if (!FileSystem.documentDirectory) throw new Error("Device storage unavailable in this preview."); await FileSystem.makeDirectoryAsync(TERMINAL_ROOT, { intermediates: true }); }
export function promptPath(cwd: string) { return `~/terminal-root${cwd ? `/${cwd}` : ""}`; }
export async function copyIntoTerminal(uri: string, fileName: string) {
  await ensureTerminalRoot();
  const safeName = safeRelative(fileName).split("/").pop() || "attached-file";
  const target = `${TERMINAL_ROOT}inbox/${safeName}`;
  await FileSystem.makeDirectoryAsync(`${TERMINAL_ROOT}inbox/`, { intermediates: true });
  await FileSystem.copyAsync({ from: uri, to: target });
  return target;
}
export async function writeTerminalFile(relative: string, content: string) {
  await ensureTerminalRoot();
  const target = `${TERMINAL_ROOT}${safeRelative(relative)}`;
  await FileSystem.makeDirectoryAsync(target.substring(0, target.lastIndexOf("/") + 1), { intermediates: true });
  await FileSystem.writeAsStringAsync(target, content, { encoding: FileSystem.EncodingType.UTF8 });
  return target;
}

export async function executeTerminalCommand(raw: string, cwd: string): Promise<{ output: string; cwd: string; clear?: boolean }> {
  const command = raw.trim();
  if (!command) return { output: "", cwd };
  if (command === "clear" || command === "cls") return { output: "", cwd, clear: true };
  if (command === "help") return { cwd, output: "Commands: help, pwd, ls, cd <dir>, cat <file>, touch <file>, mkdir <dir>, echo <text> > <file>, whoami, clear\n\nSandbox: commands operate only inside LocalAgent terminal-root. Android shell/root commands are disabled." };
  if (command === "whoami") return { cwd, output: "localagent" };
  if (command === "pwd") return { cwd, output: promptPath(cwd) };
  if (command.startsWith("cd ")) {
    const target = safeRelative(command.slice(3).trim(), cwd);
    await ensureTerminalRoot();
    const info = await FileSystem.getInfoAsync(toPath(target));
    if (!info.exists || !info.isDirectory) return { cwd, output: `cd: no such directory: ${command.slice(3).trim()}` };
    return { cwd: target, output: "" };
  }
  if (command === "ls" || command.startsWith("ls ")) {
    const target = safeRelative(command.slice(2).trim() || ".", cwd);
    await ensureTerminalRoot();
    const info = await FileSystem.getInfoAsync(toPath(target));
    if (!info.exists || !info.isDirectory) return { cwd, output: `ls: no such directory: ${target}` };
    const names = await FileSystem.readDirectoryAsync(toPath(target));
    return { cwd, output: names.length ? names.join("  ") : "(empty)" };
  }
  if (command.startsWith("cat ")) {
    const target = safeRelative(command.slice(4).trim(), cwd);
    await ensureTerminalRoot();
    try { return { cwd, output: await FileSystem.readAsStringAsync(toPath(target)) }; }
    catch { return { cwd, output: `cat: file not found: ${target}` }; }
  }
  if (command.startsWith("mkdir ")) {
    const target = safeRelative(command.slice(6).trim(), cwd);
    await ensureTerminalRoot();
    await FileSystem.makeDirectoryAsync(toPath(target), { intermediates: true });
    return { cwd, output: `created directory ${target}` };
  }
  if (command.startsWith("touch ")) {
    const target = safeRelative(command.slice(6).trim(), cwd);
    await ensureTerminalRoot();
    await FileSystem.writeAsStringAsync(toPath(target), "", { encoding: FileSystem.EncodingType.UTF8 });
    return { cwd, output: `created ${target}` };
  }
  if (command.startsWith("echo ") && command.includes(" > ")) {
    const [textPart, filePart] = command.slice(5).split(/\s+>\s+/, 2);
    const target = safeRelative(filePart?.trim(), cwd);
    if (!target) return { cwd, output: "echo: specify a target file with > filename" };
    await ensureTerminalRoot();
    await FileSystem.writeAsStringAsync(toPath(target), textPart.replace(/^['"]|['"]$/g, ""), { encoding: FileSystem.EncodingType.UTF8 });
    return { cwd, output: `wrote ${target}` };
  }
  return { cwd, output: `${command.split(" ")[0]}: command disabled. Type help for supported local commands.` };
}

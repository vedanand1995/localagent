import { Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";

export type TermuxResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
};

type NativeTermuxBridge = {
  runCommand(command: string, workdir?: string, background?: boolean): Promise<TermuxResult>;
  isAvailable(): boolean;
};

const nativeBridge = Platform.OS === "android" ? requireNativeModule<NativeTermuxBridge>("TermuxBridge") : null;

export function isTermuxBridgeAvailable() {
  return Boolean(nativeBridge?.isAvailable());
}

export async function runTermuxCommand(command: string, workdir = "~/", background = true) {
  if (!nativeBridge) throw new Error("Termux bridge is available only in the Android APK.");
  return nativeBridge.runCommand(command, workdir, background);
}

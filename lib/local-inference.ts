import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredModelPath } from "./model-manager";

let context: any = null;
let loadedPath: string | null = null;

export async function isNativeModelAvailable() {
  return Platform.OS !== "web" && Boolean(await getStoredModelPath());
}

export async function askLocalModel(
  prompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  onToken?: (token: string) => void,
) {
  const modelPath = await getStoredModelPath();
  if (Platform.OS === "web" || !modelPath) {
    return "यह Preview demo है। Android APK में Hugging Face model download करने के बाद यही जवाब पूरी तरह device पर local model से आएगा। अभी मैं आपका task plan कर सकता हूँ: पहले request को steps में तोड़ूँगा, फिर सुरक्षित tools से execute करूँगा।";
  }
  if (!context || loadedPath !== modelPath) {
    const llama = await import("llama.rn");
    context = await llama.initLlama({
      model: modelPath,
      use_mlock: true,
      n_ctx: 1536,
      n_batch: 512,
      n_threads: 4,
      n_gpu_layers: 99,
    });
    loadedPath = modelPath;
    await AsyncStorage.setItem("localagent.modelLoaded", "true");
  }
  const messages = [
    { role: "system", content: "You are LocalAgent, a concise local-first assistant. Plan tasks before acting. Never claim an action completed unless it actually ran. Reply in the user's language." },
    ...history.slice(-8),
    { role: "user", content: prompt },
  ];
  const result = await context.completion(
    { messages, n_predict: 256, temperature: 0.25, stop: ["</s>", "<|im_end|>", "<|endoftext|>"] },
    (data: { token?: string }) => data.token && onToken?.(data.token),
  );
  return result.text as string;
}

export async function releaseLocalModel() {
  if (context?.release) await context.release();
  context = null;
  loadedPath = null;
}

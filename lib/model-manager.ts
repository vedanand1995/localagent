import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

export type ModelOption = {
  id: string;
  name: string;
  family: string;
  size: string;
  speed: string;
  fit: string;
  badge?: string;
  repo?: string;
  fileName?: string;
  directUrl?: string;
  downloadable: boolean;
};

export const MODEL_CATALOG: ModelOption[] = [
  {
    id: "qwen2.5-0.5b-q4",
    name: "Qwen2.5 0.5B Instruct",
    family: "Qwen",
    size: "~400 MB",
    speed: "Very fast",
    fit: "Quick chat, low-end phones, fastest replies",
    badge: "FASTEST",
    repo: "Qwen/Qwen2.5-0.5B-Instruct-GGUF",
    fileName: "qwen2.5-0.5b-instruct-q4_k_m.gguf",
    directUrl: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf?download=true",
    downloadable: true,
  },
  {
    id: "qwen2.5-1.5b-q4",
    name: "Qwen2.5 1.5B Instruct",
    family: "Qwen",
    size: "~1.1 GB",
    speed: "Fast",
    fit: "Best speed/quality balance",
    badge: "RECOMMENDED",
    repo: "Qwen/Qwen2.5-1.5B-Instruct-GGUF",
    fileName: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
    directUrl: "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf?download=true",
    downloadable: true,
  },
  {
    id: "qwen3-4b-q4",
    name: "Qwen3 4B Instruct",
    family: "Qwen",
    size: "~2.5 GB",
    speed: "Medium",
    fit: "Better reasoning and Hindi",
    badge: "POWER",
    downloadable: false,
  },
  {
    id: "phi4-mini-q4",
    name: "Phi-4 Mini Instruct",
    family: "Microsoft Phi",
    size: "~2.5 GB",
    speed: "Medium",
    fit: "Strong reasoning and coding",
    badge: "CODING",
    downloadable: false,
  },
  {
    id: "gemma3-4b-q4",
    name: "Gemma 3 4B IT",
    family: "Google Gemma",
    size: "~2.5 GB",
    speed: "Medium",
    fit: "Multilingual and general use",
    downloadable: false,
  },
  {
    id: "smollm2-1.7b-q4",
    name: "SmolLM2 1.7B Instruct",
    family: "Hugging Face",
    size: "~1.0 GB",
    speed: "Fast",
    fit: "Small phones and offline chat",
    badge: "SMALL",
    downloadable: false,
  },
  {
    id: "llama3.2-3b-q4",
    name: "Llama 3.2 3B Instruct",
    family: "Meta Llama",
    size: "~2.0 GB",
    speed: "Medium",
    fit: "Reliable general assistant",
    downloadable: false,
  },
  {
    id: "deepseek-r1-7b-q4",
    name: "DeepSeek-R1 Distill 7B",
    family: "DeepSeek",
    size: "~4.5 GB",
    speed: "Slow",
    fit: "Deep reasoning on powerful phones",
    badge: "REASONING",
    downloadable: false,
  },
];

const SELECTED_MODEL_KEY = "localagent.selectedModel";
const MODEL_PATH_KEY = "localagent.modelPath";

export async function getSelectedModelId() {
  return (await AsyncStorage.getItem(SELECTED_MODEL_KEY)) ?? MODEL_CATALOG[0].id;
}

export async function saveSelectedModel(modelId: string) {
  await AsyncStorage.setItem(SELECTED_MODEL_KEY, modelId);
}

export async function getStoredModelPath() {
  return AsyncStorage.getItem(MODEL_PATH_KEY);
}

export async function downloadModel(model: ModelOption, onProgress?: (progress: number) => void) {
  if (!model.directUrl || !model.fileName) throw new Error("इस मॉडल का direct download अभी उपलब्ध नहीं है।");
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!base) throw new Error("इस device पर local storage उपलब्ध नहीं है।");
  const destination = `${base}models/${model.fileName}`;
  await FileSystem.makeDirectoryAsync(`${base}models`, { intermediates: true });
  const existing = await FileSystem.getInfoAsync(destination);
  if (existing.exists && existing.size && existing.size > 10_000_000) {
    await AsyncStorage.setItem(MODEL_PATH_KEY, destination);
    await saveSelectedModel(model.id);
    onProgress?.(1);
    return destination;
  }
  const task = FileSystem.createDownloadResumable(model.directUrl, destination, {}, (event) => {
    if (event.totalBytesExpectedToWrite > 0) {
      onProgress?.(event.totalBytesWritten / event.totalBytesExpectedToWrite);
    }
  });
  const result = await task.downloadAsync();
  if (!result?.uri) throw new Error("Model download पूरा नहीं हुआ।");
  await AsyncStorage.setItem(MODEL_PATH_KEY, result.uri);
  await saveSelectedModel(model.id);
  onProgress?.(1);
  return result.uri;
}

export async function clearStoredModel() {
  const path = await getStoredModelPath();
  if (path) {
    try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch { /* already gone */ }
  }
  await AsyncStorage.removeItem(MODEL_PATH_KEY);
}

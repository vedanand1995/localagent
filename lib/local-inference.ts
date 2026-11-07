import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredModelPath } from "./model-manager";
import { classifyTask } from "./task-engine";

let context: any = null;
let loadedPath: string | null = null;

function offlineAssist(prompt: string) {
  const kind = classifyTask(prompt);
  if (kind === "project") return "मैं इस task को project-build request समझ रहा हूँ। Plan तैयार है और Build tab में index.html, style.css, app.js और README.md बनेंगे। आप वहाँ files preview करके terminal से edit कर सकते हैं।";
  if (kind === "file") return "मैं file task संभाल सकता हूँ। File attach करें; मैं उसे local inbox में रखूँगा, terminal में ls/cat से दिखाऊँगा और approved output file बना सकता हूँ।";
  if (kind === "research") return "मैं research task को steps में बाँट सकता हूँ। पहले scope तय होगा, फिर उपलब्ध local files और user-approved sources से findings निकाली जाएँगी।";
  return "मैं इस task को सीधे मना नहीं करूँगा। पहले safe plan बनाऊँगा, फिर LocalAgent terminal और approved project tools से जितना संभव हो execute करूँगा। किसी file या external action की जरूरत हो तो आपसे permission लूँगा।";
}

export async function isNativeModelAvailable() {
  return Platform.OS !== "web" && Boolean(await getStoredModelPath());
}

export async function askLocalModel(
  prompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  onToken?: (token: string) => void,
  mode: "fast" | "think" | "web" = "fast",
) {
  let enrichedPrompt = prompt;
  let webNotes = "";
  if (mode === "web") {
    try {
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json&no_html=1&skip_disambig=1`);
      const data = await response.json() as { AbstractText?: string; AbstractURL?: string; RelatedTopics?: Array<{ Text?: string; FirstURL?: string }> };
      const topics = (data.RelatedTopics ?? []).slice(0, 5).map((item) => item.Text).filter(Boolean).join("\n");
      webNotes = data.AbstractText || topics || "No direct result returned.";
      enrichedPrompt = `${prompt}\n\nLIVE WEB NOTES (verify before claiming):\n${webNotes}\nSource: ${data.AbstractURL || "DuckDuckGo Instant Answers"}`;
    } catch { enrichedPrompt = `${prompt}\n\nWeb search was unavailable. State that limitation and answer from local knowledge only.`; }
  }
  const modelPath = await getStoredModelPath();
  if (Platform.OS === "web" || !modelPath) {
    return `${offlineAssist(prompt)}${mode === "web" ? `\n\nLIVE WEB NOTES:\n${webNotes || "Search result नहीं मिला।"}` : ""}\n\nअभी model download नहीं है, इसलिए यह fast built-in task mode चल रहा है। Android में Fast model download करने पर detailed local answers भी मिलेंगे।`;
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
    { role: "system", content: `You are LocalAgent, a capable local-first task operator. Do not say you cannot assist for ordinary coding, website, file, terminal, planning, or project-generation tasks. Plan tasks before acting, use the terminal workspace when relevant, and never claim an action completed unless it actually ran. Reply in the user's language with concrete next steps. Mode: ${mode}. In think mode, provide a concise decision summary and plan, not private chain-of-thought. In web mode, cite the supplied web notes and clearly separate facts from uncertainty.` },
    ...history.slice(-8),
    { role: "user", content: enrichedPrompt },
  ];
  const result = await context.completion(
    { messages, n_predict: mode === "think" ? 512 : 256, temperature: mode === "think" ? 0.2 : 0.25, stop: ["</s>", "<|im_end|>", "<|endoftext|>"] },
    (data: { token?: string }) => data.token && onToken?.(data.token),
  );
  const text = String(result.text ?? "").trim();
  if (!text || /can't assist|cannot assist|unable to help|not able to help/i.test(text)) return offlineAssist(prompt);
  return text;
}

export async function releaseLocalModel() {
  if (context?.release) await context.release();
  context = null;
  loadedPath = null;
}

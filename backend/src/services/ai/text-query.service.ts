import knowledgeBase from "../../data/knowledge-base.json" with { type: "json" };
import { env } from "../../config/env.js";

interface KnowledgeBaseEntry {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

interface GeminiJsonResponse {
  transcript?: string;
  advisory?: string;
  confidence?: number;
  detectedIssue?: string;
  crop?: string;
  visibleSigns?: string[];
}

interface GeminiTextResponse {
  content: string;
  modelUsed: string;
}

interface InlineMediaPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export interface TextQueryResult {
  content: string;
  confidence: number;
  modelUsed: string;
  source: "knowledge_base" | "gemini" | "fallback";
}

export interface VoiceQueryResult extends TextQueryResult {
  transcript: string;
}

export interface ImageQueryResult extends TextQueryResult {
  detectedIssue: string;
  crop?: string;
  visibleSigns: string[];
}

let resolvedGeminiModelPromise: Promise<string> | null = null;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function findKnowledgeBaseMatch(query: string) {
  const normalized = normalize(query);
  const tokens = new Set(normalized.split(" ").filter(Boolean));
  let bestMatch: { entry: KnowledgeBaseEntry; score: number } | null = null;

  for (const entry of knowledgeBase as KnowledgeBaseEntry[]) {
    const matchedKeywords = entry.keywords.filter((keyword) => tokens.has(normalize(keyword)));
    const score = matchedKeywords.length / entry.keywords.length;

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        entry,
        score
      };
    }
  }

  return bestMatch;
}

function calculateConfidence(content: string, source: TextQueryResult["source"]) {
  if (source === "knowledge_base") {
    return 92;
  }

  if (source === "fallback") {
    return 58;
  }

  let confidence = 84;
  const normalized = content.toLowerCase();

  if (normalized.includes("may") || normalized.includes("might") || normalized.includes("possibly")) {
    confidence -= 8;
  }

  if (normalized.includes("consult") || normalized.includes("expert") || normalized.includes("officer")) {
    confidence -= 6;
  }

  if (content.length < 180) {
    confidence -= 10;
  }

  return clamp(confidence, 45, 95);
}

function combineConfidence(base: number | undefined, advisory: string, penalty = 0) {
  const derived = calculateConfidence(advisory, "gemini");
  if (typeof base !== "number" || Number.isNaN(base)) {
    return clamp(derived - penalty, 45, 95);
  }

  return clamp(Math.round(base * 0.6 + derived * 0.4) - penalty, 40, 95);
}

function buildFallbackResponse(query: string) {
  return [
    `Question received: ${query.trim()}.`,
    "1. Inspect the crop carefully and remove the most affected leaves or branches if the damage is localized.",
    "2. Avoid overwatering and avoid applying extra fertilizer until the cause is clear.",
    "3. If you can, capture a clear photo and note when the problem started, how fast it is spreading, and whether insects are visible.",
    "4. If the issue is spreading quickly, treat it as urgent and seek officer support."
  ].join(" ");
}

function buildVoiceFallback(transcript: string) {
  return [
    `Voice query received. Transcript summary: ${transcript}.`,
    "1. Re-check the affected area in daylight and confirm whether the issue is spreading crop-wide or only in patches.",
    "2. Avoid applying a new chemical immediately unless you are certain about the cause.",
    "3. Take one clear close-up photo and one full-plant photo for a better follow-up diagnosis.",
    "4. If wilting, rot, or rapid spread is visible, seek officer review quickly."
  ].join(" ");
}

function buildImageFallback(description: string, issue = "possible crop stress") {
  return [
    `Image query received. Based on the visible condition and your note, the crop may be facing ${issue}.`,
    "1. Isolate severely affected leaves or plants if the problem is localized.",
    "2. Check the underside of leaves for pests, eggs, or fungal growth before spraying.",
    "3. Avoid excess irrigation for the next 24 hours unless the crop is clearly drought-stressed.",
    `4. ${description ? `Keep tracking: ${description}.` : "Add a short note about when the problem started for a more precise follow-up."}`
  ].join(" ");
}

function normalizeFetchedMimeType(url: string, mimeType: string) {
  if (mimeType.startsWith("video/") && url.toLowerCase().includes(".webm")) {
    return "audio/webm";
  }

  if (mimeType.startsWith("video/") && url.toLowerCase().includes(".mp4")) {
    return "audio/mp4";
  }

  return mimeType;
}

async function resolveGeminiModel() {
  if (resolvedGeminiModelPromise) {
    return resolvedGeminiModelPromise;
  }

  resolvedGeminiModelPromise = (async () => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini model discovery failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as { models?: GeminiModel[] };
    const supportedModels = (data.models ?? []).filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent")
    );

    const preferredNames = [
      "models/gemini-2.5-flash",
      "models/gemini-2.0-flash",
      "models/gemini-1.5-flash",
      "models/gemini-1.5-flash-8b"
    ];

    for (const preferredName of preferredNames) {
      const match = supportedModels.find((model) => model.name === preferredName);
      if (match) {
        return match.name;
      }
    }

    const flashModel = supportedModels.find((model) => model.name.includes("flash"));
    if (flashModel) {
      return flashModel.name;
    }

    const firstSupported = supportedModels[0];
    if (!firstSupported) {
      throw new Error("No Gemini models with generateContent support were returned for this API key.");
    }

    return firstSupported.name;
  })();

  return resolvedGeminiModelPromise;
}

async function generateText(parts: Array<{ text: string } | InlineMediaPart>, responseMimeType?: "application/json") {
  const modelName = await resolveGeminiModel();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts
          }
        ],
        generationConfig: responseMimeType
          ? {
              responseMimeType
            }
          : undefined
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed for ${modelName}: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim();
  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    content,
    modelUsed: modelName.replace("models/", "")
  } satisfies GeminiTextResponse;
}

function parseGeminiJson<T>(value: string) {
  const normalized = value.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(normalized) as T;
}

async function fetchMediaPart(url: string, mimeTypeHint?: string): Promise<InlineMediaPart> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch media asset: ${response.status} ${response.statusText}`);
  }

  const mimeType = normalizeFetchedMimeType(
    url,
    mimeTypeHint ?? response.headers.get("content-type") ?? "application/octet-stream"
  );
  const bytes = Buffer.from(await response.arrayBuffer());

  return {
    inlineData: {
      mimeType,
      data: bytes.toString("base64")
    }
  };
}

async function generateWithGemini(query: string) {
  const prompt = `You are an agricultural advisor helping farmers in India. Respond in simple English. Keep the answer under 180 words. Use numbered steps. Focus on practical field advice. Mention when to seek expert help. Farmer question: ${query}`;
  const result = await generateText([{ text: prompt }]);

  return {
    content: result.content,
    modelUsed: result.modelUsed
  };
}

async function generateVoiceAnalysis(audioUrl: string, audioMimeType?: string, description?: string) {
  const audioPart = await fetchMediaPart(audioUrl, audioMimeType);
  const prompt = [
    "You are an agricultural advisor helping farmers in India.",
    "Listen to the farmer audio and return JSON only.",
    "JSON keys: transcript, advisory, confidence.",
    "transcript: concise English transcription of the farmer's issue.",
    "advisory: under 180 words, simple English, numbered steps, practical field advice.",
    "confidence: integer from 0 to 100 for how confident you are in the advisory.",
    description ? `Farmer's optional typed note: ${description}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  const result = await generateText([{ text: prompt }, audioPart], "application/json");
  return {
    parsed: parseGeminiJson<GeminiJsonResponse>(result.content),
    modelUsed: result.modelUsed
  };
}

async function generateImageAnalysis(imageUrl: string, imageMimeType?: string, description?: string) {
  const imagePart = await fetchMediaPart(imageUrl, imageMimeType);
  const prompt = [
    "You are an agricultural advisor helping farmers in India.",
    "Analyze the crop image and return JSON only.",
    "JSON keys: detectedIssue, crop, visibleSigns, advisory, confidence.",
    "detectedIssue: short probable diagnosis or visible condition.",
    "crop: crop name if inferable, else empty string.",
    "visibleSigns: array with up to 3 short symptoms visible in the image.",
    "advisory: under 180 words, simple English, numbered steps, practical field advice.",
    "confidence: integer from 0 to 100.",
    description ? `Farmer description: ${description}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  const result = await generateText([{ text: prompt }, imagePart], "application/json");
  return {
    parsed: parseGeminiJson<GeminiJsonResponse>(result.content),
    modelUsed: result.modelUsed
  };
}

export async function processTextQuery(query: string): Promise<TextQueryResult> {
  const kbMatch = findKnowledgeBaseMatch(query);
  if (kbMatch && kbMatch.score >= 0.4) {
    return {
      content: kbMatch.entry.answer,
      confidence: calculateConfidence(kbMatch.entry.answer, "knowledge_base"),
      modelUsed: "knowledge-base",
      source: "knowledge_base"
    };
  }

  if (!env.GEMINI_API_KEY) {
    const fallback = buildFallbackResponse(query);
    return {
      content: fallback,
      confidence: calculateConfidence(fallback, "fallback"),
      modelUsed: "fallback",
      source: "fallback"
    };
  }

  try {
    const geminiResult = await generateWithGemini(query);
    return {
      content: geminiResult.content,
      confidence: calculateConfidence(geminiResult.content, "gemini"),
      modelUsed: geminiResult.modelUsed,
      source: "gemini"
    };
  } catch (error) {
    console.error("Gemini text generation failed", error);
    const fallback = buildFallbackResponse(query);
    return {
      content: fallback,
      confidence: calculateConfidence(fallback, "fallback"),
      modelUsed: "fallback",
      source: "fallback"
    };
  }
}

export async function processVoiceQuery(input: {
  audioUrl: string;
  audioMimeType?: string;
  description?: string;
}): Promise<VoiceQueryResult> {
  if (!env.GEMINI_API_KEY) {
    const transcript = input.description?.trim() || "Voice transcription unavailable. Use the typed note or re-record the message.";
    const fallback = buildVoiceFallback(transcript);

    return {
      transcript,
      content: fallback,
      confidence: 56,
      modelUsed: "fallback",
      source: "fallback"
    };
  }

  try {
    const geminiResult = await generateVoiceAnalysis(input.audioUrl, input.audioMimeType, input.description);
    const transcript = geminiResult.parsed.transcript?.trim() || input.description?.trim() || "Audio received but transcription was limited.";
    const advisory = geminiResult.parsed.advisory?.trim() || buildVoiceFallback(transcript);

    return {
      transcript,
      content: advisory,
      confidence: combineConfidence(geminiResult.parsed.confidence, advisory, transcript.length < 20 ? 10 : 4),
      modelUsed: geminiResult.modelUsed,
      source: "gemini"
    };
  } catch (error) {
    console.error("Gemini voice generation failed", error);
    const transcript = input.description?.trim() || "Voice query received. Exact transcription was unavailable.";
    const fallback = buildVoiceFallback(transcript);

    return {
      transcript,
      content: fallback,
      confidence: 54,
      modelUsed: "fallback",
      source: "fallback"
    };
  }
}

export async function processImageQuery(input: {
  imageUrl: string;
  imageMimeType?: string;
  description?: string;
}): Promise<ImageQueryResult> {
  if (!env.GEMINI_API_KEY) {
    const issue = input.description?.trim() || "visible crop stress";
    const fallback = buildImageFallback(input.description?.trim() ?? "", issue);

    return {
      detectedIssue: issue,
      crop: undefined,
      visibleSigns: [],
      content: fallback,
      confidence: 55,
      modelUsed: "fallback",
      source: "fallback"
    };
  }

  try {
    const geminiResult = await generateImageAnalysis(input.imageUrl, input.imageMimeType, input.description);
    const detectedIssue = geminiResult.parsed.detectedIssue?.trim() || "visible crop stress";
    const advisory = geminiResult.parsed.advisory?.trim() || buildImageFallback(input.description?.trim() ?? "", detectedIssue);

    return {
      detectedIssue,
      crop: geminiResult.parsed.crop?.trim() || undefined,
      visibleSigns: geminiResult.parsed.visibleSigns?.filter(Boolean).slice(0, 3) ?? [],
      content: advisory,
      confidence: combineConfidence(geminiResult.parsed.confidence, advisory, detectedIssue === "visible crop stress" ? 8 : 2),
      modelUsed: geminiResult.modelUsed,
      source: "gemini"
    };
  } catch (error) {
    console.error("Gemini image generation failed", error);
    const detectedIssue = input.description?.trim() || "visible crop stress";
    const fallback = buildImageFallback(input.description?.trim() ?? "", detectedIssue);

    return {
      detectedIssue,
      crop: undefined,
      visibleSigns: [],
      content: fallback,
      confidence: 54,
      modelUsed: "fallback",
      source: "fallback"
    };
  }
}

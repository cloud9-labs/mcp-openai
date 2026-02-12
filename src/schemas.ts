import { z } from "zod";

export const chatCompletionSchema = z.object({
  model: z.string().describe("The model to use for chat completion (e.g., gpt-4, gpt-3.5-turbo)"),
  messages: z.array(z.record(z.unknown())).describe("Array of message objects with role and content"),
  temperature: z.number().optional().describe("Sampling temperature between 0 and 2"),
  maxTokens: z.number().optional().describe("Maximum number of tokens to generate"),
  topP: z.number().optional().describe("Nucleus sampling parameter"),
  tools: z.array(z.unknown()).optional().describe("List of tools the model may call"),
  toolChoice: z.unknown().optional().describe("Controls which (if any) tool is called"),
});

export const createEmbeddingSchema = z.object({
  model: z.string().describe("The model to use for embeddings (e.g., text-embedding-3-small)"),
  input: z.union([z.string(), z.array(z.string())]).describe("Input text or array of texts to embed"),
  dimensions: z.number().optional().describe("Number of dimensions for the embedding vector"),
});

export const listModelsSchema = z.object({}).describe("List all available models");

export const getModelSchema = z.object({
  modelId: z.string().describe("The ID of the model to retrieve"),
});

export const createImageSchema = z.object({
  prompt: z.string().describe("Text description of the desired image"),
  model: z.string().optional().describe("The model to use (default: dall-e-3)"),
  size: z.string().optional().describe("Size of the generated image (e.g., 1024x1024)"),
  quality: z.string().optional().describe("Quality of the image (standard or hd)"),
  n: z.number().optional().describe("Number of images to generate"),
});

export const createSpeechSchema = z.object({
  model: z.string().describe("TTS model to use (e.g., tts-1, tts-1-hd)"),
  input: z.string().describe("The text to generate audio for"),
  voice: z.string().describe("Voice to use (alloy, echo, fable, onyx, nova, shimmer)"),
  responseFormat: z.string().optional().describe("Audio format (mp3, opus, aac, flac)"),
  speed: z.number().optional().describe("Speed of audio playback (0.25 to 4.0)"),
});

export const createTranscriptionSchema = z.object({
  model: z.string().describe("The model to use for transcription (e.g., whisper-1)"),
  fileUrl: z.string().describe("URL of the audio file to transcribe"),
  language: z.string().optional().describe("Language of the input audio (ISO-639-1)"),
  responseFormat: z.string().optional().describe("Format of the transcript output"),
});

export const moderateContentSchema = z.object({
  input: z.string().describe("Text to classify for moderation"),
  model: z.string().optional().describe("Moderation model to use"),
});

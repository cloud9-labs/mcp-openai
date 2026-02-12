import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAIClient, ChatCompletionMessage } from "./client.js";
import {
  chatCompletionSchema,
  createEmbeddingSchema,
  listModelsSchema,
  getModelSchema,
  createImageSchema,
  createSpeechSchema,
  createTranscriptionSchema,
  moderateContentSchema,
} from "./schemas.js";

export function registerTools(server: McpServer, apiKey?: string): void {
  let _client: OpenAIClient | null = null;
  const getClient = () => { if (!_client) _client = new OpenAIClient(apiKey); return _client; };

  server.tool("openai_chat_completion", "Create a chat completion using OpenAI models like GPT-4 or GPT-3.5-turbo.", chatCompletionSchema.shape, async ({ model, messages, temperature, maxTokens, topP, tools, toolChoice }) => {
    try {
      const result = await getClient().chatCompletion(model, messages as ChatCompletionMessage[], temperature, maxTokens, topP, tools as unknown[] | undefined, toolChoice);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_create_embedding", "Create embeddings for text input using OpenAI embedding models.", createEmbeddingSchema.shape, async ({ model, input, dimensions }) => {
    try {
      const result = await getClient().createEmbedding(model, input, dimensions);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_list_models", "List all available OpenAI models and their details.", listModelsSchema.shape, async () => {
    try {
      const result = await getClient().listModels();
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_get_model", "Get detailed information about a specific OpenAI model.", getModelSchema.shape, async ({ modelId }) => {
    try {
      const result = await getClient().getModel(modelId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_create_image", "Generate images using DALL-E models based on text prompts.", createImageSchema.shape, async ({ prompt, model, size, quality, n }) => {
    try {
      const result = await getClient().createImage(prompt, model, size, quality, n);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_create_speech", "Generate spoken audio from text using OpenAI TTS models.", createSpeechSchema.shape, async ({ model, input, voice, responseFormat, speed }) => {
    try {
      const result = await getClient().createSpeech(model, input, voice, responseFormat, speed);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_create_transcription", "Transcribe audio to text using OpenAI Whisper model.", createTranscriptionSchema.shape, async ({ model, fileUrl, language, responseFormat }) => {
    try {
      const result = await getClient().createTranscription(model, fileUrl, language, responseFormat);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("openai_moderate_content", "Classify text content for moderation using OpenAI moderation models.", moderateContentSchema.shape, async ({ input, model }) => {
    try {
      const result = await getClient().moderateContent(input, model);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}

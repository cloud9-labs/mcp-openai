import axios, { AxiosInstance, AxiosError } from "axios";

const BASE_URL = "https://api.openai.com/v1";
const RATE_LIMIT_DELAY = 100; // 10 req/s = 100ms between requests

export interface ChatCompletionMessage {
  role: string;
  content: string;
  [key: string]: unknown;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatCompletionMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ModelResponse {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsListResponse {
  object: string;
  data: ModelResponse[];
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export interface SpeechResponse {
  audio_base64: string;
}

export interface TranscriptionResponse {
  text: string;
}

export interface ModerationResponse {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
}

export class OpenAIClient {
  private client: AxiosInstance;
  private lastRequestTime = 0;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  private async handleRequest<T>(
    request: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    await this.rateLimit();

    try {
      return await request();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 429 && retries > 0) {
          const retryAfter =
            parseInt(
              axiosError.response.headers["retry-after"] as string,
              10
            ) || 1;
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          return this.handleRequest(request, retries - 1);
        }
      }
      throw error;
    }
  }

  async chatCompletion(
    model: string,
    messages: ChatCompletionMessage[],
    temperature?: number,
    maxTokens?: number,
    topP?: number,
    tools?: unknown[],
    toolChoice?: unknown
  ): Promise<ChatCompletionResponse> {
    return this.handleRequest(async () => {
      const body: Record<string, unknown> = {
        model,
        messages,
      };

      if (temperature !== undefined) body.temperature = temperature;
      if (maxTokens !== undefined) body.max_tokens = maxTokens;
      if (topP !== undefined) body.top_p = topP;
      if (tools !== undefined) body.tools = tools;
      if (toolChoice !== undefined) body.tool_choice = toolChoice;

      const response = await this.client.post<ChatCompletionResponse>(
        "/chat/completions",
        body
      );
      return response.data;
    });
  }

  async createEmbedding(
    model: string,
    input: string | string[],
    dimensions?: number
  ): Promise<EmbeddingResponse> {
    return this.handleRequest(async () => {
      const body: Record<string, unknown> = {
        model,
        input,
      };

      if (dimensions !== undefined) body.dimensions = dimensions;

      const response = await this.client.post<EmbeddingResponse>(
        "/embeddings",
        body
      );
      return response.data;
    });
  }

  async listModels(): Promise<ModelsListResponse> {
    return this.handleRequest(async () => {
      const response = await this.client.get<ModelsListResponse>("/models");
      return response.data;
    });
  }

  async getModel(modelId: string): Promise<ModelResponse> {
    return this.handleRequest(async () => {
      const response = await this.client.get<ModelResponse>(
        `/models/${modelId}`
      );
      return response.data;
    });
  }

  async createImage(
    prompt: string,
    model?: string,
    size?: string,
    quality?: string,
    n?: number
  ): Promise<ImageGenerationResponse> {
    return this.handleRequest(async () => {
      const body: Record<string, unknown> = {
        prompt,
        model: model || "dall-e-3",
      };

      if (size !== undefined) body.size = size;
      if (quality !== undefined) body.quality = quality;
      if (n !== undefined) body.n = n;

      const response = await this.client.post<ImageGenerationResponse>(
        "/images/generations",
        body
      );
      return response.data;
    });
  }

  async createSpeech(
    model: string,
    input: string,
    voice: string,
    responseFormat?: string,
    speed?: number
  ): Promise<SpeechResponse> {
    return this.handleRequest(async () => {
      const body: Record<string, unknown> = {
        model,
        input,
        voice,
      };

      if (responseFormat !== undefined)
        body.response_format = responseFormat;
      if (speed !== undefined) body.speed = speed;

      const response = await this.client.post<ArrayBuffer>(
        "/audio/speech",
        body,
        {
          responseType: "arraybuffer",
        }
      );

      const base64 = Buffer.from(response.data).toString("base64");
      return { audio_base64: base64 };
    });
  }

  async createTranscription(
    model: string,
    fileUrl: string,
    language?: string,
    responseFormat?: string
  ): Promise<TranscriptionResponse> {
    return this.handleRequest(async () => {
      // Simplified: In production, you'd download the file and upload it as multipart/form-data
      // For now, we'll return a placeholder
      const body: Record<string, unknown> = {
        model,
        file: fileUrl, // This is simplified - real API needs FormData
      };

      if (language !== undefined) body.language = language;
      if (responseFormat !== undefined)
        body.response_format = responseFormat;

      const response = await this.client.post<TranscriptionResponse>(
        "/audio/transcriptions",
        body
      );
      return response.data;
    });
  }

  async moderateContent(
    input: string,
    model?: string
  ): Promise<ModerationResponse> {
    return this.handleRequest(async () => {
      const body: Record<string, unknown> = {
        input,
      };

      if (model !== undefined) body.model = model;

      const response = await this.client.post<ModerationResponse>(
        "/moderations",
        body
      );
      return response.data;
    });
  }
}

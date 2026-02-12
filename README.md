# @cloud9-labs/mcp-openai

MCP server for OpenAI API - 8 AI/ML tools for text, images, embeddings and moderation.

## Installation

```json
{
  "mcpServers": {
    "openai": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-openai"],
      "env": {
        "OPENAI_API_KEY": "sk-your-api-key"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| openai_chat_completion | Generate text using GPT models via chat interface |
| openai_create_embedding | Generate vector embeddings for text |
| openai_list_models | List available models |
| openai_get_model | Get detailed model information |
| openai_create_image | Generate images using DALL-E |
| openai_create_speech | Generate speech audio from text (TTS) |
| openai_create_transcription | Transcribe audio to text |
| openai_moderate_content | Check content for policy violations |

## Configuration

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="sk-..."
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API keys section
4. Create a new secret key
5. Copy and save the key securely

## License

MIT

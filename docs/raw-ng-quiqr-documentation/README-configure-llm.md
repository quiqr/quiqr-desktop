# LLM Provider Configuration Script

Interactive bash script to help configure LLM providers for Quiqr Desktop.

## Usage

```bash
./scripts/configure-llm-provider.sh
```

## Features

- 🎯 **Interactive menu** - Easy provider selection
- 🔐 **Secure input** - Prompts for credentials
- 🎨 **Colored output** - Clear visual feedback
- 💾 **Auto-save** - Optional .env file management
- 🔒 **URL encoding** - Automatic special character handling
- ✅ **Validation** - Checks required fields

## Supported Providers

1. **AWS Bedrock** (Anthropic Claude via AWS)
2. **OpenAI** (GPT models)
3. **Anthropic Direct** (Direct Anthropic API)
4. **Google Gemini**
5. **Azure OpenAI**
6. **Mistral AI**
7. **Cohere**

## Examples

### AWS Bedrock
```bash
QUIQR_LLM_PROVIDER_0="anthropic://bearer-token@bedrock?region=eu-central-1"
```

### OpenAI
```bash
QUIQR_LLM_PROVIDER_0="openai://sk-abc123..."
```

### Google Gemini
```bash
QUIQR_LLM_PROVIDER_0="google://api-key?location=us-central1"
```

## Output

The script generates connection strings that can be:
- Copied to your terminal
- Saved directly to `.env` file
- Used in environment variables

## Notes

- Special characters in API keys are automatically URL-encoded
- Existing variables in `.env` can be overwritten (with confirmation)
- Up to 10 providers can be configured (PROVIDER_0 through PROVIDER_9)
- The script validates required fields for each provider type

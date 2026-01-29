---
sidebar_position: 5
---

# LLM Provider Configuration

Quiqr Desktop supports AI-powered content assistance through multiple Large Language Model (LLM) providers. This enables features like:

- **Field AI Assist** - AI-powered text improvements, translations, and suggestions for individual fields
- **Page AI Assist** - Whole-page content generation and transformation
- **Prompt Templates** - Customizable AI workflows using template variables

:::tip Interactive Configuration Script
For the easiest setup experience, use the interactive configuration script:
```bash
./scripts/configure-llm-provider.sh
```

This script provides a menu-driven interface with validation and automatic `.env` file management.
:::

## Quick Start

Set environment variables `QUIQR_LLM_PROVIDER_0` through `QUIQR_LLM_PROVIDER_9` (maximum 10 providers).

**Connection string format:** `provider://credentials@endpoint?params`

**Example - OpenAI:**
```bash
export QUIQR_LLM_PROVIDER_0="openai://sk-abc123..."
```

**Example - AWS Bedrock:**
```bash
export QUIQR_LLM_PROVIDER_0="bedrock://your-api-key?region=us-east-1"
```

## Supported Providers

### 1. OpenAI

**Models:** GPT-4, GPT-3.5-turbo, o1, text-davinci, and more

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="openai://sk-YOUR_API_KEY"
```

**Custom endpoint (optional):**
```bash
QUIQR_LLM_PROVIDER_0="openai://api-key@api.custom.com"
```

**Model name patterns:**
- `gpt-*` (e.g., `gpt-4`, `gpt-3.5-turbo`)
- `o1-*` (e.g., `o1-preview`)
- `text-*` (e.g., `text-davinci-003`)

**Get API key:** [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. AWS Bedrock

**Models:** Anthropic Claude, Meta Llama, Amazon Titan, Cohere, Mistral, and more

AWS Bedrock is a multi-model platform that provides access to various foundation models through a single API.

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="bedrock://YOUR_API_KEY?region=us-east-1"
```

**Required parameters:**
- `region` - AWS region (e.g., `us-east-1`, `eu-central-1`)
- API key in the credentials portion

**Available regions:** Check [AWS Bedrock regions](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html#bedrock-regions)

**Model name patterns:**
- `anthropic.claude*` (e.g., `anthropic.claude-3-5-sonnet-20240620-v1:0`)
- `eu.anthropic.claude*` (EU-specific Claude models)
- `us.anthropic.claude*` (US-specific Claude models)
- `amazon.titan*` (e.g., `amazon.titan-text-express-v1`)
- `meta.llama*` (e.g., `meta.llama3-70b-instruct-v1:0`)
- `cohere.command*` (e.g., `cohere.command-r-plus-v1:0`)
- `ai21.*` (e.g., `ai21.j2-ultra-v1`)
- `mistral.*` (e.g., `mistral.mistral-7b-instruct-v0:2`)

**Get API key:** [AWS Console - Bedrock](https://console.aws.amazon.com/bedrock)

### 3. Anthropic Direct

**Models:** Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku

Use this for direct API access to Anthropic (not through AWS Bedrock).

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="anthropic://sk-ant-YOUR_API_KEY"
```

**Model name patterns:**
- `claude-*` (e.g., `claude-3-5-sonnet-20240620`, `claude-3-opus-20240229`)

**Get API key:** [Anthropic Console](https://console.anthropic.com/)

### 4. Google Gemini

**Models:** Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 1.0 Pro

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="google://YOUR_API_KEY"
```

**With location (optional):**
```bash
QUIQR_LLM_PROVIDER_0="google://YOUR_API_KEY?location=us-central1"
```

**Model name patterns:**
- `gemini-*` (e.g., `gemini-1.5-pro`, `gemini-1.5-flash`)
- `models/gemini*` (full model path format)

**Get API key:** [Google AI Studio](https://makersuite.google.com/app/apikey)

### 5. Azure OpenAI

**Models:** GPT-4, GPT-3.5-turbo (deployed through Azure)

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="azure://YOUR_API_KEY@myresource.openai.azure.com?deployment=gpt4"
```

**Required parameters:**
- Endpoint hostname (e.g., `myresource.openai.azure.com`)
- `deployment` - Your deployment name
- API key in the credentials portion

**Model name patterns:**
- `azure/*` (e.g., `azure/gpt-4`)
- `deployment/*` (e.g., `deployment/my-gpt4-deployment`)

**Setup:** [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

### 6. Mistral AI

**Models:** Mistral Large, Mistral Medium, Mistral Small, Open-Mistral

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="mistral://YOUR_API_KEY"
```

**Model name patterns:**
- `mistral-*` (e.g., `mistral-large-latest`, `mistral-medium`)
- `open-mistral*` (e.g., `open-mistral-7b`)

**Get API key:** [Mistral AI Platform](https://console.mistral.ai/)

### 7. Cohere

**Models:** Command R+, Command R, Command, Embed

**Connection string:**
```bash
QUIQR_LLM_PROVIDER_0="cohere://YOUR_API_KEY"
```

**Model name patterns:**
- `command-*` (e.g., `command-r-plus`, `command-r`)
- `embed-*` (e.g., `embed-english-v3.0`)

**Get API key:** [Cohere Dashboard](https://dashboard.cohere.com/api-keys)

## Configuration Methods

### Method 1: Environment Variables (Recommended)

Set environment variables before starting Quiqr Desktop:

**Linux/macOS:**
```bash
export QUIQR_LLM_PROVIDER_0="openai://sk-abc123..."
export QUIQR_LLM_PROVIDER_1="bedrock://token?region=us-east-1"
```

**Windows (PowerShell):**
```powershell
$env:QUIQR_LLM_PROVIDER_0="openai://sk-abc123..."
$env:QUIQR_LLM_PROVIDER_1="bedrock://token?region=us-east-1"
```

### Method 2: .env File

Create a `.env` file in the project root:

```bash
# .env file
QUIQR_LLM_PROVIDER_0="openai://sk-abc123..."
QUIQR_LLM_PROVIDER_1="bedrock://token?region=us-east-1"
```

:::warning Keep .env Private
Never commit `.env` files to version control. Add `.env` to your `.gitignore` file.
:::

### Method 3: Interactive Script

Use the built-in configuration script with menu-driven interface:

```bash
./scripts/configure-llm-provider.sh
```

**Features:**
- 🎯 Interactive provider selection
- 🔐 Secure credential input
- 🎨 Colored output and validation
- 💾 Automatic `.env` file management
- 🔒 URL encoding for special characters
- ✅ Field validation

The script will:
1. Present a menu of available providers
2. Prompt for required credentials and parameters
3. Generate a valid connection string
4. Optionally save to `.env` file

## Advanced Configuration

### Multiple Provider Instances

You can configure multiple instances of the same provider type:

```bash
QUIQR_LLM_PROVIDER_0="openai://work-key"
QUIQR_LLM_PROVIDER_1="openai://personal-key"
QUIQR_LLM_PROVIDER_2="bedrock://token?region=us-east-1"
QUIQR_LLM_PROVIDER_3="bedrock://token?region=eu-central-1"
```

The first matching provider (by registration order) handles each request unless explicitly specified.

### Explicit Provider Selection

In your LLM requests, you can specify which provider to use:

```typescript
await callLLM({
  model: 'gpt-4',
  prompt: '...',
  provider: 'provider-0'  // Use specific provider ID
});
```

### URL Encoding Special Characters

If your API key contains special characters (`+`, `=`, `/`, `@`, `?`), URL-encode them:

```bash
# Original key: abc+def=123/xyz
# Encoded:     abc%2Bdef%3D123%2Fxyz
QUIQR_LLM_PROVIDER_0="openai://abc%2Bdef%3D123%2Fxyz"
```

The interactive script handles this automatically.

### Provider Validation

On startup, Quiqr validates and logs all configured providers:

```
============================================================
Initializing LLM Providers
============================================================

✓ Registered provider-0: Openai
✓ Registered provider-1: Bedrock [eu-central-1]

✓ 2 provider(s) configured:

  provider-0: Openai
    Type: openai
    Example models: gpt-4, gpt-3.5-turbo

  provider-1: Bedrock [eu-central-1]
    Type: bedrock
    Example models: anthropic.claude-3-5-sonnet, meta.llama3, amazon.titan-text

============================================================
```

Check the console output to verify your providers are registered correctly.

## Provider Selection Logic

Quiqr automatically selects the appropriate provider based on the model name:

| Model Pattern | Provider | Example |
|--------------|----------|---------|
| `gpt-*`, `o1-*`, `text-*` | OpenAI | `gpt-4`, `o1-preview` |
| `claude-*` | Anthropic Direct | `claude-3-5-sonnet` |
| `anthropic.*`, `amazon.*`, `meta.*`, `cohere.*`, `ai21.*`, `mistral.*` | AWS Bedrock | `anthropic.claude-3-5-sonnet` |
| `gemini-*`, `models/gemini*` | Google | `gemini-1.5-pro` |
| `azure/*`, `deployment/*` | Azure OpenAI | `azure/gpt-4` |
| `mistral-*`, `open-mistral*` | Mistral AI | `mistral-large-latest` |
| `command-*`, `embed-*` | Cohere | `command-r-plus` |

:::tip Provider Precedence
When multiple providers match a model pattern, the first matching provider (lowest number) is used.
:::

## Troubleshooting

### "No provider found for model"

**Problem:** The model name doesn't match any configured provider's patterns.

**Solutions:**
1. Check that your model name matches the patterns above
2. Verify the provider is configured (check startup logs)
3. Configure the needed provider type
4. Use explicit provider selection with the `provider` parameter

### Missing region/deployment parameter

**Problem:** Provider requires additional parameters.

**Solutions:**
- **AWS Bedrock:** Add `?region=us-east-1` to connection string
- **Azure OpenAI:** Add `?deployment=your-deployment-name` to connection string
- **Google Gemini:** Optionally add `?location=us-central1` for specific region

### API key with special characters fails

**Problem:** Connection string parsing fails due to special characters.

**Solutions:**
1. URL-encode special characters in your API key
2. Use the interactive script which handles encoding automatically
3. Common encodings: `+` → `%2B`, `=` → `%3D`, `/` → `%2F`, `@` → `%40`, `?` → `%3F`

### Provider precedence issues

**Problem:** Wrong provider is being used when multiple providers could handle a model.

**Solutions:**
1. Check provider registration order (lowest number = highest priority)
2. Use explicit provider selection with `provider: 'provider-N'`
3. Reorder your `QUIQR_LLM_PROVIDER_*` variables

### No providers configured

**Problem:** No LLM providers are available.

**Solutions:**
1. Set at least one `QUIQR_LLM_PROVIDER_*` environment variable
2. Check that the variable is available when Quiqr starts
3. Verify `.env` file is in the correct location (project root)
4. Check startup logs for provider initialization messages

## Migration from Legacy Configuration

### Deprecated Environment Variables

Previous versions used provider-specific environment variables that are no longer supported:

| Old Variable | New Format |
|-------------|------------|
| ❌ `OPENAI_API_KEY` | ✅ `QUIQR_LLM_PROVIDER_0="openai://sk-abc123"` |
| ❌ `AWS_BEARER_TOKEN_BEDROCK` | ✅ `QUIQR_LLM_PROVIDER_0="bedrock://token?region=us-east-1"` |
| ❌ `AWS_REGION` | ✅ Included in connection string: `?region=us-east-1` |

### Migration Example

**Old configuration:**
```bash
OPENAI_API_KEY=sk-abc123
AWS_BEARER_TOKEN_BEDROCK=my-token
AWS_REGION=eu-central-1
```

**New configuration:**
```bash
QUIQR_LLM_PROVIDER_0="openai://sk-abc123"
QUIQR_LLM_PROVIDER_1="bedrock://my-token?region=eu-central-1"
```

### Benefits of New System

- **Multi-provider support** - Use multiple LLM providers simultaneously
- **Provider-agnostic** - Switch between providers without code changes
- **Explicit configuration** - Connection strings are self-documenting
- **Better defaults** - Automatic provider selection based on model names
- **Easier testing** - Configure different providers for different environments

## Using AI Features

Once providers are configured, you can use AI features throughout Quiqr:

### Field AI Assist

Enable AI assistance on individual fields by configuring field prompt templates:

```yaml
# In your model configuration
fields:
  - key: description
    type: string
    field_prompt_templates:
      - improve_text
      - fix_grammar
      - translate_text
```

See [Prompt Templates](../site-and-cms-developer-guide/prompt-templates.md) for detailed documentation.

### Page AI Assist

Access whole-page AI operations from the toolbar. Create page prompt templates in:
```
quiqr/model/includes/page_prompt_templates/
```

### Custom Prompts

Create custom AI workflows using template variables:
- Access page content and frontmatter
- Build dynamic forms for user input
- Use utility functions for advanced operations

## Best Practices

### Security

- **Never commit API keys** - Add `.env` to `.gitignore`
- **Use environment-specific keys** - Different keys for development/production
- **Rotate keys regularly** - Generate new keys periodically
- **Limit key permissions** - Use provider-specific permission controls

### Cost Management

- **Monitor usage** - Check provider dashboards for usage metrics
- **Set spending limits** - Configure budget alerts in provider consoles
- **Use appropriate models** - Smaller models for simple tasks, larger for complex ones
- **Cache results** - Consider implementing caching for repeated requests

### Provider Selection

- **Primary provider** - Set your most-used provider as `PROVIDER_0`
- **Fallback options** - Configure backup providers for redundancy
- **Regional considerations** - Use regional providers for data residency requirements
- **Model availability** - Some models are only available through specific providers

### Testing

- **Test with small models first** - Verify configuration before using expensive models
- **Check startup logs** - Confirm providers are registered correctly
- **Test each provider** - Verify all configured providers work as expected
- **Monitor errors** - Watch for authentication or quota issues

## Next Steps

- [Prompt Templates](../site-and-cms-developer-guide/prompt-templates.md) - Create custom AI workflows
- [Field Reference](../site-and-cms-developer-guide/field-reference/index.md) - Learn which fields support AI assist
- [All Settings](./all-settings.md) - Review complete configuration options

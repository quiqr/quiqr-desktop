#!/usr/bin/env bash

# Quiqr LLM Provider Configuration Helper
# Generates connection strings for LLM providers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    color=$1
    shift
    echo -e "${color}$@${NC}"
}

print_header() {
    echo ""
    print_color "$BLUE" "============================================"
    print_color "$BLUE" "$1"
    print_color "$BLUE" "============================================"
    echo ""
}

print_success() {
    print_color "$GREEN" "✓ $1"
}

print_error() {
    print_color "$RED" "✗ $1"
}

print_warning() {
    print_color "$YELLOW" "⚠ $1"
}

# URL encode function
urlencode() {
    local string="${1}"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * ) printf -v o '%%%02x' "'$c"
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

# Show main menu
show_menu() {
    print_header "Quiqr LLM Provider Configuration Helper"
    echo "Select a provider to configure:"
    echo ""
    echo "  1) AWS Bedrock (Multi-Model Platform)"
    echo "  2) OpenAI"
    echo "  3) Anthropic Direct"
    echo "  4) Google Gemini"
    echo "  5) Azure OpenAI"
    echo "  6) Mistral AI"
    echo "  7) Cohere"
    echo "  8) Show all configurations"
    echo "  9) Exit"
    echo ""
}

# Configure AWS Bedrock
configure_bedrock() {
    print_header "AWS Bedrock Configuration"
    
    echo "AWS Bedrock is a multi-model platform providing access to foundation models"
    echo "from Anthropic, Meta, Amazon, Cohere, AI21, and more."
    echo ""
    
    # Get API key
    echo -n "Enter your AWS Bedrock API key: "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    # Get region
    echo ""
    echo "Available AWS regions (examples):"
    echo "  - us-east-1 (N. Virginia)"
    echo "  - us-west-2 (Oregon)"
    echo "  - eu-central-1 (Frankfurt)"
    echo "  - eu-west-1 (Ireland)"
    echo "  - ap-southeast-1 (Singapore)"
    echo ""
    echo -n "Enter AWS region [us-east-1]: "
    read -r region
    region=${region:-us-east-1}
    
    # URL encode the API key if needed
    encoded_key=$(urlencode "$api_key")
    
    # Generate connection string
    connection_string="bedrock://${encoded_key}?region=${region}"
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  Anthropic Claude:"
    echo "    - anthropic.claude-3-5-sonnet-20241022-v2:0"
    echo "    - anthropic.claude-3-opus-20240229-v1:0"
    echo "    - eu.anthropic.claude-sonnet-4-5-20250929-v1:0"
    echo "  Meta Llama:"
    echo "    - meta.llama3-70b-instruct-v1:0"
    echo "    - meta.llama3-8b-instruct-v1:0"
    echo "  Amazon Titan:"
    echo "    - amazon.titan-text-express-v1"
    echo "    - amazon.titan-text-lite-v1"
    echo "  Cohere:"
    echo "    - cohere.command-r-plus-v1:0"
    echo "    - cohere.command-r-v1:0"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Configure OpenAI
configure_openai() {
    print_header "OpenAI Configuration"
    
    echo "Configure OpenAI GPT models."
    echo ""
    
    # Get API key
    echo -n "Enter your OpenAI API key (sk-...): "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    # Ask about custom endpoint
    echo ""
    echo -n "Use custom endpoint? (y/N): "
    read -r custom_endpoint
    
    connection_string=""
    if [[ "$custom_endpoint" =~ ^[Yy]$ ]]; then
        echo -n "Enter custom endpoint (e.g., api.custom.com): "
        read -r endpoint
        
        encoded_key=$(urlencode "$api_key")
        connection_string="openai://${encoded_key}@${endpoint}"
    else
        encoded_key=$(urlencode "$api_key")
        connection_string="openai://${encoded_key}"
    fi
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  - gpt-4"
    echo "  - gpt-4-turbo"
    echo "  - gpt-3.5-turbo"
    echo "  - o1-preview"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Configure Anthropic Direct
configure_anthropic() {
    print_header "Anthropic Direct Configuration"
    
    echo "Configure direct Anthropic API access."
    echo ""
    
    # Get API key
    echo -n "Enter your Anthropic API key (sk-ant-...): "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    # URL encode the API key
    encoded_key=$(urlencode "$api_key")
    
    # Generate connection string
    connection_string="anthropic://${encoded_key}"
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  - claude-3-5-sonnet-20241022"
    echo "  - claude-3-opus-20240229"
    echo "  - claude-3-haiku-20240307"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Configure Google Gemini
configure_google() {
    print_header "Google Gemini Configuration"
    
    echo "Configure Google Gemini models."
    echo ""
    
    # Get API key
    echo -n "Enter your Google API key: "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    # Ask about location
    echo ""
    echo -n "Specify location? (optional, press Enter to skip): "
    read -r location
    
    encoded_key=$(urlencode "$api_key")
    
    if [ -n "$location" ]; then
        connection_string="google://${encoded_key}?location=${location}"
    else
        connection_string="google://${encoded_key}"
    fi
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  - gemini-pro"
    echo "  - gemini-1.5-pro"
    echo "  - models/gemini-pro"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Configure Azure OpenAI
configure_azure() {
    print_header "Azure OpenAI Configuration"
    
    echo "Configure Azure OpenAI service."
    echo ""
    
    # Get API key
    echo -n "Enter your Azure API key: "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    # Get endpoint
    echo -n "Enter your Azure endpoint (e.g., myresource.openai.azure.com): "
    read -r endpoint
    
    if [ -z "$endpoint" ]; then
        print_error "Endpoint cannot be empty"
        return 1
    fi
    
    # Get deployment name
    echo -n "Enter deployment name (e.g., gpt4): "
    read -r deployment
    
    if [ -z "$deployment" ]; then
        print_error "Deployment name cannot be empty"
        return 1
    fi
    
    encoded_key=$(urlencode "$api_key")
    connection_string="azure://${encoded_key}@${endpoint}?deployment=${deployment}"
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  - azure/gpt-4"
    echo "  - deployment/gpt-35-turbo"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Configure Mistral AI
configure_mistral() {
    print_header "Mistral AI Configuration"
    
    echo "Configure Mistral AI models."
    echo ""
    
    # Get API key
    echo -n "Enter your Mistral API key: "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    encoded_key=$(urlencode "$api_key")
    connection_string="mistral://${encoded_key}"
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  - mistral-large"
    echo "  - mistral-medium"
    echo "  - open-mistral-7b"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Configure Cohere
configure_cohere() {
    print_header "Cohere Configuration"
    
    echo "Configure Cohere models."
    echo ""
    
    # Get API key
    echo -n "Enter your Cohere API key: "
    read -r api_key
    
    if [ -z "$api_key" ]; then
        print_error "API key cannot be empty"
        return 1
    fi
    
    encoded_key=$(urlencode "$api_key")
    connection_string="cohere://${encoded_key}"
    
    echo ""
    print_success "Connection string generated!"
    echo ""
    print_color "$GREEN" "Connection String:"
    echo "QUIQR_LLM_PROVIDER_0=\"${connection_string}\""
    echo ""
    
    echo "Example models you can use:"
    echo "  - command-r-plus"
    echo "  - command-r"
    echo "  - embed-english-v3"
    echo ""
    
    # Ask to save
    echo -n "Save to .env file? (y/N): "
    read -r save_env
    if [[ "$save_env" =~ ^[Yy]$ ]]; then
        save_to_env "QUIQR_LLM_PROVIDER_0" "$connection_string"
    fi
}

# Show all current configurations
show_all_configs() {
    print_header "Current LLM Provider Configurations"
    
    found=0
    for i in {0..9}; do
        var_name="QUIQR_LLM_PROVIDER_${i}"
        if [ -n "${!var_name}" ]; then
            echo "QUIQR_LLM_PROVIDER_${i}=\"${!var_name}\""
            found=1
        fi
    done
    
    if [ $found -eq 0 ]; then
        print_warning "No LLM providers configured in environment"
        echo ""
        echo "Check your .env file or environment variables."
    fi
    
    echo ""
    echo "Press Enter to continue..."
    read
}

# Save to .env file
save_to_env() {
    local var_name=$1
    local value=$2
    local env_file=".env"
    
    # Check if .env exists
    if [ ! -f "$env_file" ]; then
        echo ""
        echo -n "Create new .env file? (Y/n): "
        read -r create_env
        if [[ ! "$create_env" =~ ^[Nn]$ ]]; then
            touch "$env_file"
            print_success "Created $env_file"
        else
            print_warning "Skipped saving to .env"
            return
        fi
    fi
    
    # Check if variable already exists
    if grep -q "^${var_name}=" "$env_file"; then
        echo ""
        print_warning "Variable $var_name already exists in $env_file"
        echo -n "Overwrite? (y/N): "
        read -r overwrite
        if [[ "$overwrite" =~ ^[Yy]$ ]]; then
            # Remove old line and add new one
            sed -i "/^${var_name}=/d" "$env_file"
            echo "${var_name}=\"${value}\"" >> "$env_file"
            print_success "Updated $var_name in $env_file"
        else
            print_warning "Skipped updating $var_name"
        fi
    else
        echo "${var_name}=\"${value}\"" >> "$env_file"
        print_success "Added $var_name to $env_file"
    fi
}

# Main loop
main() {
    while true; do
        show_menu
        echo -n "Enter choice [1-9]: "
        read -r choice
        
        case $choice in
            1) configure_bedrock ;;
            2) configure_openai ;;
            3) configure_anthropic ;;
            4) configure_google ;;
            5) configure_azure ;;
            6) configure_mistral ;;
            7) configure_cohere ;;
            8) show_all_configs ;;
            9)
                echo ""
                print_success "Goodbye!"
                echo ""
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-9."
                sleep 1
                ;;
        esac
    done
}

# Run main
main

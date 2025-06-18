#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
OLLAMA_MODEL="llama3.1:8b-instruct-q4_K_M"
OLLAMA_URL="http://localhost:11434"
MAX_RETRIES=30
RETRY_INTERVAL=5

echo -e "${BLUE}🚀 Setting up CoachGPT Pro LLM Service...${NC}"

# Function to check if a service is running
check_service() {
    local service_name=$1
    local host=$2
    local port=$3
    
    if nc -z "$host" "$port" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $service_name is not running on $host:$port${NC}"
        return 1
    fi
}

# Function to wait for Ollama to be ready
wait_for_ollama() {
    echo -e "${BLUE}🤖 Waiting for Ollama to be ready...${NC}"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Ollama is ready after $((retries + 1)) attempts${NC}"
            return 0
        else
            retries=$((retries + 1))
            echo -e "${YELLOW}⏳ Waiting for Ollama... ($retries/$MAX_RETRIES)${NC}"
            sleep $RETRY_INTERVAL
        fi
    done
    
    echo -e "${RED}❌ Ollama failed to start after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to check if model exists
model_exists() {
    if curl -s "$OLLAMA_URL/api/tags" | grep -q "$OLLAMA_MODEL"; then
        return 0
    else
        return 1
    fi
}

# Function to pull model with progress
pull_model() {
    echo -e "${BLUE}📥 Pulling $OLLAMA_MODEL (this may take 5-15 minutes)...${NC}"
    echo -e "${YELLOW}☕ Grab a coffee while the model downloads...${NC}"
    
    # Pull model with timeout
    if timeout 1800 curl -X POST "$OLLAMA_URL/api/pull" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$OLLAMA_MODEL\"}" \
        --no-buffer; then
        echo -e "${GREEN}✅ Model downloaded successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Model download failed or timed out${NC}"
        return 1
    fi
}

# Function to test model functionality
test_model() {
    echo -e "${BLUE}🧪 Testing model functionality...${NC}"
    
    local response=$(curl -s -X POST "$OLLAMA_URL/api/generate" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$OLLAMA_MODEL\",
            \"prompt\": \"Hello\",
            \"stream\": false,
            \"options\": {\"num_predict\": 1}
        }" \
        --max-time 30)
    
    if echo "$response" | grep -q '"response"'; then
        echo -e "${GREEN}✅ Model is functional and ready${NC}"
        return 0
    else
        echo -e "${RED}❌ Model test failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Create dist directory
mkdir -p dist

# Build TypeScript (skip if already built in Docker)
if [ "$SKIP_BUILD" != "true" ]; then
    echo -e "${BLUE}🔨 Building TypeScript...${NC}"
    if npm run build; then
        echo -e "${GREEN}✅ TypeScript build successful${NC}"
    else
        echo -e "${RED}❌ TypeScript build failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ TypeScript already built${NC}"
fi

# Check and wait for Ollama
if ! wait_for_ollama; then
    echo -e "${RED}❌ Cannot proceed without Ollama. Please ensure Ollama is running.${NC}"
    echo -e "${YELLOW}To start Ollama:${NC}"
    echo "  1. Install: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "  2. Start: ollama serve"
    exit 1
fi

# Check if model exists, pull if needed
if model_exists; then
    echo -e "${GREEN}✅ $OLLAMA_MODEL is already available${NC}"
else
    echo -e "${YELLOW}⚠️  $OLLAMA_MODEL not found, downloading...${NC}"
    if ! pull_model; then
        echo -e "${RED}❌ Failed to download model. Cannot start service.${NC}"
        exit 1
    fi
fi

# Test model functionality
if ! test_model; then
    echo -e "${RED}❌ Model is not functional. Cannot start service safely.${NC}"
    echo -e "${YELLOW}💡 Try running: ollama pull $OLLAMA_MODEL${NC}"
    exit 1
fi

# Check dependencies (non-blocking)
echo -e "${BLUE}🔍 Checking service dependencies...${NC}"

# Check PostgreSQL
if check_service "PostgreSQL" "localhost" "5432"; then
    DB_STATUS="✅"
else
    DB_STATUS="⚠️"
fi

# Check Redis
if check_service "Redis" "localhost" "6379"; then
    REDIS_STATUS="✅"
else
    REDIS_STATUS="⚠️"
fi

# Final status report
echo ""
echo -e "${PURPLE}=====================================${NC}"
echo -e "${GREEN}🎉 CoachGPT Pro LLM Service Ready!${NC}"
echo -e "${PURPLE}=====================================${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "  🤖 Ollama: ${GREEN}✅ Ready${NC}"
echo -e "  🧠 Model: ${GREEN}✅ $OLLAMA_MODEL loaded${NC}"
echo -e "  🐘 PostgreSQL: $DB_STATUS"
echo -e "  🔴 Redis: $REDIS_STATUS"
echo ""
echo -e "${BLUE}🚀 Ready to start:${NC}"
echo -e "  Development: ${YELLOW}npm run dev${NC}"
echo -e "  Production:  ${YELLOW}npm start${NC}"
echo ""
echo -e "${BLUE}📍 Service endpoints:${NC}"
echo -e "  Health:    ${GREEN}http://localhost:5003/health${NC}"
echo -e "  Chat API:  ${GREEN}http://localhost:5003/chat${NC}"
echo -e "  Stream:    ${GREEN}http://localhost:5003/chat/stream${NC}"
echo -e "  Models:    ${GREEN}http://localhost:5003/chat/models${NC}"
echo ""

# Set environment variable to skip model download in the service
export SKIP_MODEL_DOWNLOAD=true
echo -e "${GREEN}🔧 Environment configured for quick startup${NC}"
echo ""

# Optional: Auto-start the service
read -p "🚀 Start the service now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🏃 Starting CoachGPT Pro LLM Service...${NC}"
    npm start
fi
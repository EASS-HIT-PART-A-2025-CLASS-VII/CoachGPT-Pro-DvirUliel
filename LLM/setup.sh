#!/bin/bash

echo "🚀 Setting up CoachGPT Pro LLM Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create dist directory
mkdir -p dist

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Check if Ollama is available
echo "🤖 Checking Ollama availability..."
if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
    
    # Check if the model is available
    if curl -s http://localhost:11434/api/tags | grep -q "llama3.1:8b-instruct-q4_K_M"; then
        echo "✅ Llama 3.1 8B model is already available"
    else
        echo "📥 Pulling Llama 3.1 8B model (this may take a while)..."
        curl -X POST http://localhost:11434/api/pull \
             -H "Content-Type: application/json" \
             -d '{"name": "llama3.1:8b-instruct-q4_K_M"}' \
             --no-buffer
        echo "✅ Model downloaded successfully"
    fi
else
    echo "⚠️  Ollama is not running. Please start Ollama first:"
    echo "   1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "   2. Start Ollama: ollama serve"
    echo "   3. Pull the model: ollama pull llama3.1:8b-instruct-q4_K_M"
fi

# Check if PostgreSQL is available
echo "🐘 Checking PostgreSQL availability..."
if nc -z localhost 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL is not running on port 5432"
fi

# Check if Redis is available
echo "🔴 Checking Redis availability..."
if nc -z localhost 6379 > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "⚠️  Redis is not running on port 6379"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the LLM service:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
echo "Service will be available at:"
echo "  - Health: http://localhost:5003/health"
echo "  - Chat API: http://localhost:5003/api/llm/chat"
echo "  - Stream API: http://localhost:5003/api/llm/chat/stream"
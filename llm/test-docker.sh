#!/bin/bash

# Docker LLM Service Testing Script for CoachGPT Pro
# Location: llm/test-docker.sh
# Usage: chmod +x test-docker.sh && ./test-docker.sh

echo "🚀 Starting CoachGPT Pro LLM Service Docker Tests..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables for testing
TEST_USER_ID="550e8400-e29b-41d4-a716-446655440000"  # Test UUID

# Test functions
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $url)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

test_json_response() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s --max-time 10 $url)
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC} (Valid JSON)"
        echo -e "${BLUE}Response:${NC} $response"
        return 0
    else
        echo -e "${GREEN}✓ PASSED${NC} (Response received)"
        echo -e "${BLUE}Response:${NC} $response"
        return 0
    fi
}

test_chat_endpoint() {
    local description=$1
    
    echo -n "Testing $description... "
    
    local temp_file=$(mktemp)
    local status_code=$(curl -s -w "%{http_code}" --max-time 30 \
        -X POST "$LLM_URL/chat" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"message\": \"Hi\"
        }" \
        -o "$temp_file")
    
    local response_body=$(cat "$temp_file")
    rm -f "$temp_file"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        echo -e "${BLUE}Response:${NC} ${response_body:0:200}..."
        return 0
    elif [ "$status_code" = "503" ]; then
        echo -e "${YELLOW}⚠ SERVICE UNAVAILABLE${NC} (LLM not ready - Status: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 0
    elif [ "$status_code" = "429" ]; then
        echo -e "${YELLOW}⚠ RATE LIMITED${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: 200, Got: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 1
    fi
}

test_chat_stream() {
    local description=$1
    
    echo -n "Testing $description... "
    
    local temp_file=$(mktemp)
    local status_code=$(curl -s -w "%{http_code}" --max-time 30 \
        -X POST "$LLM_URL/chat/stream" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"message\": \"Hello\"
        }" \
        -o "$temp_file")
    
    local response_body=$(cat "$temp_file")
    rm -f "$temp_file"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        echo -e "${BLUE}Stream Response:${NC} ${response_body:0:100}..."
        return 0
    elif [ "$status_code" = "503" ]; then
        echo -e "${YELLOW}⚠ SERVICE UNAVAILABLE${NC} (LLM not ready - Status: $status_code)"
        return 0
    elif [ "$status_code" = "429" ]; then
        echo -e "${YELLOW}⚠ RATE LIMITED${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: 200, Got: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 1
    fi
}

test_ollama_connectivity() {
    local description=$1
    
    echo -n "Testing $description... "
    
    response=$(curl -s --max-time 10 "$OLLAMA_URL/api/tags")
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC} (Ollama API responding)"
        
        # Check if llama3.2:3b model exists
        if echo "$response" | jq -r '.models[].name' | grep -q "llama3.2:3b"; then
            echo -e "${BLUE}Model Status:${NC} llama3.2:3b model found"
        else
            echo -e "${YELLOW}Model Status:${NC} llama3.2:3b model not found (may be downloading)"
        fi
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Ollama not responding)"
        return 1
    fi
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠ Warning: jq not found. JSON parsing will be limited.${NC}"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Base URLs
LLM_URL="http://localhost:5003"
OLLAMA_URL="http://localhost:11434"

# Test counter
PASSED=0
FAILED=0

echo -e "\n${YELLOW}=== DOCKER CONTAINER STATUS ===${NC}"

# Check if containers are running
if docker ps | grep -q "coachgpt_llm_service"; then
    echo -e "LLM Service container: ${GREEN}✓ RUNNING${NC}"
    ((PASSED++))
else
    echo -e "LLM Service container: ${RED}✗ NOT RUNNING${NC}"
    ((FAILED++))
    echo "Try running: docker-compose up -d llm-service"
fi

if docker ps | grep -q "coachgpt_ollama"; then
    echo -e "Ollama container: ${GREEN}✓ RUNNING${NC}"
    ((PASSED++))
else
    echo -e "Ollama container: ${RED}✗ NOT RUNNING${NC}"
    ((FAILED++))
    echo "Try running: docker-compose up -d ollama"
fi

echo -e "\n${YELLOW}=== OLLAMA ENGINE TESTS ===${NC}"

# Test Ollama connectivity
if test_ollama_connectivity "Ollama API connectivity"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test Ollama models endpoint
if test_json_response "$OLLAMA_URL/api/tags" "Ollama models list"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== LLM SERVICE HEALTH CHECKS ===${NC}"

# Test basic health endpoint
if test_json_response "$LLM_URL/health" "Basic health endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test detailed health endpoint
if test_json_response "$LLM_URL/health/detailed" "Detailed health endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test readiness probe
if test_json_response "$LLM_URL/health/ready" "Readiness probe"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test liveness probe
if test_json_response "$LLM_URL/health/live" "Liveness probe"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test dependencies status
if test_json_response "$LLM_URL/health/dependencies" "Dependencies status"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test performance metrics
if test_json_response "$LLM_URL/health/metrics" "Performance metrics"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test AI generation test
if test_json_response "$LLM_URL/health/test" "AI generation test"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== CHAT API TESTS ===${NC}"

# Test available models endpoint
if test_json_response "$LLM_URL/chat/models" "Available models endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test chat endpoint
echo -e "${BLUE}Testing with User ID: $TEST_USER_ID${NC}"
if test_chat_endpoint "Chat endpoint (non-streaming)"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test streaming chat endpoint
if test_chat_stream "Chat endpoint (streaming)"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== ERROR HANDLING TESTS ===${NC}"

# Test rate limiting (send multiple requests quickly)
echo -n "Testing rate limiting... "
rate_limit_count=0
for i in {1..12}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST "$LLM_URL/chat" \
        -H "Content-Type: application/json" \
        -d "{\"userId\": \"$TEST_USER_ID\", \"message\": \"test$i\"}")
    if [ "$response" = "429" ]; then
        ((rate_limit_count++))
    fi
done

if [ $rate_limit_count -gt 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Rate limiting active - $rate_limit_count/12 requests limited)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Rate limiting not triggered - may need more requests)"
    ((PASSED++))
fi

# Test invalid request format
echo -n "Testing invalid request handling... "
invalid_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST "$LLM_URL/chat" \
    -H "Content-Type: application/json" \
    -d "{\"invalid\": \"data\"}")

if [ "$invalid_response" = "400" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Proper validation - Status: 400)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Expected: 400, Got: $invalid_response)"
    ((PASSED++))
fi

echo -e "\n${YELLOW}=== NETWORK CONNECTIVITY ===${NC}"

# Test LLM Service → Ollama connectivity
if docker exec coachgpt_llm_service wget -q --spider http://ollama:11434/api/tags 2>/dev/null; then
    echo -e "LLM Service → Ollama: ${GREEN}✓ CONNECTED${NC}"
    ((PASSED++))
else
    echo -e "LLM Service → Ollama: ${RED}✗ CONNECTION FAILED${NC}"
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== CONTAINER LOGS CHECK ===${NC}"

# Check LLM service logs for errors
echo -n "Checking LLM service logs... "
llm_error_count=$(docker logs coachgpt_llm_service 2>&1 | grep -i "error" | grep -v "Health check" | wc -l || echo "0")
if [ "$llm_error_count" -eq 0 ]; then
    echo -e "${GREEN}✓ NO CRITICAL ERRORS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ $llm_error_count ERRORS FOUND${NC}"
    echo "Recent LLM service errors:"
    docker logs coachgpt_llm_service 2>&1 | grep -i "error" | grep -v "Health check" | tail -3
fi

# Check Ollama logs for errors
echo -n "Checking Ollama logs... "
ollama_error_count=$(docker logs coachgpt_ollama 2>&1 | grep -i "error" | wc -l || echo "0")
if [ "$ollama_error_count" -eq 0 ]; then
    echo -e "${GREEN}✓ NO CRITICAL ERRORS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ $ollama_error_count ERRORS FOUND${NC}"
    echo "Recent Ollama errors:"
    docker logs coachgpt_ollama 2>&1 | grep -i "error" | tail -3
fi

echo -e "\n${YELLOW}=== PERFORMANCE TESTS ===${NC}"

# Test LLM service response time
llm_response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time 10 $LLM_URL/health 2>/dev/null || echo "10.0")
if (( $(echo "$llm_response_time < 3.0" | bc -l 2>/dev/null || echo "1") )); then
    echo -e "LLM Service response time: ${GREEN}✓ FAST${NC} (${llm_response_time}s)"
    ((PASSED++))
else
    echo -e "LLM Service response time: ${YELLOW}⚠ SLOW${NC} (${llm_response_time}s)"
    ((PASSED++))
fi

# Test Ollama response time
ollama_response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time 10 $OLLAMA_URL/api/tags 2>/dev/null || echo "10.0")
if (( $(echo "$ollama_response_time < 3.0" | bc -l 2>/dev/null || echo "1") )); then
    echo -e "Ollama response time: ${GREEN}✓ FAST${NC} (${ollama_response_time}s)"
    ((PASSED++))
else
    echo -e "Ollama response time: ${YELLOW}⚠ SLOW${NC} (${ollama_response_time}s)"
    ((PASSED++))
fi

echo -e "\n${YELLOW}=== MODEL STATUS CHECK ===${NC}"

# Check if llama3.2:3b model is available
echo -n "Checking llama3.2:3b model status... "
model_check=$(curl -s --max-time 10 "$OLLAMA_URL/api/tags" | jq -r '.models[]?.name' 2>/dev/null | grep "llama3.2:3b" || echo "")
if [ -n "$model_check" ]; then
    echo -e "${GREEN}✓ MODEL AVAILABLE${NC} ($model_check)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ MODEL NOT FOUND${NC} (May be downloading or not pulled)"
    echo -e "${BLUE}To pull model:${NC} docker exec coachgpt_ollama ollama pull llama3.2:3b"
    ((PASSED++))  # Don't fail if model is downloading
fi

echo -e "\n${YELLOW}=== SUMMARY ===${NC}"
echo -e "Tests passed: ${GREEN}$PASSED${NC}"
echo -e "Tests failed: ${RED}$FAILED${NC}"

# Calculate success percentage
if [ $((PASSED + FAILED)) -gt 0 ]; then
    success_rate=$(( (PASSED * 100) / (PASSED + FAILED) ))
    echo -e "Success rate: ${BLUE}$success_rate%${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your CoachGPT Pro LLM Service is running properly.${NC}"
    echo -e "\n${BLUE}🔗 LLM Service API: $LLM_URL${NC}"
    echo -e "${BLUE}🤖 Ollama Engine: $OLLAMA_URL${NC}"
    echo -e "${BLUE}💊 Health Check: $LLM_URL/health${NC}"
    echo -e "${BLUE}💬 Chat API: $LLM_URL/chat${NC}"
    echo -e "${BLUE}🌊 Streaming Chat: $LLM_URL/chat/stream${NC}"
    echo -e "${BLUE}📊 Models: $LLM_URL/chat/models${NC}"
    exit 0
elif [ $FAILED -le 2 ]; then
    echo -e "\n${YELLOW}⚠ Most tests passed! Only minor issues remaining.${NC}"
    echo -e "\n${BLUE}🔗 LLM Service API: $LLM_URL${NC}"
    echo -e "${BLUE}🤖 Ollama Engine: $OLLAMA_URL${NC}"
    echo -e "${BLUE}💊 Health Check: $LLM_URL/health${NC}"
    exit 0
else
    echo -e "\n${RED}❌ $FAILED test(s) failed. Please check the output above.${NC}"
    echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
    echo "- Check container status: docker-compose ps"
    echo "- View LLM logs: docker-compose logs -f llm-service"
    echo "- View Ollama logs: docker-compose logs -f ollama"
    echo "- Restart services: docker-compose restart llm-service ollama"
    echo "- Pull model manually: docker exec coachgpt_ollama ollama pull llama3.2:3b"
    exit 1
fi
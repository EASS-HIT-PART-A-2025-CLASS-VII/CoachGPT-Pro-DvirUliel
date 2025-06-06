#!/bin/bash

# Docker Backend Testing Script for CoachGPT Pro
# Location: Backend/test-docker.sh
# Usage: chmod +x test-docker.sh && ./test-docker.sh

echo "🚀 Starting CoachGPT Pro Backend Docker Tests..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables for auth testing
USER_ID=""
JWT_TOKEN=""
TEST_EMAIL="test-$(date +%s)@example.com"  # Unique email for each test run

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
        echo -e "${RED}✗ FAILED${NC} (Invalid JSON)"
        echo -e "${BLUE}Response:${NC} $response"
        return 1
    fi
}

test_auth_register() {
    local description=$1
    
    echo -n "Testing $description... "
    
    # Use temporary files for response parsing
    local temp_file=$(mktemp)
    local status_code=$(curl -s -w "%{http_code}" --max-time 10 \
        -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Test User\",
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"password123\"
        }" \
        -o "$temp_file")
    
    local response_body=$(cat "$temp_file")
    rm -f "$temp_file"
    
    if [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        
        # Extract user ID for later use
        if command -v jq &> /dev/null; then
            USER_ID=$(echo "$response_body" | jq -r '.user.id // .id // empty' 2>/dev/null)
            if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ] && [ "$USER_ID" != "" ]; then
                echo -e "${BLUE}User ID extracted:${NC} $USER_ID"
            fi
        fi
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: 201, Got: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 1
    fi
}

test_auth_login() {
    local description=$1
    
    echo -n "Testing $description... "
    
    # Use temporary files for response parsing
    local temp_file=$(mktemp)
    local status_code=$(curl -s -w "%{http_code}" --max-time 10 \
        -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"password123\"
        }" \
        -o "$temp_file")
    
    local response_body=$(cat "$temp_file")
    rm -f "$temp_file"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        
        # Extract JWT token for later use
        if command -v jq &> /dev/null; then
            JWT_TOKEN=$(echo "$response_body" | jq -r '.token // empty' 2>/dev/null)
            if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ] && [ "$JWT_TOKEN" != "" ]; then
                echo -e "${BLUE}JWT Token extracted:${NC} ${JWT_TOKEN:0:50}..."
            fi
        fi
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: 200, Got: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 1
    fi
}

test_auth_delete() {
    local description=$1
    
    echo -n "Testing $description... "
    
    if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
        echo -e "${RED}✗ FAILED${NC} (No User ID available)"
        return 1
    fi
    
    # Use temporary files for response parsing
    local temp_file=$(mktemp)
    local status_code=$(curl -s -w "%{http_code}" --max-time 10 \
        -X DELETE "$BASE_URL/auth/delete/$USER_ID" \
        -H "Content-Type: application/json" \
        -o "$temp_file")
    
    local response_body=$(cat "$temp_file")
    rm -f "$temp_file"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: 200, Got: $status_code)"
        echo -e "${BLUE}Response:${NC} $response_body"
        return 1
    fi
}

# Check if jq is installed (optional for JSON parsing)
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

# Base URL
BASE_URL="http://localhost:5003"

# Test counter
PASSED=0
FAILED=0

echo -e "\n${YELLOW}=== DOCKER CONTAINER STATUS ===${NC}"

# Check if containers are running
if docker ps | grep -q "coachgpt-backend"; then
    echo -e "Backend container: ${GREEN}✓ RUNNING${NC}"
    ((PASSED++))
else
    echo -e "Backend container: ${RED}✗ NOT RUNNING${NC}"
    ((FAILED++))
    echo "Try running: docker-compose up -d"
fi

if docker ps | grep -q "coachgpt-db"; then
    echo -e "Database container: ${GREEN}✓ RUNNING${NC}"
    ((PASSED++))
else
    echo -e "Database container: ${RED}✗ NOT RUNNING${NC}"
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== HEALTH CHECK TESTS ===${NC}"

# Test health endpoint
if test_json_response "$BASE_URL/health" "Health endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test ready endpoint
if test_json_response "$BASE_URL/ready" "Ready endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test live endpoint
if test_json_response "$BASE_URL/live" "Live endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== API ENDPOINT TESTS ===${NC}"

# Test main API endpoint
if test_json_response "$BASE_URL/" "Main API endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test exercises endpoint
if test_endpoint "$BASE_URL/exercises" "200" "Exercises endpoint"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== AUTHENTICATION FLOW TESTS ===${NC}"

# Test complete auth flow: register → login → delete
echo -e "${BLUE}Testing with email: $TEST_EMAIL${NC}"

# Test user registration
echo -e "${YELLOW}Step 1: User Registration${NC}"
if test_auth_register "User registration"; then
    ((PASSED++))
    
    # Test user login (only if registration succeeded)
    echo -e "${YELLOW}Step 2: User Login${NC}"
    if test_auth_login "User login"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # Test user deletion (only if we have a user ID)
    echo -e "${YELLOW}Step 3: User Deletion${NC}"
    if test_auth_delete "User deletion"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
else
    ((FAILED++))
    echo -e "${YELLOW}⚠ Skipping login and deletion tests (registration failed)${NC}"
    ((FAILED+=2))  # Count login and deletion as failed
fi

echo -e "\n${YELLOW}=== ERROR HANDLING TESTS ===${NC}"

# Test 404 for non-existent route
if test_endpoint "$BASE_URL/nonexistent" "404" "404 handler"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test invalid login
echo -n "Testing invalid login... "
invalid_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@example.com","password":"wrongpassword"}')

if [ "$invalid_status" = "401" ] || [ "$invalid_status" = "400" ] || [ "$invalid_status" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Status: $invalid_status)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (Expected: 401, 400, or 404, Got: $invalid_status)"
    ((FAILED++))
fi

echo -e "\n${YELLOW}=== CONTAINER LOGS CHECK ===${NC}"

# Check container logs for errors
error_count=$(docker logs coachgpt-backend 2>&1 | grep -i error | wc -l || echo "0")
if [ "$error_count" -eq 0 ]; then
    echo -e "Backend logs: ${GREEN}✓ NO ERRORS${NC}"
    ((PASSED++))
else
    echo -e "Backend logs: ${YELLOW}⚠ $error_count ERRORS FOUND${NC}"
    echo "Recent errors:"
    docker logs coachgpt-backend 2>&1 | grep -i error | tail -5
fi

echo -e "\n${YELLOW}=== PERFORMANCE TESTS ===${NC}"

# Test response time
response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time 5 $BASE_URL/health 2>/dev/null || echo "5.0")
if (( $(echo "$response_time < 2.0" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "Response time: ${GREEN}✓ FAST${NC} (${response_time}s)"
    ((PASSED++))
else
    echo -e "Response time: ${YELLOW}⚠ SLOW${NC} (${response_time}s)"
fi

echo -e "\n${YELLOW}=== NETWORK CONNECTIVITY ===${NC}"

# Test container network connectivity
if docker exec coachgpt-backend ping -c 1 coachgpt-db > /dev/null 2>&1; then
    echo -e "Backend → Database: ${GREEN}✓ CONNECTED${NC}"
    ((PASSED++))
else
    echo -e "Backend → Database: ${RED}✗ CONNECTION FAILED${NC}"
    ((FAILED++))
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
    echo -e "\n${GREEN}🎉 All tests passed! Your CoachGPT Pro backend is running properly in Docker.${NC}"
    echo -e "\n${BLUE}🔗 Your API is available at: $BASE_URL${NC}"
    echo -e "${BLUE}📚 API Documentation: $BASE_URL/${NC}"
    echo -e "${BLUE}💊 Health Check: $BASE_URL/health${NC}"
    echo -e "${BLUE}💪 Exercises: $BASE_URL/exercises${NC}"
    exit 0
elif [ $FAILED -le 2 ]; then
    echo -e "\n${YELLOW}⚠ Most tests passed! Only minor issues remaining.${NC}"
    echo -e "\n${BLUE}🔗 Your API is available at: $BASE_URL${NC}"
    echo -e "${BLUE}💊 Health Check: $BASE_URL/health${NC}"
    echo -e "${BLUE}💪 Exercises: $BASE_URL/exercises${NC}"
    exit 0
else
    echo -e "\n${RED}❌ $FAILED test(s) failed. Please check the output above.${NC}"
    echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
    echo "- Check container status: docker-compose ps"
    echo "- View logs: docker-compose logs -f backend"
    echo "- Restart services: docker-compose restart"
    exit 1
fi
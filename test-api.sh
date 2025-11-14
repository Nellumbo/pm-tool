#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000"
FAILED=0
PASSED=0

echo "========================================="
echo "🧪 Тестирование PM Tool API"
echo "========================================="
echo ""

# Функция для тестирования endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected_status=$5
    local test_name=$6

    echo -n "Testing: $test_name... "

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" $headers)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data")
    fi

    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$status" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $status)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Тест 1: Login с валидными данными
echo -e "${YELLOW}=== Тесты аутентификации ===${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
    ((PASSED++))
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    ((FAILED++))
fi

# Тест 2: Получение проектов (требует аутентификацию)
echo ""
echo -e "${YELLOW}=== Тесты API endpoints ===${NC}"

if [ ! -z "$TOKEN" ]; then
    test_endpoint "GET" "/api/projects" "" "-H 'Authorization: Bearer $TOKEN'" "200" "GET /api/projects"
    test_endpoint "GET" "/api/tasks" "" "-H 'Authorization: Bearer $TOKEN'" "200" "GET /api/tasks"
    test_endpoint "GET" "/api/users" "" "-H 'Authorization: Bearer $TOKEN'" "200" "GET /api/users"
    test_endpoint "GET" "/api/stats" "" "-H 'Authorization: Bearer $TOKEN'" "200" "GET /api/stats"
fi

# Тест 3: Unauthorized access
test_endpoint "GET" "/api/projects" "" "" "401" "GET /api/projects (no auth)"

# Тест 4: Invalid login
test_endpoint "POST" "/api/auth/login" '{"email":"invalid@test.com","password":"wrong"}' "" "401" "POST /api/auth/login (invalid credentials)"

# Итоговый отчет
echo ""
echo "========================================="
echo "📊 Результаты тестирования"
echo "========================================="
echo -e "${GREEN}Пройдено: $PASSED${NC}"
echo -e "${RED}Провалено: $FAILED${NC}"
echo "========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Все тесты пройдены успешно!${NC}"
    exit 0
else
    echo -e "${RED}✗ Некоторые тесты провалились${NC}"
    exit 1
fi

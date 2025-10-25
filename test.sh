#!/bin/bash

# VenueGenie Integration Test Script

echo "🧪 VenueGenie Integration Tests"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected=$3
    
    echo -n "Testing: $test_name... "
    
    result=$(eval "$test_command" 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        FAILED=$((FAILED + 1))
    fi
}

# Start backend server
echo "Starting backend server..."
cd backend
node server.js > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 3

echo ""
echo "Running API Tests..."
echo "-------------------"

# Test 1: Health Check
run_test "API Health Check" \
    "curl -s http://localhost:5000/api/health" \
    "VenueGenie API is running"

# Test 2: Alert Status (No Active Alerts)
run_test "Alert Status (no alerts)" \
    "curl -s http://localhost:5000/api/alert-status" \
    "No active alerts"

# Test 3: Report Emergency
run_test "Report Emergency" \
    "curl -s -X POST http://localhost:5000/api/report -H 'Content-Type: application/json' -d '{\"type\":\"fire\",\"description\":\"Test alert\",\"location\":\"Test location\"}'" \
    "Emergency alert created successfully"

# Test 4: Alert Status (With Active Alert)
run_test "Alert Status (with alert)" \
    "curl -s http://localhost:5000/api/alert-status" \
    "FIRE: Test alert"

# Test 5: Approve Alert
run_test "Approve Alert" \
    "curl -s -X POST http://localhost:5000/api/approve-alert/1" \
    "Alert approved successfully"

# Test 6: Chat Endpoint
run_test "Chat Endpoint" \
    "curl -s -X POST http://localhost:5000/api/chat -H 'Content-Type: application/json' -d '{\"message\":\"Hello\",\"history\":[]}'" \
    "VenueGenie"

# Test 7: Get Venues Data
run_test "Venues Data" \
    "curl -s http://localhost:5000/data/venues.json" \
    "Grand Hall"

# Test 8: Get Timeline Data
run_test "Timeline Data" \
    "curl -s http://localhost:5000/data/timeline.json" \
    "ambiance"

echo ""
echo "File Structure Tests..."
echo "----------------------"

# Test 9: Check frontend components exist
run_test "ChatWindow component exists" \
    "test -f frontend/src/components/ChatWindow.js && echo 'exists'" \
    "exists"

run_test "DashboardPage component exists" \
    "test -f frontend/src/components/DashboardPage.js && echo 'exists'" \
    "exists"

run_test "ConfirmEmergency component exists" \
    "test -f frontend/src/components/ConfirmEmergency.js && echo 'exists'" \
    "exists"

run_test "Broadcast.html exists" \
    "test -f frontend/public/broadcast.html && echo 'exists'" \
    "exists"

# Test 10: Check data files
run_test "venues.json exists" \
    "test -f data/venues.json && echo 'exists'" \
    "exists"

run_test "timeline.json exists" \
    "test -f data/timeline.json && echo 'exists'" \
    "exists"

# Cleanup
echo ""
echo "Cleaning up..."
kill $BACKEND_PID 2>/dev/null

echo ""
echo "================================"
echo "Test Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

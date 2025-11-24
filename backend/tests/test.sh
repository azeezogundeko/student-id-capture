#!/bin/bash

# Test Script for Student Photo Capture API
# This script performs basic API tests using cURL

# Configuration
API_URL="${API_URL:-http://localhost:5000}"
TEST_CLASS="Test Class $(date +%s)"
TEST_STUDENT="Test Student"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Test 1: Health Check
test_health() {
    info "Testing health check endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

    if [ "$response" -eq 200 ]; then
        success "Health check passed (HTTP $response)"
        return 0
    else
        error "Health check failed (HTTP $response)"
        return 1
    fi
}

# Test 2: Create Class
test_create_class() {
    info "Testing class creation..."
    response=$(curl -s -X POST "$API_URL/api/classes" \
        -H "Content-Type: application/json" \
        -d "{\"className\":\"$TEST_CLASS\"}")

    if echo "$response" | grep -q "\"success\":true"; then
        success "Class created successfully"
        return 0
    else
        error "Class creation failed"
        echo "$response"
        return 1
    fi
}

# Test 3: List Classes
test_list_classes() {
    info "Testing list classes..."
    response=$(curl -s "$API_URL/api/classes")

    if echo "$response" | grep -q "\"success\":true"; then
        count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
        success "Classes listed successfully (found $count classes)"
        return 0
    else
        error "List classes failed"
        echo "$response"
        return 1
    fi
}

# Test 4: Upload Photo (requires a test image)
test_upload_photo() {
    info "Testing photo upload..."

    # Create a temporary test image
    TEST_IMAGE="/tmp/test_student_photo.jpg"
    # Create a 1x1 pixel JPEG
    echo -n "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==" | base64 -d > "$TEST_IMAGE"

    if [ ! -f "$TEST_IMAGE" ]; then
        warn "Test image creation failed, skipping upload test"
        return 2
    fi

    response=$(curl -s -X POST "$API_URL/api/upload" \
        -F "className=$TEST_CLASS" \
        -F "studentName=$TEST_STUDENT" \
        -F "photo=@$TEST_IMAGE")

    # Clean up
    rm -f "$TEST_IMAGE"

    if echo "$response" | grep -q "\"success\":true"; then
        success "Photo uploaded successfully"
        return 0
    else
        error "Photo upload failed"
        echo "$response"
        return 1
    fi
}

# Test 5: Get Students
test_get_students() {
    info "Testing get students..."
    response=$(curl -s "$API_URL/api/students/$(echo "$TEST_CLASS" | sed 's/ /%20/g')")

    if echo "$response" | grep -q "\"success\":true"; then
        count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
        success "Students retrieved successfully (found $count students)"
        return 0
    else
        error "Get students failed"
        echo "$response"
        return 1
    fi
}

# Main test runner
main() {
    echo ""
    echo -e "${BLUE}========================================"
    echo "Student Photo Capture API Test Suite"
    echo -e "========================================${NC}"
    echo ""
    info "API URL: $API_URL"
    echo ""

    passed=0
    failed=0

    # Run tests
    if test_health; then
        ((passed++))
    else
        ((failed++))
    fi
    echo ""

    if test_create_class; then
        ((passed++))
    else
        ((failed++))
    fi
    echo ""

    if test_list_classes; then
        ((passed++))
    else
        ((failed++))
    fi
    echo ""

    result=$(test_upload_photo)
    case $? in
        0) ((passed++)) ;;
        1) ((failed++)) ;;
        2) warn "Upload test skipped" ;;
    esac
    echo ""

    if test_get_students; then
        ((passed++))
    else
        ((failed++))
    fi
    echo ""

    # Summary
    echo ""
    echo -e "${BLUE}========================================"
    echo "Test Results"
    echo -e "========================================${NC}"
    echo "Total tests: $((passed + failed))"
    success "Passed: $passed"
    if [ $failed -gt 0 ]; then
        error "Failed: $failed"
    else
        echo "Failed: $failed"
    fi
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # Exit with appropriate code
    if [ $failed -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run tests
main

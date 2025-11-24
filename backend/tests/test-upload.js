#!/usr/bin/env node

/**
 * Test Script for Student Photo Capture API
 *
 * This script tests all API endpoints and S3 integration.
 *
 * Usage:
 *   node tests/test-upload.js
 *
 * Prerequisites:
 *   - Backend server must be running
 *   - Environment variables must be configured
 *   - Test image file must exist
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_CLASS = 'Test Class ' + Date.now();
const TEST_STUDENT = 'Test Student';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

function warn(message) {
  log(`⚠ ${message}`, colors.yellow);
}

// Create a test image
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-student.jpg');

  if (fs.existsSync(testImagePath)) {
    return testImagePath;
  }

  // Create a simple 1x1 pixel JPEG (base64 encoded)
  const base64Image = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';

  const buffer = Buffer.from(base64Image, 'base64');
  fs.writeFileSync(testImagePath, buffer);

  return testImagePath;
}

// Test 1: Health Check
async function testHealthCheck() {
  info('Testing health check endpoint...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'ok') {
      success('Health check passed');
      return true;
    }
    error('Health check failed: Invalid response');
    return false;
  } catch (err) {
    error(`Health check failed: ${err.message}`);
    return false;
  }
}

// Test 2: Create Class
async function testCreateClass() {
  info(`Testing class creation with name: ${TEST_CLASS}...`);
  try {
    const response = await axios.post(`${API_URL}/api/classes`, {
      className: TEST_CLASS,
    });

    if (response.data.success && response.data.class.className === TEST_CLASS) {
      success('Class created successfully');
      return true;
    }
    error('Class creation failed: Invalid response');
    return false;
  } catch (err) {
    error(`Class creation failed: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 3: List Classes
async function testListClasses() {
  info('Testing list classes...');
  try {
    const response = await axios.get(`${API_URL}/api/classes`);

    if (response.data.success && Array.isArray(response.data.classes)) {
      const foundClass = response.data.classes.find(c => c.className === TEST_CLASS);
      if (foundClass) {
        success(`Classes listed successfully (found ${response.data.count} classes)`);
        return true;
      }
      error('Test class not found in list');
      return false;
    }
    error('List classes failed: Invalid response');
    return false;
  } catch (err) {
    error(`List classes failed: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 4: Upload Photo
async function testUploadPhoto() {
  info('Testing photo upload...');

  const testImagePath = createTestImage();

  try {
    const form = new FormData();
    form.append('className', TEST_CLASS);
    form.append('studentName', TEST_STUDENT);
    form.append('photo', fs.createReadStream(testImagePath));

    const response = await axios.post(`${API_URL}/api/upload`, form, {
      headers: form.getHeaders(),
    });

    if (response.data.success && response.data.data.s3Key) {
      success(`Photo uploaded successfully: ${response.data.data.s3Key}`);
      return true;
    }
    error('Photo upload failed: Invalid response');
    return false;
  } catch (err) {
    error(`Photo upload failed: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 5: Get Students
async function testGetStudents() {
  info('Testing get students...');
  try {
    const response = await axios.get(`${API_URL}/api/students/${encodeURIComponent(TEST_CLASS)}`);

    if (response.data.success && Array.isArray(response.data.students)) {
      const foundStudent = response.data.students.find(s => s.studentName === TEST_STUDENT);
      if (foundStudent) {
        success(`Students retrieved successfully (found ${response.data.count} students)`);
        info(`Student photo URL: ${foundStudent.url}`);
        return true;
      }
      error('Test student not found in list');
      return false;
    }
    error('Get students failed: Invalid response');
    return false;
  } catch (err) {
    error(`Get students failed: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 6: Pre-signed URL
async function testPresignedUrl() {
  info('Testing pre-signed URL generation...');
  try {
    const response = await axios.post(`${API_URL}/api/upload/presigned`, {
      className: TEST_CLASS,
      studentName: 'Presigned Test Student',
    });

    if (response.data.success && response.data.data.uploadUrl) {
      success('Pre-signed URL generated successfully');
      info(`URL expires in: ${response.data.data.expiresIn} seconds`);
      return true;
    }
    error('Pre-signed URL generation failed: Invalid response');
    return false;
  } catch (err) {
    error(`Pre-signed URL generation failed: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 7: Input Validation
async function testValidation() {
  info('Testing input validation...');

  let passed = 0;
  let failed = 0;

  // Test invalid class name
  try {
    await axios.post(`${API_URL}/api/classes`, {
      className: '!!!@@@###',
    });
    warn('Validation test failed: Accepted invalid class name');
    failed++;
  } catch (err) {
    if (err.response?.status === 400) {
      success('Validation test passed: Rejected invalid class name');
      passed++;
    } else {
      warn('Validation test uncertain: Unexpected error');
      failed++;
    }
  }

  // Test missing class name
  try {
    await axios.post(`${API_URL}/api/classes`, {});
    warn('Validation test failed: Accepted missing class name');
    failed++;
  } catch (err) {
    if (err.response?.status === 400) {
      success('Validation test passed: Rejected missing class name');
      passed++;
    } else {
      warn('Validation test uncertain: Unexpected error');
      failed++;
    }
  }

  // Test invalid file upload
  try {
    const form = new FormData();
    form.append('className', TEST_CLASS);
    form.append('studentName', TEST_STUDENT);

    await axios.post(`${API_URL}/api/upload`, form, {
      headers: form.getHeaders(),
    });
    warn('Validation test failed: Accepted upload without file');
    failed++;
  } catch (err) {
    if (err.response?.status === 400) {
      success('Validation test passed: Rejected upload without file');
      passed++;
    } else {
      warn('Validation test uncertain: Unexpected error');
      failed++;
    }
  }

  return { passed, failed };
}

// Main test runner
async function runTests() {
  log('\n========================================', colors.blue);
  log('Student Photo Capture API Test Suite', colors.blue);
  log('========================================\n', colors.blue);

  info(`API URL: ${API_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
  };

  // Run tests
  if (await testHealthCheck()) results.passed++;
  else results.failed++;

  console.log('');

  if (await testCreateClass()) results.passed++;
  else results.failed++;

  console.log('');

  if (await testListClasses()) results.passed++;
  else results.failed++;

  console.log('');

  if (await testUploadPhoto()) results.passed++;
  else results.failed++;

  console.log('');

  if (await testGetStudents()) results.passed++;
  else results.failed++;

  console.log('');

  if (await testPresignedUrl()) results.passed++;
  else results.failed++;

  console.log('');

  const validationResults = await testValidation();
  results.passed += validationResults.passed;
  results.failed += validationResults.failed;

  // Summary
  console.log('\n');
  log('========================================', colors.blue);
  log('Test Results', colors.blue);
  log('========================================', colors.blue);
  log(`Total tests: ${results.passed + results.failed}`);
  success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    error(`Failed: ${results.failed}`);
  } else {
    log(`Failed: ${results.failed}`);
  }
  log('========================================\n', colors.blue);

  // Clean up test image
  const testImagePath = path.join(__dirname, 'test-student.jpg');
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});

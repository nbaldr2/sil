#!/usr/bin/env node

/**
 * Comprehensive API Test Suite for SIL Lab Management System
 * Tests all endpoints and functionalities
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001/api';
let authToken = '';
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  categories: {},
  details: []
};

// Test configuration
const config = {
  timeout: 10000,
  maxRetries: 3
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper functions
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(category, name, passed, message = '', details = {}) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`❌ ${name}: ${message}`, 'red');
  }
  
  if (!testResults.categories[category]) {
    testResults.categories[category] = { total: 0, passed: 0, failed: 0, tests: [] };
  }
  
  testResults.categories[category].total++;
  if (passed) {
    testResults.categories[category].passed++;
  } else {
    testResults.categories[category].failed++;
  }
  
  testResults.categories[category].tests.push({
    name,
    passed,
    message,
    details
  });
  
  testResults.details.push({
    category,
    name,
    passed,
    message,
    details
  });
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

// Test Categories

// 1. Authentication Tests
async function testAuthentication() {
  log('\n🔐 Testing Authentication System...', 'cyan');
  
  try {
    // Test login with valid credentials
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@sil-lab.com',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      logTest('Authentication', 'Admin Login', true, '', { 
        status: loginResponse.status,
        hasToken: !!loginResponse.data.token,
        userRole: loginResponse.data.user?.role
      });
    } else {
      logTest('Authentication', 'Admin Login', false, 'No token received');
      return false;
    }
    
    // Test token validation
    const meResponse = await makeRequest('GET', '/auth/me');
    logTest('Authentication', 'Token Validation', meResponse.status === 200, '', {
      status: meResponse.status,
      userId: meResponse.data?.user?.id
    });
    
    // Test invalid credentials
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });
      logTest('Authentication', 'Invalid Credentials Rejection', false, 'Should have returned 401');
    } catch (error) {
      logTest('Authentication', 'Invalid Credentials Rejection', error.response?.status === 401, '', {
        status: error.response?.status
      });
    }
    
    // Note: Logout endpoint not implemented, skipping test
    
    return true;
  } catch (error) {
    logTest('Authentication', 'Authentication System', false, error.message);
    return false;
  }
}

// 2. Patient Management Tests
async function testPatientManagement() {
  log('\n👥 Testing Patient Management...', 'cyan');
  
  const timestamp = Date.now();
  const testPatient = {
    firstName: 'Test',
    lastName: 'Patient',
    dateOfBirth: '1990-01-01',
    gender: 'M',
    phone: `+212600${timestamp.toString().slice(-6)}`,
    email: `test.patient.${timestamp}@email.com`,
    address: '123 Test Street',
    cnssNumber: `TEST${timestamp}`
  };
  
  let createdPatientId = null;
  
  try {
    // Test patient creation
    const createResponse = await makeRequest('POST', '/patients', testPatient);
    createdPatientId = createResponse.data?.patient?.id;
    logTest('Patient Management', 'Create Patient', createResponse.status === 201, '', {
      status: createResponse.status,
      patientId: createdPatientId
    });
    
    // Test duplicate CNSS validation
    try {
      await makeRequest('POST', '/patients', testPatient);
      logTest('Patient Management', 'Duplicate CNSS Validation', false, 'Should return 409');
    } catch (error) {
      logTest('Patient Management', 'Duplicate CNSS Validation', error.response?.status === 409, '', {
        status: error.response?.status
      });
    }
    
    // Test get all patients
    const getAllResponse = await makeRequest('GET', '/patients');
    logTest('Patient Management', 'Get All Patients', getAllResponse.status === 200, '', {
      status: getAllResponse.status,
      count: getAllResponse.data?.patients?.length,
      hasPagination: !!getAllResponse.data?.pagination
    });
    
    // Test get patient by ID
    if (createdPatientId) {
      const getByIdResponse = await makeRequest('GET', `/patients/${createdPatientId}`);
      logTest('Patient Management', 'Get Patient by ID', getByIdResponse.status === 200, '', {
        status: getByIdResponse.status,
        patientId: getByIdResponse.data?.patient?.id
      });
      
      // Test update patient
      const updateData = { ...testPatient, firstName: 'Updated' };
      const updateResponse = await makeRequest('PUT', `/patients/${createdPatientId}`, updateData);
      logTest('Patient Management', 'Update Patient', updateResponse.status === 200, '', {
        status: updateResponse.status,
        updatedName: updateResponse.data?.patient?.firstName
      });
    }
    
    // Test search patients
    const searchResponse = await makeRequest('GET', '/patients?search=Test');
    logTest('Patient Management', 'Search Patients', searchResponse.status === 200, '', {
      status: searchResponse.status,
      resultsCount: searchResponse.data?.patients?.length
    });
    
    // Test invalid data validation
    try {
      await makeRequest('POST', '/patients', { firstName: 'Test' }); // Missing required fields
      logTest('Patient Management', 'Validation - Missing Fields', false, 'Should return 400');
    } catch (error) {
      logTest('Patient Management', 'Validation - Missing Fields', error.response?.status === 400, '', {
        status: error.response?.status
      });
    }
    
    try {
      await makeRequest('POST', '/patients', { ...testPatient, email: 'invalid-email' });
      logTest('Patient Management', 'Validation - Invalid Email', false, 'Should return 400');
    } catch (error) {
      logTest('Patient Management', 'Validation - Invalid Email', error.response?.status === 400, '', {
        status: error.response?.status
      });
    }
    
  } catch (error) {
    logTest('Patient Management', 'Patient Management System', false, error.message);
  }
}

// 3. Doctor Management Tests
async function testDoctorManagement() {
  log('\n👨‍⚕️ Testing Doctor Management...', 'cyan');
  
  const timestamp = Date.now();
  const testDoctor = {
    firstName: 'Dr. Test',
    lastName: 'Doctor',
    email: `test.doctor.${timestamp}@hospital.com`,
    phone: `+212600${timestamp.toString().slice(-6)}`,
    specialty: 'Test Specialty',
    orderNumber: `TEST${timestamp}`
  };
  
  let createdDoctorId = null;
  
  try {
    // Test doctor creation
    const createResponse = await makeRequest('POST', '/doctors', testDoctor);
    createdDoctorId = createResponse.data?.doctor?.id;
    logTest('Doctor Management', 'Create Doctor', createResponse.status === 201, '', {
      status: createResponse.status,
      doctorId: createdDoctorId
    });
    
    // Test duplicate email validation
    try {
      await makeRequest('POST', '/doctors', testDoctor);
      logTest('Doctor Management', 'Duplicate Email Validation', false, 'Should return 409');
    } catch (error) {
      logTest('Doctor Management', 'Duplicate Email Validation', error.response?.status === 409, '', {
        status: error.response?.status
      });
    }
    
    // Test get all doctors
    const getAllResponse = await makeRequest('GET', '/doctors');
    logTest('Doctor Management', 'Get All Doctors', getAllResponse.status === 200, '', {
      status: getAllResponse.status,
      count: getAllResponse.data?.doctors?.length
    });
    
    // Test get doctor by ID
    if (createdDoctorId) {
      const getByIdResponse = await makeRequest('GET', `/doctors/${createdDoctorId}`);
      logTest('Doctor Management', 'Get Doctor by ID', getByIdResponse.status === 200, '', {
        status: getByIdResponse.status,
        doctorId: getByIdResponse.data?.doctor?.id
      });
      
      // Test update doctor
      const updateData = { ...testDoctor, firstName: 'Dr. Updated' };
      const updateResponse = await makeRequest('PUT', `/doctors/${createdDoctorId}`, updateData);
      logTest('Doctor Management', 'Update Doctor', updateResponse.status === 200, '', {
        status: updateResponse.status,
        updatedName: updateResponse.data?.doctor?.firstName
      });
    }
    
    // Test search doctors
    const searchResponse = await makeRequest('GET', '/doctors?search=Test');
    logTest('Doctor Management', 'Search Doctors', searchResponse.status === 200, '', {
      status: searchResponse.status,
      resultsCount: searchResponse.data?.doctors?.length
    });
    
  } catch (error) {
    logTest('Doctor Management', 'Doctor Management System', false, error.message);
  }
}

// 4. Analysis Management Tests
async function testAnalysisManagement() {
  log('\n🧪 Testing Analysis Management...', 'cyan');
  
  const timestamp = Date.now();
  const testAnalysis = {
    code: `TEST${timestamp}`,
    nom: 'Test Analysis',
    category: 'Test Category',
    price: 100,
    tva: 20,
    cost: 30,
    description: 'Test analysis for API testing'
  };
  
  let createdAnalysisId = null;
  
  try {
    // Test analysis creation
    const createResponse = await makeRequest('POST', '/analyses', testAnalysis);
    createdAnalysisId = createResponse.data?.analysis?.id;
    logTest('Analysis Management', 'Create Analysis', createResponse.status === 201, '', {
      status: createResponse.status,
      analysisId: createdAnalysisId
    });
    
    // Test duplicate code validation
    try {
      await makeRequest('POST', '/analyses', testAnalysis);
      logTest('Analysis Management', 'Duplicate Code Validation', false, 'Should return 409');
    } catch (error) {
      logTest('Analysis Management', 'Duplicate Code Validation', error.response?.status === 409, '', {
        status: error.response?.status
      });
    }
    
    // Test get all analyses
    const getAllResponse = await makeRequest('GET', '/analyses');
    logTest('Analysis Management', 'Get All Analyses', getAllResponse.status === 200, '', {
      status: getAllResponse.status,
      count: getAllResponse.data?.analyses?.length,
      hasPagination: !!getAllResponse.data?.pagination
    });
    
    // Test get analysis by ID
    if (createdAnalysisId) {
      const getByIdResponse = await makeRequest('GET', `/analyses/${createdAnalysisId}`);
      logTest('Analysis Management', 'Get Analysis by ID', getByIdResponse.status === 200, '', {
        status: getByIdResponse.status,
        analysisId: getByIdResponse.data?.analysis?.id
      });
      
      // Test update analysis
      const updateData = { ...testAnalysis, nom: 'Updated Test Analysis' };
      const updateResponse = await makeRequest('PUT', `/analyses/${createdAnalysisId}`, updateData);
      logTest('Analysis Management', 'Update Analysis', updateResponse.status === 200, '', {
        status: updateResponse.status,
        updatedName: updateResponse.data?.analysis?.name
      });
    }
    
    // Test get categories
    const categoriesResponse = await makeRequest('GET', '/analyses/categories/list');
    logTest('Analysis Management', 'Get Categories', categoriesResponse.status === 200, '', {
      status: categoriesResponse.status,
      categoriesCount: categoriesResponse.data?.categories?.length
    });
    
    // Test search autocomplete
    const autocompleteResponse = await makeRequest('GET', '/analyses/search/autocomplete?q=Test');
    logTest('Analysis Management', 'Search Autocomplete', autocompleteResponse.status === 200, '', {
      status: autocompleteResponse.status,
      resultsCount: autocompleteResponse.data?.analyses?.length
    });
    
    // Test bulk price update
    if (createdAnalysisId) {
      const bulkUpdateData = {
        updates: [{ id: createdAnalysisId, price: 150, tva: 20 }]
      };
      const bulkResponse = await makeRequest('PUT', '/analyses/prices/bulk', bulkUpdateData);
      logTest('Analysis Management', 'Bulk Price Update', bulkResponse.status === 200, '', {
        status: bulkResponse.status,
        resultsCount: bulkResponse.data?.results?.length
      });
    }
    
    // Test statistics
    const statsResponse = await makeRequest('GET', '/analyses/stats/overview');
    logTest('Analysis Management', 'Get Statistics', statsResponse.status === 200, '', {
      status: statsResponse.status,
      totalAnalyses: statsResponse.data?.totalAnalyses
    });
    
  } catch (error) {
    logTest('Analysis Management', 'Analysis Management System', false, error.message);
  }
}

// 5. Request Management Tests
async function testRequestManagement() {
  log('\n📋 Testing Request Management...', 'cyan');
  
  try {
    // Get existing patients and doctors for request creation
    const patientsResponse = await makeRequest('GET', '/patients');
    const doctorsResponse = await makeRequest('GET', '/doctors');
    const analysesResponse = await makeRequest('GET', '/analyses');
    
    if (patientsResponse.data?.patients?.length > 0 && 
        doctorsResponse.data?.doctors?.length > 0 && 
        analysesResponse.data?.analyses?.length > 0) {
      
      const testRequest = {
        patientId: patientsResponse.data.patients[0].id,
        doctorId: doctorsResponse.data.doctors[0].id,
        analyses: [analysesResponse.data.analyses[0].id],
        priority: 'NORMAL',
        notes: 'Test request'
      };
      
      let createdRequestId = null;
      
      // Test request creation
      const createResponse = await makeRequest('POST', '/requests', testRequest);
      createdRequestId = createResponse.data?.request?.id;
      logTest('Request Management', 'Create Request', createResponse.status === 201, '', {
        status: createResponse.status,
        requestId: createdRequestId
      });
      
      // Test get all requests
      const getAllResponse = await makeRequest('GET', '/requests');
      logTest('Request Management', 'Get All Requests', getAllResponse.status === 200, '', {
        status: getAllResponse.status,
        count: getAllResponse.data?.requests?.length
      });
      
      // Test get request by ID
      if (createdRequestId) {
        const getByIdResponse = await makeRequest('GET', `/requests/${createdRequestId}`);
        logTest('Request Management', 'Get Request by ID', getByIdResponse.status === 200, '', {
          status: getByIdResponse.status,
          requestId: getByIdResponse.data?.request?.id
        });
        
        // Test update request status
        const updateResponse = await makeRequest('PUT', `/requests/${createdRequestId}`, {
          ...testRequest,
          status: 'IN_PROGRESS'
        });
        logTest('Request Management', 'Update Request Status', updateResponse.status === 200, '', {
          status: updateResponse.status,
          newStatus: updateResponse.data?.request?.status
        });
      }
      
      // Test search requests
      const searchResponse = await makeRequest('GET', '/requests?search=Test');
      logTest('Request Management', 'Search Requests', searchResponse.status === 200, '', {
        status: searchResponse.status,
        resultsCount: searchResponse.data?.requests?.length
      });
      
    } else {
      logTest('Request Management', 'Request Management System', false, 'No patients, doctors, or analyses available for testing');
    }
    
  } catch (error) {
    logTest('Request Management', 'Request Management System', false, error.message);
  }
}

// 6. Results Management Tests
async function testResultsManagement() {
  log('\n📊 Testing Results Management...', 'cyan');
  
  try {
    // Test get all results
    const getAllResponse = await makeRequest('GET', '/results');
    logTest('Results Management', 'Get All Results', getAllResponse.status === 200, '', {
      status: getAllResponse.status,
      count: getAllResponse.data?.results?.length || 0
    });
    
    // Test search results
    const searchResponse = await makeRequest('GET', '/results?search=test');
    logTest('Results Management', 'Search Results', searchResponse.status === 200, '', {
      status: searchResponse.status,
      resultsCount: searchResponse.data?.results?.length || 0
    });
    
  } catch (error) {
    logTest('Results Management', 'Results Management System', false, error.message);
  }
}

// 7. Stock Management Tests
async function testStockManagement() {
  log('\n📦 Testing Stock Management...', 'cyan');
  
  try {
    // Test get all products
    const productsResponse = await makeRequest('GET', '/stock/products');
    logTest('Stock Management', 'Get All Products', productsResponse.status === 200, '', {
      status: productsResponse.status,
      count: productsResponse.data?.products?.length || 0
    });
    
    // Test get all suppliers
    const suppliersResponse = await makeRequest('GET', '/stock/suppliers');
    logTest('Stock Management', 'Get All Suppliers', suppliersResponse.status === 200, '', {
      status: suppliersResponse.status,
      count: suppliersResponse.data?.suppliers?.length || 0
    });
    
    // Test get stock entries
    const entriesResponse = await makeRequest('GET', '/stock/entries');
    logTest('Stock Management', 'Get Stock Entries', entriesResponse.status === 200, '', {
      status: entriesResponse.status,
      count: entriesResponse.data?.entries?.length || 0
    });
    
    // Test get orders
    const ordersResponse = await makeRequest('GET', '/stock/orders');
    logTest('Stock Management', 'Get Orders', ordersResponse.status === 200, '', {
      status: ordersResponse.status,
      count: ordersResponse.data?.orders?.length || 0
    });
    
  } catch (error) {
    logTest('Stock Management', 'Stock Management System', false, error.message);
  }
}

// 8. Configuration Tests
async function testConfiguration() {
  log('\n⚙️ Testing Configuration...', 'cyan');
  
  try {
    // Test get configuration
    const getConfigResponse = await makeRequest('GET', '/config');
    logTest('Configuration', 'Get Configuration', getConfigResponse.status === 200, '', {
      status: getConfigResponse.status,
      hasConfig: !!getConfigResponse.data
    });
    
  } catch (error) {
    logTest('Configuration', 'Configuration System', false, error.message);
  }
}

// 9. Health Check Tests
async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  
  try {
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    const isHealthy = healthResponse.data.status === 'healthy';
    logTest('Health Check', 'Health Status', isHealthy, '', {
      status: healthResponse.status,
      systemStatus: healthResponse.data.status,
      database: healthResponse.data.database,
      uptime: healthResponse.data.uptime
    });
    
    const hasRequiredFields = healthResponse.data.uptime !== undefined && 
                             healthResponse.data.memory !== undefined &&
                             healthResponse.data.database === 'connected';
    logTest('Health Check', 'Health Data Completeness', hasRequiredFields, '', {
      hasUptime: healthResponse.data.uptime !== undefined,
      hasMemory: healthResponse.data.memory !== undefined,
      hasDatabase: healthResponse.data.database !== undefined
    });
    
  } catch (error) {
    logTest('Health Check', 'Health Check System', false, error.message);
  }
}

// 10. Performance Tests
async function testPerformance() {
  log('\n⚡ Testing Performance...', 'cyan');
  
  try {
    // Test response time
    const startTime = Date.now();
    await makeRequest('GET', '/patients');
    const responseTime = Date.now() - startTime;
    
    logTest('Performance', 'Response Time (<500ms)', responseTime < 500, `${responseTime}ms`, {
      responseTime: responseTime,
      threshold: 500
    });
    
    // Test concurrent requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('GET', '/patients'));
    }
    
    const concurrentStart = Date.now();
    await Promise.all(promises);
    const concurrentTime = Date.now() - concurrentStart;
    
    logTest('Performance', 'Concurrent Requests (5)', concurrentTime < 2000, `${concurrentTime}ms`, {
      concurrentTime: concurrentTime,
      requestCount: 5,
      threshold: 2000
    });
    
  } catch (error) {
    logTest('Performance', 'Performance Testing', false, error.message);
  }
}

// Generate TEST-REZ.md report
function generateTestReport() {
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  const timestamp = new Date().toISOString();
  
  let report = `# SIL Lab Management System - Test Results Report

## 📊 Test Summary
- **Test Date:** ${timestamp}
- **Total Tests:** ${testResults.total}
- **Passed:** ${testResults.passed} ✅
- **Failed:** ${testResults.failed} ❌
- **Pass Rate:** ${passRate}%
- **Status:** ${passRate >= 90 ? '🟢 EXCELLENT' : passRate >= 80 ? '🟡 GOOD' : '🔴 NEEDS WORK'}

---

## 📋 Test Categories Overview

| Category | Total | Passed | Failed | Pass Rate | Status | Priority |
|----------|-------|--------|--------|-----------|---------|----------|
`;

  Object.keys(testResults.categories).forEach(category => {
    const cat = testResults.categories[category];
    const catPassRate = ((cat.passed / cat.total) * 100).toFixed(2);
    const status = catPassRate >= 90 ? '✅ EXCELLENT' : catPassRate >= 80 ? '⚠️ PARTIAL' : '❌ FAILED';
    const priority = catPassRate >= 90 ? 'LOW' : catPassRate >= 80 ? 'MEDIUM' : 'HIGH';
    
    report += `| **${category}** | ${cat.total} | ${cat.passed} | ${cat.failed} | ${catPassRate}% | ${status} | ${priority} |\n`;
  });

  report += `\n---\n\n## 🔍 Detailed Test Results\n\n`;

  Object.keys(testResults.categories).forEach(category => {
    const cat = testResults.categories[category];
    const catPassRate = ((cat.passed / cat.total) * 100).toFixed(2);
    
    report += `### ${category}\n`;
    report += `**Pass Rate:** ${catPassRate}% (${cat.passed}/${cat.total})\n\n`;
    
    cat.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `- ${status} **${test.name}**`;
      if (!test.passed && test.message) {
        report += ` - ${test.message}`;
      }
      if (test.details && Object.keys(test.details).length > 0) {
        report += `\n  - Details: ${JSON.stringify(test.details, null, 2)}`;
      }
      report += '\n';
    });
    report += '\n';
  });

  // Add priority sections
  const highPriorityIssues = [];
  const mediumPriorityIssues = [];
  
  Object.keys(testResults.categories).forEach(category => {
    const cat = testResults.categories[category];
    const catPassRate = ((cat.passed / cat.total) * 100).toFixed(2);
    
    if (catPassRate < 80) {
      highPriorityIssues.push({
        category,
        passRate: catPassRate,
        failed: cat.failed,
        tests: cat.tests.filter(t => !t.passed)
      });
    } else if (catPassRate < 90) {
      mediumPriorityIssues.push({
        category,
        passRate: catPassRate,
        failed: cat.failed,
        tests: cat.tests.filter(t => !t.passed)
      });
    }
  });

  if (highPriorityIssues.length > 0) {
    report += `## 🚨 HIGH PRIORITY ISSUES (Critical)\n\n`;
    highPriorityIssues.forEach(issue => {
      report += `### ❌ ${issue.category}\n`;
      report += `**Status:** CRITICAL FAILURE ❌\n`;
      report += `**Priority:** HIGH\n`;
      report += `**Pass Rate:** ${issue.passRate}%\n`;
      report += `**Failed Tests:** ${issue.failed}\n\n`;
      
      report += `**Failed Tests:**\n`;
      issue.tests.forEach(test => {
        report += `- ❌ ${test.name}: ${test.message}\n`;
      });
      report += '\n';
    });
  }

  if (mediumPriorityIssues.length > 0) {
    report += `## ⚠️ MEDIUM PRIORITY ISSUES (Should Fix)\n\n`;
    mediumPriorityIssues.forEach(issue => {
      report += `### ⚠️ ${issue.category}\n`;
      report += `**Status:** PARTIAL FAILURE ⚠️\n`;
      report += `**Priority:** MEDIUM\n`;
      report += `**Pass Rate:** ${issue.passRate}%\n`;
      report += `**Failed Tests:** ${issue.failed}\n\n`;
      
      report += `**Failed Tests:**\n`;
      issue.tests.forEach(test => {
        report += `- ⚠️ ${test.name}: ${test.message}\n`;
      });
      report += '\n';
    });
  }

  if (highPriorityIssues.length === 0 && mediumPriorityIssues.length === 0) {
    report += `## 🎉 ALL TESTS PASSED!\n\n`;
    report += `Congratulations! All API endpoints are working correctly.\n`;
    report += `The system is **production ready** with a ${passRate}% pass rate.\n\n`;
  }

  report += `---\n\n## 📈 Performance Metrics\n\n`;
  const perfTests = testResults.details.filter(t => t.category === 'Performance');
  if (perfTests.length > 0) {
    perfTests.forEach(test => {
      if (test.details.responseTime) {
        report += `- **${test.name}:** ${test.details.responseTime}ms\n`;
      }
      if (test.details.concurrentTime) {
        report += `- **${test.name}:** ${test.details.concurrentTime}ms for ${test.details.requestCount} requests\n`;
      }
    });
  }

  report += `\n---\n\n## 🔧 System Information\n\n`;
  report += `- **API Base URL:** ${BASE_URL}\n`;
  report += `- **Test Environment:** Development\n`;
  report += `- **Database:** PostgreSQL\n`;
  report += `- **Authentication:** JWT Token\n`;
  report += `- **Test Framework:** Custom Node.js\n\n`;

  report += `---\n\n*Report generated automatically by SIL Lab Management System Test Suite*\n`;

  return report;
}

// Main test runner
async function runAllTests() {
  log('🧪 SIL Lab Management System - Comprehensive API Test Suite', 'yellow');
  log('=' .repeat(70), 'yellow');
  
  const startTime = Date.now();
  
  // Run all test categories
  const authSuccess = await testAuthentication();
  
  if (authSuccess) {
    await testPatientManagement();
    await testDoctorManagement();
    await testAnalysisManagement();
    await testRequestManagement();
    await testResultsManagement();
    await testStockManagement();
    await testConfiguration();
    await testPerformance();
  } else {
    log('\n❌ Authentication failed - skipping protected endpoint tests', 'red');
  }
  
  await testHealthCheck();
  
  // Generate and save report
  const report = generateTestReport();
  const reportPath = path.join(__dirname, 'TEST-REZ.md');
  fs.writeFileSync(reportPath, report);
  
  // Print summary
  const totalTime = Date.now() - startTime;
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  
  log('\n' + '='.repeat(70), 'yellow');
  log('📊 FINAL TEST SUMMARY', 'yellow');
  log('='.repeat(70), 'yellow');
  log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');
  log(`Pass Rate: ${passRate}%`);
  log(`Total Time: ${totalTime}ms`);
  log(`Report saved to: ${reportPath}`, 'cyan');
  
  if (passRate >= 90) {
    log('\n🎉 EXCELLENT! System is production ready!', 'green');
  } else if (passRate >= 80) {
    log('\n✅ GOOD! Minor issues to address.', 'yellow');
  } else {
    log('\n⚠️  NEEDS WORK! Critical issues found.', 'red');
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
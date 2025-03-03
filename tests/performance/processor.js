/**
 * Artillery processor functions for API load testing
 */

// Generate a random string of specified length
function randomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
}

// Generate a random date within the last 30 days
function randomRecentDate() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Generate random test steps (between 2-5 steps)
function randomTestSteps() {
  const numSteps = Math.floor(Math.random() * 4) + 2; // 2-5 steps
  let steps = '';
  
  for (let i = 1; i <= numSteps; i++) {
    steps += `Step ${i}: ${['Navigate to', 'Click on', 'Enter data in', 'Verify', 'Submit'][Math.floor(Math.random() * 5)]} ${randomString(8)}\n`;
  }
  
  return steps.trim();
}

// Generate random expected result
function randomExpectedResult() {
  const results = [
    'The form should be submitted successfully',
    'An error message should be displayed',
    'The user should be redirected to the dashboard',
    'The data should be saved to the database',
    'A confirmation dialog should appear'
  ];
  
  return results[Math.floor(Math.random() * results.length)];
}

// Generate random priority
function randomPriority() {
  return ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
}

// Generate random status
function randomStatus() {
  return ['draft', 'active', 'deprecated', 'archived'][Math.floor(Math.random() * 4)];
}

// Generate random test result
function randomTestResult() {
  return ['passed', 'failed', 'skipped', 'blocked'][Math.floor(Math.random() * 4)];
}

// Before scenario hook
function beforeScenario(context, events, done) {
  // Set up context variables that will be used across requests
  context.vars.randomProjectName = `Project ${randomString(8)}`;
  context.vars.randomTestCaseName = `Test Case ${randomString(8)}`;
  context.vars.randomTestRunName = `Test Run ${randomString(8)}`;
  context.vars.testSteps = randomTestSteps();
  context.vars.expectedResult = randomExpectedResult();
  context.vars.priority = randomPriority();
  context.vars.status = randomStatus();
  
  // Log the start of the scenario
  console.log(`Starting scenario: ${context.scenario.name}`);
  
  return done();
}

// After response hook
function afterResponse(requestParams, response, context, events, done) {
  // Log response times for monitoring
  const duration = response.timings.phases.total;
  const url = requestParams.url;
  const method = requestParams.method;
  const status = response.statusCode;
  
  console.log(`${method} ${url} - Status: ${status}, Duration: ${duration}ms`);
  
  // Check for slow responses (over 1000ms)
  if (duration > 1000) {
    console.warn(`SLOW RESPONSE: ${method} ${url} took ${duration}ms`);
  }
  
  // Check for error responses
  if (status >= 400) {
    console.error(`ERROR RESPONSE: ${method} ${url} returned ${status}`);
    if (response.body) {
      try {
        const body = JSON.parse(response.body);
        console.error(`Error details: ${JSON.stringify(body)}`);
      } catch (e) {
        console.error(`Response body: ${response.body}`);
      }
    }
  }
  
  return done();
}

module.exports = {
  randomString,
  randomRecentDate,
  randomTestSteps,
  randomExpectedResult,
  randomPriority,
  randomStatus,
  randomTestResult,
  beforeScenario,
  afterResponse
}; 
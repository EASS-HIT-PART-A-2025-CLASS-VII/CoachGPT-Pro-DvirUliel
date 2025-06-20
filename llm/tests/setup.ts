// Clear any intervals or timers after tests
afterAll(() => {
  // Clear all timers
  jest.clearAllTimers();
  
  // If using real timers, clear intervals
  if (typeof setInterval !== 'undefined') {
    // @ts-ignore
    const intervals = global._intervals || [];
    intervals.forEach((interval: any) => clearInterval(interval));
  }
});

// Increase timeout for all tests
jest.setTimeout(10000);
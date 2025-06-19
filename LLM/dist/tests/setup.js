"use strict";
afterAll(() => {
    jest.clearAllTimers();
    if (typeof setInterval !== 'undefined') {
        const intervals = global._intervals || [];
        intervals.forEach((interval) => clearInterval(interval));
    }
});
jest.setTimeout(10000);
//# sourceMappingURL=setup.js.map
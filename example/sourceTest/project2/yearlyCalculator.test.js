const calculator = require('./yearlyCalculator')

test('calculate your age', () => {
    expect(calculator.calcAge(1990)).toBe(33);
});

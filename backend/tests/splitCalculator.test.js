// tests/splitCalculator.test.js
const calculateSplit = require('../utils/splitCalculator');

test('membagi tagihan 100000 untuk 4 orang harus menghasilkan 25000', () => {
    expect(calculateSplit(100000, 4)).toBe(25000);
});

test('membagi tagihan jika anggota 0 harus menghasilkan 0', () => {
    expect(calculateSplit(100000, 0)).toBe(0);
});
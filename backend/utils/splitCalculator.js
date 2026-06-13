// utils/splitCalculator.js
function calculateSplit(totalBill, totalMembers) {
    if (totalMembers === 0) return 0;
    return totalBill / totalMembers;
}
module.exports = calculateSplit;

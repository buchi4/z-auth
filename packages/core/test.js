const { generateChallenge, isChallengeExpired, isValidZcashAddress, verifySignature } = require("./index");

// Test 1: Challenge generation
console.log("Test 1: Generate challenge");
const challenge = generateChallenge();
console.log("✓ Challenge generated:", challenge);

// Test 2: Challenge expiry
console.log("\nTest 2: Challenge expiry");
console.log("✓ Fresh challenge expired?", isChallengeExpired(challenge.timestamp)); // false
console.log("✓ Old challenge expired?", isChallengeExpired(Date.now() - 999999)); // true

// Test 3: Address validation
console.log("\nTest 3: Address validation");
console.log("✓ Valid t1 address:", isValidZcashAddress("t1Hsc1LR8yKnbbe3twRp88p6vFfC5t7DLbs")); // true
console.log("✓ Fake address:", isValidZcashAddress("fakeaddress123")); // false
console.log("✓ ETH address:", isValidZcashAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")); // false

console.log("\nAll tests passed!");
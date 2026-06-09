const { ECPairFactory } = require("ecpair");
const ecc = require("tiny-secp256k1");
const crypto = require("crypto");
const bs58check = require("bs58check");
const bitcoinMessage = require("bitcoinjs-message");
const { verifySignature } = require("./packages/core/index");

const ECPair = ECPairFactory(ecc);
const keyPair = ECPair.makeRandom();

// Build Zcash mainnet t1 address
const pubKeyHash = crypto
  .createHash("ripemd160")
  .update(crypto.createHash("sha256").update(keyPair.publicKey).digest())
  .digest();

const payload = Buffer.concat([Buffer.from([0x1c, 0xb8]), pubKeyHash]);
const address = bs58check.encode(payload);

// Generate challenge message same way core package does
const nonce = crypto.randomBytes(32).toString("hex");
const timestamp = Date.now();
const message = `Sign in with Zcash\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

// Sign
const signature = bitcoinMessage
  .sign(message, Buffer.from(keyPair.privateKey), keyPair.compressed)
  .toString("base64");

// Verify using our core package
const result = verifySignature({ address, message, signature });

console.log("=== z-auth Test ===");
console.log("Address:", address);
console.log("Message:", message);
console.log("Signature:", signature);
console.log("Verification:", result);
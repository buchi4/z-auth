const { ECPairFactory } = require("ecpair");
const ecc = require("tiny-secp256k1");
const crypto = require("crypto");
const bs58check = require("bs58check");
const bitcoinMessage = require("bitcoinjs-message");

const ECPair = ECPairFactory(ecc);
const keyPair = ECPair.makeRandom();

// Build Zcash mainnet t1 address
const pubKeyHash = crypto
  .createHash("ripemd160")
  .update(crypto.createHash("sha256").update(keyPair.publicKey).digest())
  .digest();

const payload = Buffer.concat([Buffer.from([0x1c, 0xb8]), pubKeyHash]);
const address = bs58check.encode(payload);

// Generate challenge
const nonce = crypto.randomBytes(32).toString("hex");
const timestamp = Date.now();
const message = `Sign in with Zcash\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

// Sign
const signature = bitcoinMessage
  .sign(message, Buffer.from(keyPair.privateKey), keyPair.compressed)
  .toString("base64");

// Seed the backend
async function seedAndPrint() {
  try {
    const res = await fetch("http://localhost:3001/zauth/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, timestamp }),
    });

    const data = await res.json();

    if (data.seeded) {
      console.log("\n✅ Challenge seeded successfully!\n");
      console.log("╔══════════════════════════════════════════╗");
      console.log("║         z-auth DEMO CREDENTIALS          ║");
      console.log("╚══════════════════════════════════════════╝");
      console.log("\n📬 ADDRESS (paste in browser):");
      console.log(address);
      console.log("\n✍️  SIGNATURE (paste in browser after getting challenge):");
      console.log(signature);
      console.log("\n⏰ Valid for 1 hour. Run this script again if it expires.");
      console.log("\n🚀 Steps:");
      console.log("   1. Open http://localhost:3000");
      console.log("   2. Paste the ADDRESS above");
      console.log("   3. Click 'Get Challenge'");
      console.log("   4. Paste the SIGNATURE above");
      console.log("   5. Click 'Verify & Sign In'");
      console.log("   6. 🎉 Authenticated!\n");
    } else {
      console.log("❌ Failed to seed challenge. Is the backend running?");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.log("Make sure the backend is running: node packages/server/test-server.js");
  }
}

seedAndPrint();
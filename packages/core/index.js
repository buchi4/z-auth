const crypto = require("crypto");
const bitcoinMessage = require("bitcoinjs-message");
const bs58check = require("bs58check");

// Zcash mainnet t-address prefixes
const ZCASH_MAINNET_PREFIXES = {
  P2PKH: Buffer.from([0x1c, 0xb8]), // t1...
  P2SH: Buffer.from([0x1c, 0xbd]),  // t3...
};

/**
 * Generate a unique challenge for the user to sign
 */
function generateChallenge() {
  const nonce = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now();
  return {
    nonce,
    timestamp,
    message: `Sign in with Zcash\nNonce: ${nonce}\nTimestamp: ${timestamp}`,
  };
}

/**
 * Check if a challenge is expired (5 min window)
 */
function isChallengeExpired(timestamp, windowMs = 5 * 60 * 1000) {
  return Date.now() - timestamp > windowMs;
}

/**
 * Validate that an address is a valid Zcash mainnet t-address
 */
function isValidZcashAddress(address) {
  try {
    const decoded = bs58check.decode(address);
    
    // decoded may be a Uint8Array in newer bs58check versions
    const bytes = Buffer.from(decoded);
    const prefix = bytes.slice(0, 2);

    const p2pkh = Buffer.from([0x1c, 0xb8]);
    const p2sh = Buffer.from([0x1c, 0xbd]);

    return prefix.equals(p2pkh) || prefix.equals(p2sh);
  } catch (e) {
    return false;
  }
}

/**
 * Verify a signed challenge from a Zcash t-address
 */
function verifySignature({ address, message, signature }) {
  try {
    if (!isValidZcashAddress(address)) {
      return { valid: false, reason: "Invalid Zcash mainnet address" };
    }

    // Decode address to get the public key hash (skip 2-byte Zcash prefix)
    const decoded = bs58check.decode(address);
    const addressPubKeyHash = Buffer.from(decoded).slice(2);

    // Recover public key from signature
    const sigBuffer = Buffer.from(signature, "base64");
    const flagByte = sigBuffer[0] - 27;
    const compressed = !!(flagByte & 4);

    const messageHash = bitcoinMessage.magicHash(message);

    const secp256k1 = require("tiny-secp256k1");
    const recoveryId = flagByte & 3;
    const sigOnly = sigBuffer.slice(1);

    const recovered = secp256k1.recover(
      messageHash,
      sigOnly,
      recoveryId,
      compressed
    );

    if (!recovered) {
      return { valid: false, reason: "Could not recover public key" };
    }

    // Hash the recovered public key
    const crypto = require("crypto");
    const recoveredHash = crypto
      .createHash("ripemd160")
      .update(crypto.createHash("sha256").update(recovered).digest())
      .digest();

    const isValid = recoveredHash.equals(addressPubKeyHash);
    return { valid: isValid, reason: isValid ? "OK" : "Signature mismatch" };
  } catch (e) {
    return { valid: false, reason: e.message };
  }
}

module.exports = {
  generateChallenge,
  isChallengeExpired,
  isValidZcashAddress,
  verifySignature,
};
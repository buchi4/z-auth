const express = require("express");
const cors = require("cors");
const {
  generateChallenge,
  isChallengeExpired,
  verifySignature,
} = require("../core/index");

// In-memory store for challenges (use Redis in production)
const challengeStore = new Map();

/**
 * z-auth middleware factory
 * Usage: app.use(zauth())
 */
function zauth(options = {}) {
  const router = express.Router();
  router.use(cors());
  router.use(express.json());

  // GET /zauth/challenge?address=t1...
  router.get("/zauth/challenge", (req, res) => {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const challenge = generateChallenge();
    challengeStore.set(address, challenge);

    // Auto-expire from store after 5 minutes
    setTimeout(() => challengeStore.delete(address), 5 * 60 * 1000);

    res.json({ message: challenge.message, timestamp: challenge.timestamp });
  });

  // POST /zauth/verify
  router.post("/zauth/verify", (req, res) => {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({ error: "Address and signature are required" });
    }

    const challenge = challengeStore.get(address);

    if (!challenge) {
      return res.status(404).json({ error: "No challenge found for this address. Request a new one." });
    }

    if (isChallengeExpired(challenge.timestamp)) {
      challengeStore.delete(address);
      return res.status(410).json({ error: "Challenge expired. Request a new one." });
    }

    const result = verifySignature({
      address,
      message: challenge.message,
      signature,
    });

    if (result.valid) {
      challengeStore.delete(address); // one-time use
      return res.json({ authenticated: true, address });
    }

    return res.status(401).json({ authenticated: false, reason: result.reason });
  });

  return router;
}

module.exports = zauth;
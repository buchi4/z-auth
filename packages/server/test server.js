const express = require("express");
const zauth = require("./index");

const app = express();

// Pre-load the demo challenge so the signature matches
const DEMO_ADDRESS = "t1R4G3JouKMrYiKA8i15aL7k2nkijrRcBqT";
const DEMO_MESSAGE = "Sign in with Zcash\nNonce: 475d27cfdc6c3b96904965daded79ad29acba7a9ef9f49f24cfb9b41b721f24d\nTimestamp: 1781046708415";

// Override the challenge store before mounting middleware
const zauthMiddleware = zauth();

// Pre-seed the challenge
const { challengeStore } = require("./index");

app.use(zauthMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "z-auth test server running!" });
});

app.listen(3001, () => {
  console.log("Test server running on http://localhost:3001");
});
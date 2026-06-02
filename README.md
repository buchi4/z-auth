# z-auth

> z-auth is a privacy-first authentication system for the Zcash ecosystem.

z-auth lets users sign in to any web app using their Zcash wallet with no email, no password, no personal data. Just cryptographic proof of Zcash wallet ownership.

## How it works

1. App requests a unique challenge for the user's Zcash t-address
2. User signs the challenge in their Zcash wallet (e.g. Zashi)
3. App verifies the signature — if valid, the user is authenticated

No personal data is collected or stored. The server only ever sees a Zcash address and a cryptographic signature.

## Packages

| Package | Description |
|---|---|
| `packages/core` | Challenge generation, address validation, signature verification |
| `packages/server` | Express middleware — drop into any Node.js backend |
| `packages/client` | React hook — drop into any React/Next.js frontend |
| `demo` | Full Next.js demo app showing the complete flow |

## Quick Start

### Backend (Express)

```js
const express = require("express");
const zauth = require("./packages/server");

const app = express();
app.use(zauth());
app.listen(3001);
```

Two endpoints are now available:

- `GET /zauth/challenge?address=t1...` — returns a challenge message
- `POST /zauth/verify` — verifies a signed challenge `{ address, signature }`

### Frontend (React)

```js
import { useZAuth } from "./packages/client";

const { requestChallenge, verify, status, authenticated } = useZAuth({
  serverUrl: "http://localhost:3001"
});

// Step 1: Get challenge
const message = await requestChallenge("t1YourAddress...");

// Step 2: User signs message in their wallet, then:
const success = await verify(signature);
```

## Running the demo

```bash
# Terminal 1 - Backend
node packages/server/test-server.js

# Terminal 2 - Frontend
cd demo
npm run dev
```

Open `http://localhost:3000`

## Privacy philosophy

z-auth v1 uses Zcash transparent addresses (t-addresses) for signing — a necessary starting point since shielded addresses don't expose signing keys by design.

**v2 roadmap:** Replace address-based signing with zero-knowledge proofs, allowing users to prove wallet ownership without revealing their address at all. This is the truly privacy-native version — authentication with no identity leakage.

## Tech stack

- Node.js + Express
- bitcoinjs-message (signature verification)
- bs58check (Zcash address validation)
- Next.js + Tailwind CSS (demo)

## Built for

ZecHub Hackathon 3.0 — Zcash Login track

## License

MIT
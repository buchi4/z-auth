"use client";
import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [challenge, setChallenge] = useState("");
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const SERVER_URL = "http://localhost:3001";

  // Step 1: Request challenge
  async function requestChallenge() {
    if (!address) return setError("Please enter your Zcash t-address");
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${SERVER_URL}/zauth/challenge?address=${address}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChallenge(data.message);
      setStatus("awaiting_signature");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  // Step 2: Verify signature
  async function verify() {
    if (!signature) return setError("Please paste your signature");
    setStatus("verifying");
    setError("");

    try {
      const res = await fetch(`${SERVER_URL}/zauth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setStatus("success");
      } else {
        throw new Error(data.reason || "Authentication failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  function reset() {
    setAddress("");
    setChallenge("");
    setSignature("");
    setStatus("idle");
    setError("");
    setAuthenticated(false);
  }

  if (authenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Authenticated!</h1>
          <p className="text-gray-400 mb-2">Signed in with Zcash address:</p>
          <p className="text-sm font-mono bg-gray-900 p-3 rounded-lg break-all text-yellow-300 mb-8">{address}</p>
          <p className="text-gray-500 text-sm mb-6">
            No email. No password. No personal data. Just cryptographic proof.
          </p>
          <button onClick={reset} className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition">
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">z-auth</h1>
          <p className="text-gray-400">Sign in with Zcash. No account needed.</p>
        </div>

        {/* Step 1 */}
        <div className={`mb-6 p-6 rounded-xl border ${status !== "idle" && status !== "error" ? "border-yellow-400/50 bg-gray-900" : "border-gray-800 bg-gray-900"}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-bold flex items-center justify-center">1</span>
            <h2 className="font-semibold">Enter your Zcash t-address</h2>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="t1..."
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-yellow-400 transition"
          />
          <button
            onClick={requestChallenge}
            disabled={status === "loading"}
            className="mt-3 w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {status === "loading" ? "Generating challenge..." : "Get Challenge"}
          </button>
        </div>

        {/* Step 2 */}
        {challenge && (
          <div className="mb-6 p-6 rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-bold flex items-center justify-center">2</span>
              <h2 className="font-semibold">Sign this message in your wallet</h2>
            </div>
            <pre className="text-xs font-mono bg-black p-4 rounded-lg text-yellow-300 whitespace-pre-wrap break-all mb-3">{challenge}</pre>
            <p className="text-gray-500 text-xs">Copy this message and sign it using your Zcash wallet (e.g. Zashi → Settings → Sign Message)</p>
          </div>
        )}

        {/* Step 3 */}
        {challenge && (
          <div className="mb-6 p-6 rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-bold flex items-center justify-center">3</span>
              <h2 className="font-semibold">Paste your signature</h2>
            </div>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Paste signature here..."
              rows={4}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-yellow-400 transition resize-none"
            />
            <button
              onClick={verify}
              disabled={status === "verifying"}
              className="mt-3 w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {status === "verifying" ? "Verifying..." : "Verify & Sign In"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Powered by z-auth · Privacy-first authentication for Zcash
        </p>
      </div>
    </main>
  );
}
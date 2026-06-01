const { useState, useCallback } = require("react");

/**
 * useZAuth - React hook for Zcash authentication
 * 
 * Usage:
 * const { requestChallenge, verify, status, authenticated } = useZAuth({
 *   serverUrl: "http://localhost:3000"
 * })
 */
function useZAuth({ serverUrl = "" } = {}) {
  const [status, setStatus] = useState("idle"); // idle | loading | awaiting_signature | verifying | success | error
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [address, setAddress] = useState(null);
  const [challenge, setChallenge] = useState(null);

  // Step 1: Request a challenge for the given address
  const requestChallenge = useCallback(async (zcashAddress) => {
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`${serverUrl}/zauth/challenge?address=${zcashAddress}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to get challenge");

      setChallenge(data.message);
      setAddress(zcashAddress);
      setStatus("awaiting_signature");

      return data.message;
    } catch (err) {
      setError(err.message);
      setStatus("error");
      return null;
    }
  }, [serverUrl]);

  // Step 2: Verify the signed challenge
  const verify = useCallback(async (signature) => {
    if (!challenge || !address) {
      setError("No active challenge. Call requestChallenge first.");
      setStatus("error");
      return false;
    }

    setStatus("verifying");
    setError(null);

    try {
      const res = await fetch(`${serverUrl}/zauth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });

      const data = await res.json();

      if (data.authenticated) {
        setAuthenticated(true);
        setStatus("success");
        return true;
      } else {
        throw new Error(data.reason || "Authentication failed");
      }
    } catch (err) {
      setError(err.message);
      setStatus("error");
      return false;
    }
  }, [challenge, address, serverUrl]);

  // Reset state
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setAuthenticated(false);
    setAddress(null);
    setChallenge(null);
  }, []);

  return {
    requestChallenge,
    verify,
    reset,
    status,
    error,
    authenticated,
    address,
    challenge,
  };
}

module.exports = { useZAuth };
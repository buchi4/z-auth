const { verifySignature } = require("./packages/core/index");

const address = "t1LLRQU4NApEpHkhCVsXd1WexZHwYFFdeE5";
const message = "Sign in with Zcash";
const signature = "IK8MfzSMtC4viGfgfU+BP+XXlwQ7/hivR8X+VHL/Vs4GOd/AH23tcXkG/02PMpBEOwvU63HKWwlk63jLcXxW+pY=";

const result = verifySignature({ address, message, signature });
console.log("Result:", result);
import { verify as cryptoVerify } from "node:crypto";

export function verifyDiscordEd25519(publicKeyHex: string, signatureHex: string, timestamp: string, body: string): boolean {
  try {
    const key = Buffer.from(publicKeyHex, "hex");
    const sig = Buffer.from(signatureHex, "hex");
    const message = Buffer.from(timestamp + body);
    // Node's Ed25519 verify accepts a DER-encoded SubjectPublicKeyInfo; build via createPublicKey
    const { createPublicKey } = require("node:crypto");
    const pub = createPublicKey({ key, format: "raw", type: "ed25519" });
    return cryptoVerify(null, message, pub, sig);
  } catch {
    return false;
  }
}

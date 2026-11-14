import { createPublicKey, verify as cryptoVerify } from "node:crypto";

const SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function verifyDiscordEd25519(publicKeyHex: string, signatureHex: string, timestamp: string, body: string): boolean {
  try {
    const raw = Buffer.from(publicKeyHex, "hex");
    const spki = Buffer.concat([SPKI_PREFIX, raw]);
    const pub = createPublicKey({ key: spki, format: "der", type: "spki" });
    const sig = Buffer.from(signatureHex, "hex");
    const message = Buffer.from(timestamp + body);
    return cryptoVerify(null, message, pub, sig);
  } catch {
    return false;
  }
}

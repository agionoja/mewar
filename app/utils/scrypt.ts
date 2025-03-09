import crypto from "node:crypto";
import * as util from "node:util";

async function hash(
  plainText: string,
  saltLength: number = 16,
): Promise<string> {
  if (!plainText.trim()) {
    throw new Error("Plain text cannot be empty");
  }
  if (saltLength <= 0) {
    throw new Error("Salt length must be positive");
  }

  const saltBuffer = await util.promisify(crypto.randomBytes)(saltLength);
  const salt = saltBuffer.toString("hex");

  return new Promise((resolve, reject) => {
    crypto.scrypt(plainText, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function compare(
  plainText?: string,
  hashValue?: string,
): Promise<boolean> {
  if (!plainText || !hashValue) return false;

  const [salt, key] = hashValue.split(":");
  if (!salt || !key) {
    throw new Error("Invalid hash format");
  }

  return new Promise((resolve, reject) => {
    crypto.scrypt(plainText, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex") === key);
    });
  });
}

export default { compare, hash };

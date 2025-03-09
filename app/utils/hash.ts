import crypto from "node:crypto";
import { promisify } from "node:util";

// Define the options type with discriminated union for better type safety
type HashOptions =
  | {
      data: string; // Input string to hash
    }
  | {
      length: number; // Length of random bytes to generate and hash
    };

/**
 * Creates a SHA-256 hash from either provided data or random bytes
 * @param hashOptions - Options specifying either data to hash or length of random bytes
 * @returns Promise resolving to a hexadecimal SHA-256 hash string
 * @throws Error if input validation fails or hashing operation fails
 */
export async function sha256(hashOptions: HashOptions): Promise<string> {
  try {
    let payload: string | Buffer;

    // Handle the two possible cases based on the discriminated union
    if ("data" in hashOptions) {
      // Case 1: Hash the provided data
      if (
        typeof hashOptions.data !== "string" ||
        hashOptions.data.length === 0
      ) {
        throw new Error("Data must be a non-empty string");
      }
      payload = hashOptions.data;
    } else if ("length" in hashOptions) {
      // Case 2: Generate random bytes and hash them
      if (!Number.isInteger(hashOptions.length) || hashOptions.length <= 0) {
        throw new Error("Length must be a positive integer");
      }
      // Generate random bytes asynchronously using promisified crypto.randomBytes
      payload = await promisify(crypto.randomBytes)(hashOptions.length);
    } else {
      // This should never happen due to TypeScript type checking, but added for runtime safety
      throw new Error(
        "Invalid hash options: must provide either data or length",
      );
    }

    // Create SHA-256 hash
    const hash = crypto.createHash("sha256");
    hash.update(payload);
    return hash.digest("hex"); // Return as hexadecimal string
  } catch (error) {
    // Re-throw error with a more specific message if it's not already an Error instance
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`SHA-256 hashing failed: ${String(error)}`);
  }
}

// app/utils/db.server.ts
import mongoose from "mongoose";
import { env } from "~/env.config";

// Type definition for Mongoose connection
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the connection in development to prevent hot-reload issues
const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseConnection;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = {
    conn: null,
    promise: null,
  };
}

// Utility function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectToDatabase({
  maxRetries = 3,
  retryDelay = 2000,
}: { maxRetries?: number; retryDelay?: number } = {}) {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const databaseUrl = env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("Please define the DATABASE_URL environment variable");
    }

    // Define the connection function to retry
    const connect = () =>
      mongoose.connect(databaseUrl, {
        serverSelectionTimeoutMS: 5000,
      });

    // Retry logic
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        cached.promise = connect().then((mongoose) => mongoose);
        cached.conn = await cached.promise;

        // Enable debug mode in development
        if (process.env.NODE_ENV === "development") {
          mongoose.set("debug", true);
        }

        return cached.conn; // Success, exit the function
      } catch (error) {
        lastError = error;
        cached.promise = null; // Reset promise on failure
        cached.conn = null; // Reset connection on failure

        if (attempt < maxRetries) {
          console.warn(
            `Database connection attempt ${attempt} failed: ${error}. Retrying in ${retryDelay}ms...`,
          );
          await delay(retryDelay); // Wait before next attempt
        } else {
          console.error(
            `All ${maxRetries} attempts to connect to the database failed.`,
          );
          throw lastError; // Throw the last error after all retries
        }
      }
    }
  }

  // This block only runs if cached.promise exists (unlikely with retries above)
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// For serverless environments, clean up on exit
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

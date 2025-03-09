import z from "zod";
import dotenv from "dotenv";
import * as process from "node:process";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_EXPIRES: z.string(),
  SESSION_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  DEPLOYMENT_ENV: z.string().optional(),
  NODE_ENV: z.enum(["production", "development", "test"]),
});

export const env = envSchema.parse(process.env);

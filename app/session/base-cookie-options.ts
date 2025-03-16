import type { CookieOptions } from "react-router";
import { env } from "~/env.config";

export const baseCookiesOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [env.COOKIE_SECRET],
  secure: env.NODE_ENV === "production",
};

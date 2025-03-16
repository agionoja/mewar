import { createCookieSessionStorage } from "react-router";
import type { Student } from "~/models/user.model";
import { baseCookiesOptions } from "~/session/base-cookie-options";

export type RegisterUser = Pick<
  Student,
  | "firstname"
  | "lastname"
  | "email"
  | "passwordConfirm"
  | "password"
  | "phone"
  | "courseOption"
  | "department"
  | "faculty"
  | "registrationNumber"
>;

export const registerSession = createCookieSessionStorage<{
  user: Partial<RegisterUser>;
}>({
  cookie: {
    ...baseCookiesOptions,
    name: "register:session",
    maxAge: 60 * 7 * 24, // 1 Week
  },
});

export async function getRegisterSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return registerSession.getSession(cookie);
}

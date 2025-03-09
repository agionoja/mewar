import type { User } from "~/models/user.model";

type ExcludeMethods<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

export function sanitizeUser<T extends ExcludeMethods<User>>(user: T) {
  const {
    password,
    passwordConfirm,
    passwordResetToken,
    passwordResetTokenExpires,
    ...safeUser
  } = user;

  return safeUser;
}

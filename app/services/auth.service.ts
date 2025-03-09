import { StudentModel, type User, UserModel } from "~/models/user.model";
import scrypt from "~/utils/scrypt";
import { sha256 } from "~/utils/hash";
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "~/utils/exception";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";

export async function register(
  user: Pick<
    User,
    | "firstname"
    | "lastname"
    | "email"
    | "password"
    | "passwordConfirm"
    | "phone"
  >,
) {
  return (await StudentModel.create(user)).toObject();
}

export async function login({
  email,
  password,
}: Pick<User, "email" | "password">) {
  const user = await UserModel.findOne({ email })
    .select("+password")
    .lean()
    .exec();

  if (!user || !(await scrypt.compare(password, user.password))) {
    throw new UnauthorizedException<User>(
      "Email or password is incorrect.",
      "email",
    );
  }

  return user;
}

export async function forgotPassword({ email }: Pick<User, "email">) {
  const user = await UserModel.findOne({ email }).exec();

  if (!user) {
    throw new NotFoundException<User>(
      "No user found with this email.",
      "email",
    );
  }

  const token = (await promisify(randomBytes)(64)).toString("hex");
  user.passwordResetToken = await sha256({ data: token });
  user.passwordResetTokenExpires = new Date(Date.now() + 1000 * 60 * 10);
  user.save({ validateModifiedOnly: true });
  return token;
}

export async function resetPassword(
  { password, passwordConfirm }: Pick<User, "password" | "passwordConfirm">,
  token: string,
) {
  const user = await UserModel.findOne({
    passwordResetToken: await sha256({ data: token }),
    passwordResetTokenExpires: { $gt: new Date() },
  })
    .select({ password: 1 })
    .exec();

  if (!user) {
    throw new UnauthorizedException(
      "Password reset token is invalid or has expired.",
    );
  }

  if (await scrypt.compare(password, user.password)) {
    throw new ConflictException<User>(
      "New password cannot be the same as the old one.",
      "password",
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  return user.toObject();
}

export default { register, login, resetPassword, forgotPassword };

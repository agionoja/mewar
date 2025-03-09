import authService from "~/services/auth.service";
import z from "zod";
import { handleError } from "~/utils/error.handler";
import { HttpStatus } from "~/utils/status";

export const register = (request: Request) =>
  handleError(request, async () => {
    const formData = z
      .object({
        firstname: z.string(),
        lastname: z.string(),
        phone: z.string(),
        email: z.string().email(),
        password: z.string(),
        passwordConfirm: z.string(),
        remember: z.string().optional(),
      })
      .parse(Object.fromEntries(await request.formData()));
    const user = await authService.register(formData);

    return {
      data: { ...user, remember: typeof formData.remember === "string" },
      statusCode: HttpStatus.CREATED,
      message: `Welcome ${user.firstname}`,
    };
  });

export const login = (request: Request) =>
  handleError(request, async () => {
    const formData = z
      .object({
        password: z.string(),
        email: z.string(),
        remember: z.string().optional(),
      })
      .parse(Object.fromEntries(await request.formData()));

    const user = await authService.login(formData);

    return {
      data: { ...user, remember: typeof formData.remember === "string" },
      statusCode: HttpStatus.OK,
      message: `Welcome back ${user.firstname}`,
    };
  });

export const forgotPassword = (request: Request) =>
  handleError(request, async () => {
    const formData = z
      .object({ email: z.string() })
      .parse(Object.fromEntries(await request.formData()));

    const token = await authService.forgotPassword(formData);

    return {
      data: token,
      statusCode: HttpStatus.OK,
      message: `Check ${formData.email} for instructions to reset your password.`,
    };
  });

export const resetPassword = (request: Request, token: string) =>
  handleError(request, async () => {
    await authService.resetPassword(
      z
        .object({
          password: z.string(),
          passwordConfirm: z.string(),
        })
        .parse(Object.fromEntries(await request.formData())),
      token,
    );

    return {
      data: null,
      statusCode: HttpStatus.OK,
      message: "Password reset successfully.",
    };
  });

export function logout(request: Request) {}

export default { register, login, logout, resetPassword, forgotPassword };

import authService from "~/services/auth.service";
import z from "zod";
import { handleError } from "~/utils/error.handler";
import { HttpStatus } from "~/utils/status";
import { href, redirect } from "react-router";
import {
  getRegisterSession,
  registerSession,
  RegisterUser,
} from "~/session/register.session";
import { type Student, StudentModel } from "~/models/user.model";
import { ConflictException } from "~/utils/exception";
import {
  registerSchema,
  step1Schema,
  step2Schema,
} from "~/routes/auth/register/schema";

export class Register {
  private readonly config: {
    session: Awaited<ReturnType<typeof getRegisterSession>>;
    formValues: Partial<RegisterUser>;
    _action: FormDataEntryValue;
    path: (step: string) => string;
    remember?: FormDataEntryValue;
  };

  private constructor(config: Register["config"]) {
    this.config = config;
  }

  public static async init(request: Request) {
    const { _action, remember, ...formValues } = Object.fromEntries(
      await request.formData(),
    );

    return new Register({
      session: await getRegisterSession(request),
      formValues: formValues as unknown as Partial<RegisterUser>,
      _action,
      remember,
      path: (step) => href("/auth/register") + `?step=${step}`,
    });
  }

  public async step1() {
    if (this.config._action !== "step1") return;

    const stepData = step1Schema.parse(this.config.formValues);
    const previousData = this.config.session.get("user") ?? {};

    this.config.session.set("user", { ...previousData, ...stepData });

    const [emailCheck, phoneCheck] = await Promise.all([
      StudentModel.exists({ email: stepData?.email }).lean().exec(),
      StudentModel.exists({ phone: stepData?.phone }).lean().exec(),
    ]);

    if (emailCheck) {
      throw new ConflictException<Student>(
        `${stepData.email} is already in use`,
        "email",
      );
    }

    if (phoneCheck) {
      throw new ConflictException<Student>(
        `${stepData.phone} is already in use`,
        "phone",
      );
    }

    throw redirect(this.config.path("2"), {
      headers: {
        "Set-Cookie": await registerSession.commitSession(this.config.session),
      },
    });
  }

  public async step2() {
    if (this.config._action !== "step2") return;

    const previousData = this.config.session.get("user") ?? {};
    const stepData = step2Schema.parse(this.config.formValues);
    this.config.session.set("user", { ...previousData, ...stepData });

    const regNumCheck = await StudentModel.exists({
      registrationNumber: stepData.registrationNumber,
    })
      .lean()
      .exec();

    if (regNumCheck) {
      throw new ConflictException<Student>(
        `${stepData.registrationNumber} is already in use`,
        "registrationNumber",
      );
    }

    throw redirect(this.config.path("3"), {
      headers: {
        "Set-Cookie": await registerSession.commitSession(this.config.session),
      },
    });
  }

  public step3() {
    if (this.config._action !== "step3") return;

    const previousData = this.config.session.get("user");
    const user = registerSchema.parse({
      ...previousData,
      ...this.config.formValues,
    });

    return {
      user,
      remember: this.config.remember,
    };
  }
}

export const register = (request: Request) =>
  handleError(request, async () => {
    const reg = await Register.init(request);
    await reg.step1();
    await reg.step2();
    const step3Data = reg.step3();

    if (step3Data) {
      const user = await authService.register(step3Data.user);
      return {
        data: { user: user, remember: Boolean(step3Data?.remember) },
        statusCode: HttpStatus.CREATED,
        message: `Welcome ${user.firstname}`,
      };
    }

    return {
      data: null,
      statusCode: 200,
      message: undefined,
    };
  });

export const login = (request: Request) =>
  handleError(request, async () => {
    const formData = z
      .object({
        password: z.string(),
        email: z.string(),
        remember: z.string().optional(),
        redirect: z.string(),
      })
      .parse(Object.fromEntries(await request.formData()));

    const user = await authService.login(formData);

    return {
      data: {
        user,
        redirect: formData.redirect,
        remember: typeof formData.remember === "string",
      },
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

export default { register, login, resetPassword, forgotPassword };

import type { Route } from "./+types/route";
import { Register, register } from "~/controllers/auth.controller";
import { isAPIError } from "~/utils/is-api-error";
import { apiErrorResponse } from "~/utils/api-error-response";
import { createSession, redirectIfHasSession } from "~/session/auth.session";
import {
  getRegisterSession,
  registerSession,
} from "~/session/register.session";
import { href, redirect, Session, useSearchParams } from "react-router";
import { redirectWithError } from "remix-toast";
import { RegisterStep1 } from "~/routes/auth/register/steps/register-step1";
import { RegisterStep2 } from "~/routes/auth/register/steps/register-step2";
import { RegisterStep3 } from "~/routes/auth/register/steps/register-step3";
import { handleError } from "~/utils/error.handler";
import { StudentModel, type Student } from "~/models/user.model";
import { ConflictException } from "~/utils/exception";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  registerSchema,
} from "./schema";

export async function action({ request }: Route.ActionArgs) {
  const response = await register(request);

  if (isAPIError(response)) {
    return apiErrorResponse(response);
  }

  if (response.data && response.message)
    await createSession(
      {
        remember: response.data?.remember,
        request,
        role: response.data.user.role,
        token: response.data.user._id,
        message: response.message,
      },
      {
        headers: {
          "Set-Cookie": await registerSession.destroySession(
            await getRegisterSession(request),
          ),
        },
      },
    );
}

// Loader: Validates step and loads session user data
export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfHasSession(request);

  const searchParams = new URL(request.url).searchParams;
  const step = searchParams.get("step");

  if (!step || parseInt(step) < 1 || parseInt(step) > 3) {
    throw redirect(`${href("/auth/register")}?step=1`);
  }

  const session = await getRegisterSession(request);
  const user = session.get("user") ?? {};

  if (step === "2" && !step1Schema.safeParse(user).success) {
    throw await redirectWithError(
      `${href("/auth/register")}?step=1`,
      "Please complete the first registration step.",
    );
  }
  if (step === "3" && !step2Schema.safeParse(user).success) {
    throw await redirectWithError(
      `${href("/auth/register")}?step=2`,
      "Please complete the second registration step.",
    );
  }

  return { user };
}

export default function RegisterRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step") ?? "1";

  switch (step) {
    case "1":
      return <RegisterStep1 actionData={actionData} loaderData={loaderData} />;
    case "2":
      return <RegisterStep2 actionData={actionData} loaderData={loaderData} />;
    case "3":
      return <RegisterStep3 actionData={actionData} />;
  }
}

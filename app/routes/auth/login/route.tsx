import type { Route } from "./+types/route";
import {
  AuthForm,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";
import { login } from "~/controllers/auth.controller";
import { isAPIError } from "~/utils/is-api-error";
import { createSession, redirectIfHasSession } from "~/session/auth.session";
import { apiErrorResponse } from "~/utils/api-error-response";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { useFocusError } from "~/hooks/use-focus-error-field";
import type { User } from "~/models/user.model";
import { href, Link, useSearchParams } from "react-router";
import { useRef } from "react";

export async function action({ request }: Route.ActionArgs) {
  const response = await login(request);

  if (isAPIError(response)) {
    return apiErrorResponse(response);
  }

  await createSession({
    remember: response.data.remember,
    request,
    role: response.data.user.role,
    token: response.data.user._id,
    message: response.message,
    redirectTo: response.data.redirect,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfHasSession(request);
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const error = useApiErrorToast(actionData);
  const redirect = searchParams.get("redirect") ?? href("/auth/login");

  useFocusError<User>(error, emailRef, "email");
  useFocusError<User>(error, passwordRef, "password");

  return (
    <AuthForm>
      <input type="text" hidden defaultValue={redirect} name={"redirect"} />
      <FormLabel>
        <FormSpan>Email</FormSpan>
        <FormInput
          autoCapitalize={"email"}
          aria-invalid={error?.field === "email"}
          aria-errormessage={error?.message}
          type={"email"}
          name={"email"}
          ref={emailRef}
          required
          maxLength={53}
          minLength={8}
        />
      </FormLabel>
      <FormLabel>
        <div className="flex w-full justify-between">
          <FormSpan>Password</FormSpan>
          <Link
            className={"text-xs text-yellow-500"}
            to={href("/auth/forgot-password")}
          >
            Forgot password?
          </Link>
        </div>
        <FormInput
          autoComplete={"current-password"}
          aria-invalid={error?.field === "password"}
          aria-errormessage={error?.message}
          type={"password"}
          name={"password"}
          ref={passwordRef}
          required
          maxLength={53}
          minLength={8}
        />
      </FormLabel>
      <div className="flex w-full justify-between">
        <label className={"flex items-center gap-2"}>
          <input className={"bg-green-500"} type="checkbox" name="remember" />
          <span className={"text-xs text-yellow-500 md:text-black"}>
            Remember me?
          </span>
        </label>
        <Link to={href("/auth/register")} className={"text-xs text-yellow-500"}>
          You don't have an account?
        </Link>
      </div>
    </AuthForm>
  );
}

import type { Route } from "./+types/route";
import type { User } from "~/models/user.model";
import { href, Link } from "react-router";
import { resetPassword } from "~/controllers/auth.controller";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { redirectWithSuccess } from "remix-toast";
import { isAPIError } from "~/utils/is-api-error";
import { apiErrorResponse } from "~/utils/api-error-response";
import { useFocusError } from "~/hooks/use-focus-error-field";
import { useRef } from "react";
import {
  AuthForm,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";

export async function action({ params, request }: Route.ActionArgs) {
  const response = await resetPassword(request, params.token);
  if (isAPIError(response)) {
    return apiErrorResponse(response);
  }

  throw await redirectWithSuccess(href("/auth/login"), response.message);
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordConfirmRef = useRef<HTMLInputElement | null>(null);
  const error = useApiErrorToast(actionData);

  useFocusError<User>(error, passwordRef, "password");
  useFocusError<User>(error, passwordConfirmRef, "passwordConfirm");

  return (
    <AuthForm method={"PATCH"}>
      <FormLabel>
        <div className="flex w-full justify-between">
          <FormSpan>Password</FormSpan>
          <Link
            className={"text-xs text-yellow-500"}
            to={href("/auth/forgot-password")}
          >
            Get new Reset Link?
          </Link>
        </div>
        <FormInput
          type={"password"}
          name={"password"}
          ref={passwordRef}
          required
          maxLength={53}
          minLength={8}
        />
      </FormLabel>
      <FormLabel>
        <FormSpan>Password</FormSpan>
        <FormInput
          type={"password"}
          name={"passwordConfirm"}
          ref={passwordConfirmRef}
          required
          maxLength={53}
          minLength={8}
        />
      </FormLabel>
    </AuthForm>
  );
}

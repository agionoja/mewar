import type { Route } from "./+types/route";
import { forgotPassword } from "~/controllers/auth.controller";
import {
  AuthForm,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";
import { href } from "react-router";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { isAPIError } from "~/utils/is-api-error";
import { apiErrorResponse } from "~/utils/api-error-response";
import { redirectWithSuccess } from "remix-toast";
import { useFocusError } from "~/hooks/use-focus-error-field";
import type { User } from "~/models/user.model";
import { useRef } from "react";

export async function action({ request }: Route.ActionArgs) {
  const response = await forgotPassword(request);
  if (isAPIError(response)) {
    return apiErrorResponse(response);
  }

  throw await redirectWithSuccess(
    href("/auth/reset-password/:token", { token: response.data }),
    response.message,
  );
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const error = useApiErrorToast(actionData);
  const emailRef = useRef<HTMLInputElement | null>(null);
  useFocusError<User>(error, emailRef, "email");

  return (
    <AuthForm method={"PATCH"}>
      <FormLabel>
        <FormSpan>Email</FormSpan>
        <FormInput type={"email"} name={"email"} ref={emailRef} required />
      </FormLabel>
    </AuthForm>
  );
}

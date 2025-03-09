import type { Route } from "./+types/route";
import {
  AuthForm,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";
import { login } from "~/controllers/auth.controller";
import { isAPIError } from "~/utils/is-api-error";
import { createSession, redirectIfHasSession } from "~/session";
import { apiErrorResponse } from "~/utils/api-error-response";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { useFocusErrorField } from "~/hooks/use-focus-error-field";
import type { User } from "~/models/user.model";
import { href, Link } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const response = await login(request);

  if (isAPIError(response)) {
    return apiErrorResponse(response);
  }

  await createSession({
    remember: response.data.remember,
    request,
    role: response.data.role,
    token: response.data._id,
    message: response.message,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfHasSession(request);
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const error = useApiErrorToast(actionData);
  const createRefHandler = useFocusErrorField<User>(error);

  return (
    <AuthForm submitText={"Login"}>
      <FormLabel>
        <FormSpan>Email</FormSpan>
        <FormInput
          type={"email"}
          name={"email"}
          ref={createRefHandler("email")}
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
          type={"password"}
          name={"password"}
          ref={createRefHandler("password")}
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
          Don't have an account?
        </Link>
      </div>
    </AuthForm>
  );
}

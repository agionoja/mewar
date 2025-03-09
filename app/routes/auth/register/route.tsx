import type { Route } from "./+types/route";
import { register } from "~/controllers/auth.controller";
import { isAPIError } from "~/utils/is-api-error";
import { apiErrorResponse } from "~/utils/api-error-response";
import type { User } from "~/models/user.model";
import { createSession, redirectIfHasSession } from "~/session";
import { useFocusErrorField } from "~/hooks/use-focus-error-field";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { href, Link } from "react-router";
import {
  AuthForm,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";

export async function action({ request }: Route.ActionArgs) {
  const response = await register(request);

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
    <AuthForm submitText={"Register"}>
      <FormLabel>
        <FormSpan>Firstname</FormSpan>
        <FormInput
          type="text"
          name="firstname"
          placeholder="John"
          required
          minLength={2}
          maxLength={53}
        />
      </FormLabel>

      <FormLabel>
        <FormSpan>Lastname</FormSpan>
        <FormInput
          type="text"
          name="lastname"
          placeholder="Peter"
          required
          minLength={2}
          maxLength={53}
        />
      </FormLabel>

      <FormLabel>
        <FormSpan>Email</FormSpan>
        <FormInput
          type="email"
          name="email"
          placeholder="example@email.com"
          required
          ref={createRefHandler("email")}
        />
      </FormLabel>

      <FormLabel>
        <FormSpan>Phone number</FormSpan>
        <FormInput
          type="tel"
          name="phone"
          placeholder="+123 8245764844"
          required
          ref={createRefHandler("phone")}
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
          type="password"
          name="password"
          required
          minLength={8}
          maxLength={50}
          ref={createRefHandler("password")}
        />
      </FormLabel>

      <FormLabel>
        <FormSpan>Password confirm</FormSpan>
        <FormInput
          type="password"
          name="passwordConfirm"
          required
          minLength={8}
          maxLength={50}
          ref={createRefHandler("passwordConfirm")}
        />
      </FormLabel>
      <div className="flex w-full justify-between">
        <label className={"flex items-center gap-2"}>
          <input className={"bg-green-500"} type="checkbox" name="remember" />
          <span className={"text-xs text-yellow-500 md:text-black"}>
            Remember me?
          </span>
        </label>
        <Link to={href("/auth/login")} className={"text-xs text-yellow-500"}>
          Already have an account?
        </Link>
      </div>
    </AuthForm>
  );
}

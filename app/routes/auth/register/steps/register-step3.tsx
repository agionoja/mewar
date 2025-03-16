import type { Route } from "../../../../../.react-router/types/app/routes/auth/register/+types/route";
import { useRef } from "react";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { useFocusError } from "~/hooks/use-focus-error-field";
import type { Student } from "~/models/user.model";
import { href, Link, useNavigation } from "react-router";
import {
  AuthForm,
  FormButton,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";

export function RegisterStep3({
  actionData,
}: Pick<Route.ComponentProps, "actionData">) {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordConfirmRef = useRef<HTMLInputElement | null>(null);
  const error = useApiErrorToast(actionData);

  useFocusError<Student>(error, passwordRef, "password");
  useFocusError<Student>(error, passwordConfirmRef, "passwordConfirm");

  const { state } = useNavigation();
  return (
    <AuthForm>
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
          ref={passwordRef}
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
          ref={passwordConfirmRef}
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
      <FormButton name={"_action"} value={"step3"} state={state}>
        Register
      </FormButton>
    </AuthForm>
  );
}

import type { Route } from "../../../../../.react-router/types/app/routes/auth/register/+types/route";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { useFocusError } from "~/hooks/use-focus-error-field";
import type { Student } from "~/models/user.model";
import {
  AuthForm,
  FormButton,
  FormInput,
  FormLabel,
  FormSpan,
} from "~/routes/auth/components/auth-form";
import { PhoneInput } from "react-international-phone";
import { inputClasses } from "~/components/ui/input";
import validator from "validator";

export function RegisterStep1({
  actionData,
  loaderData: { user },
}: Pick<Route.ComponentProps, "actionData" | "loaderData">) {
  const [phone, setPhone] = useState(user.phone ?? "");
  const { state } = useNavigation();
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const error = useApiErrorToast(actionData);

  useFocusError<Student>(error, emailRef, "email");
  useFocusError<Student>(error, phoneRef, "phone");

  // Validate phone number on change and set custom validity
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = event.target.value;
    setPhone(phoneValue);

    // Validate with validator.js for Nigerian mobile numbers
    const isValid = validator.isMobilePhone(phoneValue, "en-NG");
    if (phoneRef.current) {
      phoneRef.current.setCustomValidity(
        isValid
          ? ""
          : "Please enter a valid Nigerian phone number (e.g., +2348123456789)",
      );
    }
  };

  // Clear custom validity on mount or when user data changes
  useEffect(() => {
    if (phoneRef.current && user.phone) {
      const isValid = validator.isMobilePhone(user.phone, "en-NG", {
        strictMode: true,
      });
      phoneRef.current.setCustomValidity(isValid ? "" : "Invalid phone number");
    }
  }, [user.phone]);

  return (
    <AuthForm>
      <FormLabel>
        <FormSpan>Firstname</FormSpan>
        <FormInput
          type="text"
          name="firstname"
          placeholder="John"
          defaultValue={user.firstname}
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
          defaultValue={user.lastname}
          placeholder="Peter"
          required
          minLength={2}
          maxLength={53}
        />
      </FormLabel>

      <FormLabel>
        <FormSpan>Email</FormSpan>
        <FormInput
          ref={emailRef}
          type="email"
          name="email"
          defaultValue={user.email}
          placeholder="example@gmail.com"
          required
        />
      </FormLabel>

      <FormLabel>
        <FormSpan>Phone number</FormSpan>
        <PhoneInput
          inputRef={phoneRef}
          className="w-full"
          defaultCountry="ng"
          inputProps={{
            onChange: handlePhoneChange,
            type: "tel",
            required: true,
            name: "phone",
            placeholder: "+234 8123456789",
            className: inputClasses,
            value: phone,
          }}
        />
      </FormLabel>

      <FormButton name="_action" value="step1" state={state}>
        Next
      </FormButton>
    </AuthForm>
  );
}

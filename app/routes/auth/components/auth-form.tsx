import { Form, type FormProps, useNavigation } from "react-router";
import React from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import crest from "~/asset/images/crest.png";
import authBg from "~/asset/images/auth-bg.png";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import type { User } from "~/models/user.model";

export function AuthForm({
  children,
  submitText,
  ...props
}: FormProps & { submitText: string }) {
  const { state } = useNavigation();
  return (
    <AuthLayout>
      <Form
        method="POST"
        className={cn(
          "mx-auto flex w-full max-w-md flex-col justify-center gap-4 md:min-w-md",
          props.className,
        )}
        {...props}
      >
        {children}
        <Button
          type="submit"
          disabled={state === "submitting"}
          variant="default"
          className="cursor-pointer bg-yellow-500 hover:bg-yellow-500/80"
        >
          {state === "submitting" ? "Processing..." : submitText}
        </Button>
      </Form>
    </AuthLayout>
  );
}

// FormLabel component
export function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn("flex flex-col items-start gap-4", className)}
      {...props}
    />
  );
}

// FormSpan component for label text
export function FormSpan({
  children,
  className,
}: React.ComponentProps<"span">) {
  return (
    <span className={cn("text-white/90 md:text-black", className)}>
      {children}
    </span>
  );
}

// FormInput component
export function FormInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "name"> & {
  name?: keyof User & string;
}) {
  return <Input className={cn("bg-white/70", className)} {...props} />;
}

// AuthLayout component
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col md:flex-row">
      <div className="relative z-10 flex flex-1 flex-col items-center bg-transparent/90 py-6 md:bg-transparent md:py-12">
        <div className="flex h-full w-full max-w-md flex-col gap-12 px-4 md:px-0">
          <div className="flex items-center gap-2">
            <a href="/">
              <img
                src={crest}
                width={62}
                height={56}
                alt="University Crest"
                className="size-12 object-contain md:size-16"
              />
            </a>
            <span className="text-lg font-semibold text-yellow-500 md:font-bold">
              Mewar International University
            </span>
          </div>
          {children}
        </div>
      </div>

      <div className="absolute inset-0 blur-xs md:static md:flex-1 md:blur-none">
        <img
          src={authBg}
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

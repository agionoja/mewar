// import { Form, type FormProps, type Navigation } from "react-router";
// import React from "react";
// import { Button } from "~/components/ui/button";
// import { cn } from "~/lib/utils";
// import crest from "~/asset/images/crest.png";
// import authBg from "~/asset/images/auth-bg.png";
// import { Label } from "~/components/ui/label";
// import { Input } from "~/components/ui/input";
// import { type Student } from "~/models/user.model";
//
// export function AuthForm({
//   children,
//   ...props
// }: React.ComponentProps<typeof Form>) {
//   return (
//     <AuthLayout>
//       <Form
//         method="POST"
//         className={cn(
//           "mx-auto flex w-full max-w-md flex-col justify-center gap-4 md:min-w-md",
//           props.className,
//         )}
//         {...props}
//       >
//         {children}
//       </Form>
//     </AuthLayout>
//   );
// }
//
// export function FormButton({
//   state,
//   children,
//   className,
//   ...props
// }: React.ComponentProps<"button"> & { state: Navigation["state"] }) {
//   return (
//     <Button
//       type="submit"
//       disabled={state === "submitting"}
//       variant="default"
//       className={cn(
//         "cursor-pointer bg-yellow-500 hover:bg-yellow-500/80 disabled:animate-pulse",
//         className,
//       )}
//       {...props}
//     >
//       {children}
//     </Button>
//   );
// }
//
// export function FormLabel({
//   className,
//   ...props
// }: React.ComponentProps<typeof Label>) {
//   return (
//     <Label
//       className={cn("flex flex-col items-start gap-4", className)}
//       {...props}
//     />
//   );
// }
//
// export function FormSpan({
//   children,
//   className,
// }: React.ComponentProps<"span">) {
//   return (
//     <span className={cn("text-white/90 md:text-black", className)}>
//       {children}
//     </span>
//   );
// }
//
// export function FormInput({
//   className,
//   ...props
// }: Omit<React.ComponentProps<typeof Input>, "name"> & {
//   name?: keyof Student & string;
// }) {
//   return <Input className={cn("bg-white/70", className)} {...props} />;
// }
//
// function AuthLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative flex h-screen flex-col md:flex-row">
//       <div className="relative z-10 flex flex-1 flex-col items-center bg-transparent/90 py-6 md:bg-transparent md:py-12">
//         <div className="flex h-full w-full max-w-md flex-col gap-12 px-4 md:px-0">
//           <div className="flex items-center gap-2">
//             <a href="/">
//               <img
//                 src={crest}
//                 width={62}
//                 height={56}
//                 alt="University Crest"
//                 className="size-12 object-contain md:size-16"
//               />
//             </a>
//             <span className="text-lg font-semibold text-yellow-500 md:font-bold">
//               Mewar International University
//             </span>
//           </div>
//           {children}
//         </div>
//       </div>
//
//       <div className="absolute inset-0 blur-xs md:static md:flex-1 md:blur-none">
//         <img
//           src={authBg}
//           alt="Background"
//           className="h-full w-full object-cover"
//         />
//       </div>
//     </div>
//   );
// }

import { Form, type Navigation } from "react-router";
import React from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import crest from "~/asset/images/crest.png";
import authBg from "~/asset/images/auth-bg.png";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { type Student } from "~/models/user.model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Base AuthForm
export function AuthForm({
  children,
  ...props
}: React.ComponentProps<typeof Form>) {
  return (
    <AuthLayout>
      <Form
        method="POST"
        className={cn(
          "mx-auto flex w-full max-w-md flex-col justify-center gap-6 md:min-w-md",
          props.className,
        )}
        {...props}
      >
        {children}
      </Form>
    </AuthLayout>
  );
}

// Reusable FormButton
export function FormButton({
  state,
  children,
  className,
  ...props
}: React.ComponentProps<"button"> & { state: Navigation["state"] }) {
  return (
    <Button
      type="submit"
      disabled={state === "submitting"}
      variant="default"
      className={cn(
        "cursor-pointer bg-yellow-500 hover:bg-yellow-500/80 disabled:animate-pulse",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Reusable FormLabel
export function FormLabel({
  className,
  htmlFor,
  ...props
}: React.ComponentProps<typeof Label> & { htmlFor?: string }) {
  return (
    <Label
      htmlFor={htmlFor} // Associate with input/select
      className={cn("flex flex-col items-start gap-3", className)}
      {...props}
    />
  );
}

// Reusable FormSpan
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

// Reusable FormInput
export function FormInput({
  className,
  name,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "name"> & {
  name?: keyof Student & string;
}) {
  return (
    <Input className={cn("bg-white/70", className)} name={name} {...props} />
  );
}

export function FormSelect<T extends string>({
  id,
  name,
  label,
  options,
  value,
  onValueChange,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  ...selectProps
}: React.ComponentProps<typeof Select> & {
  id: string;
  name: keyof Student & string;
  label: string;
  options: T[];
  value: T | "";
  onValueChange: (value: T) => void;
  placeholder?: string;
}) {
  return (
    <FormLabel htmlFor={id}>
      <FormSpan>{label}</FormSpan>
      <Select
        name={name}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        {...selectProps}
      >
        <SelectTrigger id={id} className={cn("w-full bg-white/70")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={"bg-white/70"}>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormLabel>
  );
}

// AuthLayout (unchanged)
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

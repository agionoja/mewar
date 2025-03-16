// import * as React from "react";
//
// import { cn } from "~/lib/utils";
//
// function Input({ className, type, ...props }: React.ComponentProps<"input">) {
//   return (
//     <input
//       type={type}
//       data-slot="input"
//       className={cn(
//         "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
//         "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
//         "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
//         className,
//       )}
//       {...props}
//     />
//   );
// }
//
// export { Input };

import * as React from "react";
import { useRef } from "react";
import { cn } from "~/lib/utils";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css"; // Import default styles (optional, can override)

// Define the input classes to reuse
export const inputClasses = cn(
  "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
);

// Your existing Input component
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClasses, className)}
      {...props}
    />
  );
}

// Example usage with PhoneInput
export default function PhoneInputExample() {
  const phoneRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="relative">
      <PhoneInput
        defaultCountry="us" // Set default country (optional)
        inputRef={phoneRef}
        className={cn(
          "flex items-center gap-2", // Wrapper styles for PhoneInput
          "w-full",
        )}
        inputProps={{
          type: "tel",
          required: true,
          name: "phone",
          placeholder: "+1 234 567 8900", // Adjusted placeholder format
          className: inputClasses, // Apply the same classes as Input
        }}
        countrySelectorStyleProps={{
          className: cn(
            "h-9 rounded-md border border-input bg-transparent px-2",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          ),
          buttonClassName: cn(
            "flex items-center gap-1 text-foreground",
            "hover:bg-gray-100 dark:hover:bg-gray-800", // Hover effect
          ),
        }}
      />
    </div>
  );
}

export { Input };

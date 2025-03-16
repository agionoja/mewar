import z from "zod";
import {
  CourseOptions,
  Department,
  FACULTIES,
  Faculty,
} from "~/configs/faculty.config";

export const registerSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string(),
  passwordConfirm: z.string(),
  registrationNumber: z.string(),
  faculty: z.enum(FACULTIES.map((f) => f.name) as [Faculty, ...Faculty[]]),
  department: z.enum(
    FACULTIES.flatMap((f) => f.departments.map((d) => d.name)) as [
      Department,
      ...Department[],
    ],
  ),
  courseOption: z.enum(
    FACULTIES.flatMap((f) => f.departments.flatMap((d) => d.courseOptions)) as [
      CourseOptions,
      ...CourseOptions[],
    ],
  ),
});

export const step1Schema = registerSchema
  .pick({
    firstname: true,
    lastname: true,
    phone: true,
    email: true,
  })
  .extend({
    phone: z
      .string()
      .min(11, "Phone is required")
      .transform((phone) => {
        const parts = phone.split(" ");
        if (parts.length > 1) {
          parts[1] = parts[1].replace(/^0+/, "");
        }
        console.log({ parts });
        return parts.join("");
      }),
  });

export const step2Schema = registerSchema.pick({
  registrationNumber: true,
  faculty: true,
  department: true,
  courseOption: true,
});

export const step3Schema = registerSchema.pick({
  password: true,
  passwordConfirm: true,
});

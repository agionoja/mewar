// import type { Route } from "../../../../../.react-router/types/app/routes/auth/register/+types/route";
// import { useNavigation, useSubmit } from "react-router";
// import { useRef } from "react";
// import { useApiErrorToast } from "~/hooks/use-api-error-toast";
// import { useFocusError } from "~/hooks/use-focus-error-field";
// import type { Student } from "~/models/user.model";
// import {
//   AuthForm,
//   FormButton,
//   FormInput,
//   FormLabel,
//   FormSpan,
// } from "~/routes/auth/components/auth-form";
//
// export function RegisterStep2({
//   actionData,
//   loaderData: { user },
// }: Pick<Route.ComponentProps, "actionData" | "loaderData">) {
//   const submit = useSubmit();
//   const { state } = useNavigation();
//   const regNumRef = useRef<HTMLInputElement | null>(null);
//   const error = useApiErrorToast(actionData);
//
//   useFocusError<Student>(error, regNumRef, "registrationNumber");
//   return (
//     <AuthForm>
//       <FormLabel>
//         <FormSpan>Faculty</FormSpan>
//         <FormInput
//           type="text"
//           defaultValue={user.faculty}
//           name="faculty"
//           placeholder="Computer Science"
//           required
//         />
//       </FormLabel>
//
//       <FormLabel>
//         <FormSpan>Department</FormSpan>
//         <FormInput
//           type="text"
//           name="department"
//           defaultValue={user.courseOption}
//           placeholder="Software Enginerring"
//           required
//         />
//       </FormLabel>
//
//       <FormLabel>
//         <FormSpan>Course</FormSpan>
//         <FormInput
//           type="text"
//           name="courseOption"
//           defaultValue={user.courseOption}
//           placeholder="Web Development"
//           required
//         />
//       </FormLabel>
//
//       <FormLabel>
//         <FormSpan>Reg. Number</FormSpan>
//         <FormInput
//           type="text"
//           ref={regNumRef}
//           defaultValue={user.registrationNumber}
//           name="registrationNumber"
//           placeholder="20/37474646/I"
//           required
//         />
//       </FormLabel>
//
//       <FormButton name={"_action"} value={"step2"} state={state}>
//         Next
//       </FormButton>
//     </AuthForm>
//   );
// }

import { useNavigation } from "react-router";
import { useRef, useState, useEffect } from "react";
import { useApiErrorToast } from "~/hooks/use-api-error-toast";
import { useFocusError } from "~/hooks/use-focus-error-field";
import type { Student } from "~/models/user.model";
import type { Route } from "../../../../../.react-router/types/app/routes/auth/register/+types/route";
import {
  AuthForm,
  FormButton,
  FormInput,
  FormLabel,
  FormSpan,
  FormSelect,
} from "~/routes/auth/components/auth-form";
import {
  FACULTIES,
  Faculty,
  Department,
  CourseOptions,
} from "~/configs/faculty.config";

export function RegisterStep2({
  actionData,
  loaderData: { user },
}: Pick<Route.ComponentProps, "actionData" | "loaderData">) {
  const { state } = useNavigation();
  const regNumRef = useRef<HTMLInputElement | null>(null);
  const error = useApiErrorToast(actionData);

  useFocusError<Student>(error, regNumRef, "registrationNumber");

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | "">(
    (user.faculty as Faculty) || "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState<Department | "">(
    (user.department as Department) || "",
  );
  const [selectedCourse, setSelectedCourse] = useState<CourseOptions | "">(
    (user.courseOption as CourseOptions) || "",
  );

  // Get filtered departments and courses
  const getDepartments = (faculty: Faculty | "") =>
    FACULTIES.find((f) => f.name === faculty)?.departments.map((d) => d.name) ||
    [];

  const getCourseOptions = (
    faculty: Faculty | "",
    department: Department | "",
  ) =>
    FACULTIES.flatMap((f) => f.departments).find(
      (d) =>
        d.name === department &&
        FACULTIES.some((f) => f.name === faculty && f.departments.includes(d)),
    )?.courseOptions || [];

  // Reset dependent fields when selections change
  useEffect(() => {
    if (!getDepartments(selectedFaculty).includes(selectedDepartment)) {
      setSelectedDepartment("");
      setSelectedCourse("");
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (
      !getCourseOptions(selectedFaculty, selectedDepartment).includes(
        selectedCourse,
      )
    ) {
      setSelectedCourse("");
    }
  }, [selectedDepartment]);

  return (
    <AuthForm>
      <FormSelect<Faculty>
        id="faculty"
        name="faculty"
        label="Faculty"
        options={FACULTIES.map((f) => f.name)}
        value={selectedFaculty}
        onValueChange={(value) => setSelectedFaculty(value)}
        required
      />

      <FormSelect<Department>
        id="department"
        name="department"
        label="Department"
        options={getDepartments(selectedFaculty)}
        value={selectedDepartment}
        onValueChange={(value) => setSelectedDepartment(value)}
        disabled={!selectedFaculty}
        required
      />

      <FormSelect<CourseOptions>
        id="courseOption"
        name="courseOption"
        label="Course"
        options={getCourseOptions(selectedFaculty, selectedDepartment)}
        value={selectedCourse}
        onValueChange={(value) => setSelectedCourse(value)}
        disabled={!selectedDepartment}
        required
      />

      <FormLabel htmlFor="registrationNumber">
        <FormSpan>Reg. Number</FormSpan>
        <FormInput
          id="registrationNumber"
          type="text"
          ref={regNumRef}
          defaultValue={user.registrationNumber}
          name="registrationNumber"
          placeholder="20/37474646/I"
          required
        />
      </FormLabel>

      <FormButton name="_action" value="step2" state={state}>
        Next
      </FormButton>
    </AuthForm>
  );
}

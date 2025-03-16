// faculties.config.ts
export const FACULTIES = [
  {
    name: "Computer Science",
    departments: [
      {
        name: "Software Engineering",
        courseOptions: [
          "Web Development",
          "Mobile Development",
          "Data Science",
        ],
      },
      {
        name: "Cybersecurity",
        courseOptions: ["Network Security", "Ethical Hacking"],
      },
    ],
  },
  {
    name: "Engineering",
    departments: [
      {
        name: "Mechanical Engineering",
        courseOptions: ["Thermodynamics", "Robotics"],
      },
      {
        name: "Electrical Engineering",
        courseOptions: ["Circuit Design", "Power Systems"],
      },
    ],
  },
] as const;

export type Faculty = (typeof FACULTIES)[number]["name"];

export type Department =
  (typeof FACULTIES)[number]["departments"][number]["name"];

export type CourseOptions =
  (typeof FACULTIES)[number]["departments"][number]["courseOptions"][number];

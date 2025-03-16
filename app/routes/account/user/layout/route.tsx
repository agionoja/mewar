import { restrictToMiddleware } from "~/session/auth.session";
import type { Route } from "./+types/route";
import { Outlet } from "react-router";
import { Role } from "~/models/user.model";

export const unstable_middleware = [restrictToMiddleware(Role.STUDENT)];

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return <Outlet />;
}

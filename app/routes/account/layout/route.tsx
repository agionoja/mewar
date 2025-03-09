import { Outlet } from "react-router";
import type { Route } from "./+types/route";
import { requireUser, userContext } from "~/session";

const sessionMiddleware: Route.unstable_MiddlewareFunction = async (
  { context, request },
  next,
) => {
  const user = await requireUser(request);
  context.set(userContext, user);

  return next();
};

export const unstable_middleware = [sessionMiddleware];

export default function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}

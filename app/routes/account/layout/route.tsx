import { Outlet } from "react-router";
import { authMiddleware } from "~/session/auth.session";

export const unstable_middleware = [authMiddleware];

export default function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}

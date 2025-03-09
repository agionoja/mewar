import { userContext } from "~/session";
import type { Route } from "./+types/route";
import { data } from "react-router";
import { sanitizeUser } from "~/utils/user-utils";

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  return data({ user: sanitizeUser(user.toObject()) }, { status: 200 });
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1>{loaderData.user.firstname}</h1>
    </>
  );
}

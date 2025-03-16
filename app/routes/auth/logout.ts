import type { Route } from "./+types/logout";
import { methodNotAllowed } from "~/utils/method-not-allowed";
import { href, redirect } from "react-router";
import { authSession, DashboardHref, getSession } from "~/session/auth.session";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request);
  switch (request.method) {
    case "POST": {
      throw redirect(href("/auth/login"), {
        headers: {
          "Set-Cookie": await authSession.destroySession(session),
        },
      });
    }
    default: {
      throw methodNotAllowed(request, ["POST"]);
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  const role = session.get("role");
  if (!role) throw redirect(href("/auth/login"));
  throw redirect(DashboardHref[role]);
}

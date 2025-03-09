import type { Route } from "./+types/index";
import { href, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  return redirect(href("/auth/register"));
}

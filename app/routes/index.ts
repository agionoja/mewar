import type { Route } from "./+types/index";
import { href, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  throw redirect(href("/auth/register"));
}

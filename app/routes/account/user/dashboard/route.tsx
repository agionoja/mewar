import { userContext } from "~/session/auth.session";
import type { Route } from "./+types/route";
import { data } from "react-router";
import { sanitizeUser } from "~/utils/user-utils";
import { queryClientContext } from "~/entry.client";
import { HttpStatus } from "~/utils/status";

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  return data(
    { user: sanitizeUser(user.toObject()) },
    { status: HttpStatus.OK },
  );
}

export async function clientLoader({
  context,
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const queryClient = context.get(queryClientContext);
  return queryClient.fetchQuery({
    queryKey: [new URL(request.url).pathname],
    queryFn: async () => await serverLoader(),
    staleTime: Infinity,
  });
}

clientLoader.hydrate = true as const;

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1>{loaderData.user.firstname} welcome to your dashboard</h1>
    </>
  );
}

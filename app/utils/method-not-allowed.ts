import { HttpStatus } from "~/utils/status";
import type { FormMethod } from "react-router";

export function methodNotAllowed(
  request: Pick<Request, "method">,
  methods: FormMethod[],
  message?: string,
) {
  return new Response(null, {
    status: HttpStatus.METHOD_NOT_ALLOWED,
    statusText: message || `CANNOT ${request.method}`,
    headers: {
      Allow: methods.join(", "),
    },
  });
}

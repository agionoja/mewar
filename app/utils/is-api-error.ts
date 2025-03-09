import type { APIError, APIResponse } from "~/utils/error.handler";

export function isAPIError<T, M extends string | undefined>(
  response?: APIResponse<T, M>,
): response is APIError {
  return response ? "error" in response : false;
}

import type { APIResponse } from "~/utils/error.handler";
import { data } from "react-router";

export function apiErrorResponse<
  T = null,
  M extends string | undefined = undefined,
>(response: APIResponse<T, M>) {
  return data(response, {
    status: response.statusCode,
    statusText: response.message,
  });
}

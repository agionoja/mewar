import type { APIError, APIResponse } from "~/utils/error.handler";
import { useEffect } from "react";
import { toast } from "sonner";
import { isAPIError } from "~/utils/is-api-error";

export function useApiErrorToast<T>(
  response: APIResponse<T> | undefined,
): APIError | undefined {
  useEffect(() => {
    if (response && isAPIError(response)) {
      console.error(response);
      toast.error(response.message);
    }
  }, [response]);

  return isAPIError(response) ? response : undefined;
}

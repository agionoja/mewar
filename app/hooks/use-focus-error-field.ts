import { useCallback } from "react";
import type { APIError } from "~/utils/error.handler";

export function useFocusErrorField<T>(error: APIError | undefined) {
  return useCallback(
    (field: keyof T) => (el: HTMLInputElement | null) => {
      if (el && error?.field === field) {
        el.select();
      }
    },
    [error],
  );
}

import { type RefObject, useCallback, useEffect } from "react";
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

export function useFocusError<T>(
  error?: APIError,
  ref?: RefObject<HTMLInputElement | null>,
  field?: keyof T,
) {
  useEffect(() => {
    if (error && ref?.current && error.field === field) {
      ref.current.select();
    }
  }, [error, ref, field]);
}

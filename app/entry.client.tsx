import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { unstable_createContext } from "react-router";
import { QueryClient } from "@tanstack/react-query";

export const queryClientContext = unstable_createContext<QueryClient>();
const queryClient = new QueryClient();

function unstable_getContext() {
  const map = new Map();
  map.set(queryClientContext, queryClient);
  return map;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter unstable_getContext={unstable_getContext} />
    </StrictMode>,
  );
});

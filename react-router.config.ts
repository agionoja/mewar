import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";
import { env } from "./app/env.config";

const isVercel = env.DEPLOYMENT_ENV === "vercel";

declare module "react-router" {
  interface Future {
    unstable_middleware: true;
  }
}

export default {
  ssr: true,
  presets: isVercel ? [vercelPreset()] : undefined,
  future: {
    unstable_middleware: true,
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true,
  },
} satisfies Config;

import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("routes/index.ts"),

  layout(
    "routes/auth/layout/route.tsx",
    prefix("auth", [
      route("login", "routes/auth/login/route.tsx"),
      route("register", "routes/auth/register/route.tsx"),
      route("forgot-password", "routes/auth/forgot-password/route.tsx"),
      route("reset-password/:token", "routes/auth/reset-password/route.tsx"),
    ]),
  ),

  layout("routes/account/layout/route.tsx", [
    // User Routes
    route("dashboard", "routes/account/user/dashboard/route.tsx"),

    //Admin Routes
    ...prefix("admin", [
      route("dashboard", "routes/account/admin/dashboard/route.tsx"),
    ]),

    //Settings Routes
    layout(
      "routes/account/settings/layout/route.tsx",
      prefix("settings", [
        route("details", "routes/account/settings/details/route.tsx"),
        route("security", "routes/account/settings/reset-password/route.tsx"),
      ]),
    ),
  ]),
] satisfies RouteConfig;

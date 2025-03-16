import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("routes/index.ts"),

  // Auth Routes
  layout(
    "routes/auth/layout/route.tsx",
    prefix("auth", [
      route("login", "routes/auth/login/route.tsx"),
      route("register", "routes/auth/register/route.tsx"),
      route("forgot-password", "routes/auth/forgot-password/route.tsx"),
      route("reset-password/:token", "routes/auth/reset-password/route.tsx"),
    ]),
  ),

  //Logout Route
  route("logout", "routes/auth/logout.ts"),

  layout("routes/account/layout/route.tsx", [
    // User Routes
    layout("routes/account/user/layout/route.tsx", [
      route("dashboard", "routes/account/user/dashboard/route.tsx"),
    ]),

    //Admin Routes
    layout(
      "routes/account/admin/layout/route.tsx",
      prefix("admin", [
        route("dashboard", "routes/account/admin/dashboard/route.tsx"),
      ]),
    ),

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

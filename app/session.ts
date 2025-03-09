import {
  createCookieSessionStorage,
  href,
  redirect,
  type Session,
  unstable_createContext,
} from "react-router";
import { baseCookiesOptions } from "~/cookies/base-cookie-options";
import { Role, UserModel } from "~/models/user.model";
import ms from "ms";
import { env } from "~/env.config";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import jwt from "~/utils/jwt";
import { handleError } from "~/utils/error.handler";
import { isAPIError } from "~/utils/is-api-error";

export const userSession = createCookieSessionStorage<{
  token: string;
  role: Role;
}>({
  cookie: {
    ...baseCookiesOptions,
    name: "__session",
  },
});

export const DashboardHref = {
  [Role.ADMIN]: href("/admin/dashboard"),
  [Role.STUDENT]: href("/dashboard"),
};

export async function getSession(request: Request) {
  return userSession.getSession(request.headers.get("Cookie"));
}
export async function createSession(
  {
    remember = false,
    token,
    request,
    role,
    redirectTo = DashboardHref[role],
    message,
    maxAge = ms(env.SESSION_EXPIRES as ms.StringValue) / 1000,
  }: {
    remember?: boolean;
    request: Request;
    token: string;
    role: Role;
    maxAge?: number;
    redirectTo?: string;
    message: string;
  },
  init?: ResponseInit,
) {
  const session = await getSession(request);
  session.set("token", await jwt.sign({ _id: token }));
  session.set("role", role);
  const newHeaders = new Headers(init?.headers);
  newHeaders.append(
    "Set-Cookie",
    await userSession.commitSession(session, {
      maxAge: remember ? maxAge : undefined,
    }),
  );

  throw await redirectWithSuccess(redirectTo, message, { headers: newHeaders });
}
export async function redirectIfHasSession(request: Request) {
  const session = await getSession(request);
  if (session.has("token") && session.has("role")) {
    const role = session.get("role") as Role;
    throw redirect(DashboardHref[role]);
  }
}
async function redirectToLogin(
  message: string,
  session: Session,
  init: ResponseInit = {},
) {
  const { headers, ...rest } = init;
  return redirectWithError(href("/auth/login"), message, {
    headers: {
      "Set-Cookie": await userSession.destroySession(session),
      ...headers,
    },
    ...rest,
  });
}

export const userContext =
  unstable_createContext<
    ReturnType<typeof requireUser> extends Promise<infer U> ? U : never
  >();

export async function requireUser(request: Request) {
  const session = await getSession(request);
  const token = session.get("token");
  const role = session.get("role");

  if (token && role) {
    const response = await handleError(request, async () => {
      return {
        data: await jwt.verify(token),
        message: undefined,
        statusCode: 303,
      };
    });

    if (isAPIError(response)) {
      throw await redirectToLogin(response.message, session, {
        status: response.statusCode,
      });
    }

    const user = await UserModel.findById(response.data._id)
      .select("+password")
      .exec();

    if (!user) {
      throw await redirectToLogin(
        "User associated with this account no longer exists.",
        session,
      );
    }

    if (user.passwordChangedAfterJwt(response.data.iat)) {
      throw await redirectToLogin(
        "Password has been changed since login.",
        session,
      );
    }

    if (user.emailChangedAfterJwt(response.data.iat)) {
      throw await redirectToLogin(
        "Email has been changed since login.",
        session,
      );
    }

    return user;
  } else {
    throw await redirectToLogin("Please log in to access this page", session);
  }
}

export function restrictTo() {}

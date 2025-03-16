import {
  createCookieSessionStorage,
  href,
  redirect,
  type Session,
  unstable_createContext,
  type unstable_MiddlewareFunction,
} from "react-router";
import { Role, User, UserModel } from "~/models/user.model";
import ms from "ms";
import { env } from "~/env.config";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import jwt from "~/utils/jwt";
import { handleError } from "~/utils/error.handler";
import { isAPIError } from "~/utils/is-api-error";
import type { DocumentType } from "@typegoose/typegoose";
import { HttpStatus } from "~/utils/status";
import { baseCookiesOptions } from "~/session/base-cookie-options";

export const authSession = createCookieSessionStorage<{
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
  return authSession.getSession(request.headers.get("Cookie"));
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
  { headers, ...rest }: ResponseInit = {},
) {
  const session = await getSession(request);
  session.set("token", await jwt.sign({ sub: token }));
  session.set("role", role);
  const newHeaders = new Headers(headers);
  newHeaders.append(
    "Set-Cookie",
    await authSession.commitSession(session, {
      maxAge: remember ? maxAge : undefined,
    }),
  );

  throw await redirectWithSuccess(redirectTo, message, {
    headers: newHeaders,
    ...rest,
  });
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
  url: URL,
  init: ResponseInit = {},
) {
  const { headers, ...rest } = init;
  return redirectWithError(
    encodeURI(
      href("/auth/login") + `?redirect=${url.pathname + url.search + url.hash}`,
    ),
    message,
    {
      headers: {
        "Set-Cookie": await authSession.destroySession(session),
        ...headers,
      },
      ...rest,
    },
  );
}

export const userContext =
  unstable_createContext<
    DocumentType<
      Omit<
        User,
        "trackPasswordChanges" | "trackEmailChanges" | "hashPasswordIfModified"
      >
    >
  >();

export const authMiddleware: unstable_MiddlewareFunction = async ({
  context,
  request,
}) => {
  const session = await getSession(request);
  const token = session.get("token");
  const role = session.get("role");
  const url = new URL(request.url);

  if (!token || !role) {
    throw await redirectToLogin(
      "Please log in to access this page.",
      session,
      url,
    );
  }

  const response = await handleError(request, async () => {
    return {
      data: await jwt.verify(token),
      message: undefined,
      statusCode: HttpStatus.FOUND,
    };
  });

  if (isAPIError(response)) {
    throw await redirectToLogin(response.message, session, url);
  }

  const user = await UserModel.findById(response.data.sub)
    .select("+password")
    .exec();

  if (!user) {
    throw await redirectToLogin(
      "User associated with this account no longer exists.",
      session,
      url,
    );
  }

  if (user.passwordChangedAfterJwt(response.data.iat)) {
    throw await redirectToLogin(
      "Password has been changed since login.",
      session,
      url,
    );
  }

  if (user.emailChangedAfterJwt(response.data.iat)) {
    throw await redirectToLogin(
      "Email has been changed since login.",
      session,
      url,
    );
  }

  context.set(userContext, user);
};

export const restrictToMiddleware = (
  ...roles: Role[]
): unstable_MiddlewareFunction => {
  return async ({ context }) => {
    const user = context.get(userContext);

    if (!roles.includes(user.role)) {
      throw await redirectWithError(
        DashboardHref[user.role],
        "You do not have permission to access this page.",
      );
    }
  };
};

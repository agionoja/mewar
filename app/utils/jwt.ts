import jsonwebtoken from "jsonwebtoken";
import { env } from "~/env.config";
import ms from "ms";

interface Decoded extends jsonwebtoken.JwtPayload {
  _id: string;
}

function isJwtPayload(decoded: any): decoded is jsonwebtoken.JwtPayload {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    !Array.isArray(decoded) &&
    typeof decoded.iat === "number" &&
    typeof decoded.exp === "number"
  );
}

export function sign({ _id }: Pick<Decoded, "_id">): Promise<string> {
  return new Promise((resolve, reject) => {
    jsonwebtoken.sign(
      { _id },
      env.SESSION_SECRET,
      { expiresIn: env.SESSION_EXPIRES as ms.StringValue },
      (err, token) => {
        if (err) return reject(err);
        if (!token) return reject(new Error("Token is undefined"));
        return resolve(token);
      },
    );
  });
}

export function verify(token: string): Promise<Decoded> {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, env.SESSION_SECRET, (err, decoded) => {
      if (err) return reject(err);

      if (!isJwtPayload(decoded)) {
        return reject(new Error("Invalid JWT token"));
      }
      return resolve(decoded as Decoded);
    });
  });
}

export default { sign, verify };

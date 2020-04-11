import axios from "axios";
import { Request, Response } from "express";
import querystring from "querystring";

import { clientId, clientSecret } from "../credentials.json";

export const generateRandomString = (length: number) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const getRedirectUri = (req: Request) =>
  `${req.headers["x-forwarded-proto"] || req.protocol}://${
    req.headers["x-forwarded-host"] || req.get("host")
  }/auth/callback/`;

async function refreshToken(refreshToken: string) {
  const {
    data: { access_token },
  } = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
    }
  );
  return access_token;
}

export async function withFreshToken(
  req: Request,
  res: Response,
  callback: (cookies: any) => Promise<Response>
) {
  const { cookies } = req;
  try {
    return await callback(cookies);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 401) {
      if (JSON.parse(cookies.__session || "{}").refreshToken) {
        try {
          const accessToken = await refreshToken(
            JSON.parse(cookies.__session || "{}").refreshToken
          );

          return await callback({ ...cookies, accessToken });
        } catch {}
      }

      return res.status(401).send();
    }

    return res.status(500).send();
  }
}

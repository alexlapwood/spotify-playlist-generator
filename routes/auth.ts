import express from "express";
import axios from "axios";
import querystring from "querystring";

import { generateRandomString, getRedirectUri } from "../helpers/spotify";

import { clientId, clientSecret } from "../credentials.json";

const stateKey = "spotify_auth_state";

export const auth = express.Router();

auth.get("/login", (req, res) => {
  const scope =
    "playlist-read-private playlist-modify-private playlist-read-collaborative  playlist-modify-public";
  const state = generateRandomString(16);

  return res
    .cookie(
      "__session",
      JSON.stringify({
        ...JSON.parse(req.cookies.__session || "{}"),
        [stateKey]: state,
      }),
      { path: "/" }
    )
    .redirect(
      "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: clientId,
          scope: scope,
          redirect_uri: getRedirectUri(req),
          state: state,
          show_dialog: true,
        })
    );
});

auth.get("/callback", async (req, res) => {
  res.cookie(
    "__session",
    JSON.stringify({ ...JSON.parse(req.cookies.__session), [stateKey]: null }),
    { path: "/" }
  );

  try {
    if (
      !req.query.state ||
      req.query.state !== JSON.parse(req.cookies.__session || "{}")[stateKey]
    ) {
      throw new Error();
    }

    const {
      data: { access_token, refresh_token },
    } = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: req.query.code,
        redirect_uri: getRedirectUri(req),
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
      }
    );

    return res
      .cookie(
        "__session",
        JSON.stringify({
          ...JSON.parse(req.cookies.__session),
          accessToken: access_token,
          refreshToken: refresh_token,
        }),
        { path: "/" }
      )
      .redirect("/");
  } catch {
    return res.redirect("/auth/login");
  }
});

auth.post("/logout", (req, res) => {
  return res.clearCookie("__session", { path: "/" }).sendStatus(200);
});

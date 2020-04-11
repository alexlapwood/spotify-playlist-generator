import * as functions from "firebase-functions";

import app from "../../index";

const api = functions.https.onRequest(app);

module.exports = {
  api,
};

import * as functions from "firebase-functions";

import app from "../../index";

const api = functions.https.onRequest(app);

// No changes eh

module.exports = {
  api,
};

import "array-flat-polyfill";
import express from "express";
import cookieParser from "cookie-parser";

import { api } from "./routes/api";
import { auth } from "./routes/auth";

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use(express.static(__dirname + "/UI/build"));

app.use("/api", api);
app.use("/auth", auth);

app.listen(8888);

export default app;

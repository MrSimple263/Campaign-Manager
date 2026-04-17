import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json } from "express";

import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/index.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(json());
app.use(cookieParser());

// Routes
app.use("/api", routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

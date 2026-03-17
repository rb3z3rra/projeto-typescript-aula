import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import errorHandler from "./middleware/errorHandler.js";
import indexRouter from "./routes/index.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  }));

  app.use(helmet({
    contentSecurityPolicy: false
  }));

  app.use(cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

  app.use(morgan("dev"));
  app.use(express.json());
  app.use(compression({ threshold: 1024 }));

  app.use("/api", indexRouter);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
}
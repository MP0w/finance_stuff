import { configDotenv } from "dotenv";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

configDotenv({ path: ".env.local" });

Sentry.init({
  dsn: "https://c7970c79b7a58d700737f7a34fc57c8b@o4507960601214976.ingest.de.sentry.io/4507960663670864",
  integrations: [
    nodeProfilingIntegration(),
    Sentry.captureConsoleIntegration({
      levels: ["error", "warn"],
    }),
  ],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

import express, { NextFunction, Request, Response } from "express";
import { router } from "./endpoints/router";
import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { startWebsocketServer } from "./ai-chat/websocket";
import multer from "multer";

const cert: admin.ServiceAccount = JSON.parse(process.env.FIREBASE_CERT!);

initializeApp({
  credential: admin.credential.cert(cert),
});

const app = express();
const PORT = process.env.PORT || 4000;

Sentry.setupExpressErrorHandler(app);

app.use(express.json());

router(app);

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File size exceeds the 2MB limit" });
      return;
    }
  }

  console.error(
    `error handled in ${req.method} ${req.path}\n\n ${err.stack}\n-----`
  );
  res.status(500).send({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startWebsocketServer();

import { configDotenv } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { router } from "./endpoints/router";
import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";

configDotenv({ path: ".env.local" });

const cert: admin.ServiceAccount = JSON.parse(process.env.FIREBASE_CERT!);

initializeApp({
  credential: admin.credential.cert(cert),
});

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

router(app);

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  console.error(
    `error handled in ${req.method} ${req.path}\n\n ${err.stack}\n-----`
  );
  res.status(500).send({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

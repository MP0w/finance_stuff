import { configDotenv } from "dotenv";
import express from "express";
import { router } from "./endpoints/router";
import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";

configDotenv({ path: ".env.local" });

const cert: admin.ServiceAccount = JSON.parse(process.env.FIREBASE_CERT!);

initializeApp({
  credential: admin.credential.cert(cert),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

router(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

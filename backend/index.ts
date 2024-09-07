import { configDotenv } from "dotenv";
import express from "express";
import { router } from "./endpoints/router";

configDotenv({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

router(app);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
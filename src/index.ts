import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import antiscamRouter from "./routes/antiscam";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/antiscam", antiscamRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: "Route not found" },
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  const baseUrl = `http://localhost:${config.port}`;

  console.log("\nAntiscam API is running");
  console.log(`  Base URL:    ${baseUrl}`);
  console.log(`  Health:      ${baseUrl}/health`);
  console.log(`  Scan:        ${baseUrl}/api/antiscam?type=example.com`);
  console.log(`  API key:     ${config.scamlensApiKey ? "configured" : "not set (free tier still works)"}\n`);
});

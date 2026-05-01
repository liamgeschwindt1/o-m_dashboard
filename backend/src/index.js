import "dotenv/config";
import express from "express";
import cors from "cors";
import routesRouter from "./routes/routes.js";
import recipientsRouter from "./routes/recipients.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, Railway health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ── Health ─────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Routers ────────────────────────────────────────────────────────────────────
app.use("/api/routes", routesRouter);
app.use("/api/routes", recipientsRouter);

// ── Error handler ──────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`O&M Studio API listening on port ${PORT}`);
});

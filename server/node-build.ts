import path from "path";
import { createServer } from "./index";
import express from "express";
import { db } from "./db";

async function main() {
  console.log("🔌 Connecting to PostgreSQL...");
  await db.init();

  const app = createServer();
  const port = Number(process.env.PORT) || 3000;
  const distPath = path.join(process.cwd(), "dist", "spa");

  app.use(express.static(distPath));
  app.use((req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(path.join(distPath, "index.html"));
  });

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`   Frontend: http://localhost:${port}`);
    console.log(`   API:      http://localhost:${port}/api`);
    console.log(`\nPress Ctrl+C to stop\n`);
  });

  process.on("SIGTERM", () => server.close(() => process.exit(0)));
  process.on("SIGINT",  () => server.close(() => process.exit(0)));
  setInterval(() => {}, 1 << 30);
}

main().catch((e) => { console.error("❌ Startup failed:", e.message); process.exit(1); });

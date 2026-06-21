import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import express from "express";
import app from "./server/app.js";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// ======================== VITE & STATIC FILES SERVING ========================

async function startServer() {
  // Vite dev mode integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Statically serving production build output from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Derash Server is active on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

// Ensure the local server only starts if NOT running in AWS Lambda / Netlify functions
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY) {
  startServer();
}

export default app;

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import "./config/firebase.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`DKO API listening on http://localhost:${env.PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${env.PORT} is already in use. The DKO backend may already be running. Stop the existing process or change PORT in backend/.env.`
    );
    process.exit(1);
  }

  throw error;
});

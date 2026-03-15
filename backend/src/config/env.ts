import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { cleanEnv, port, str } from "envalid";

const currentDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(currentDir, "../../.env");

process.loadEnvFile(envFilePath);

export const env = cleanEnv(process.env, {
  PORT: port({ default: 4000 }),
  CLIENT_ORIGIN: str({ default: "http://localhost:3000" }),
  FIREBASE_PROJECT_ID: str(),
  FIREBASE_CLIENT_EMAIL: str(),
  FIREBASE_PRIVATE_KEY: str(),
  GEMINI_API_KEY: str({ default: "" }),
  CLOUDINARY_CLOUD_NAME: str({ default: "" }),
  CLOUDINARY_API_KEY: str({ default: "" }),
  CLOUDINARY_API_SECRET: str({ default: "" })
});

export function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

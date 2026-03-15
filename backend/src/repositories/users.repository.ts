import type { DecodedIdToken } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import type { User } from "@dko/shared";
import { adminDb } from "../config/firebase.js";
import { serializeDocument } from "../utils/firestore.js";

interface UpsertOptions {
  name?: string;
  language?: User["language"];
  region?: string;
}

const usersCollection = adminDb.collection("users");

function inferRoleFromEmail(email?: string | null) {
  if (!email) {
    return "farmer" as const;
  }

  const normalized = email.toLowerCase();
  if (normalized.startsWith("admin@") || normalized.includes("+admin@")) {
    return "admin" as const;
  }

  if (normalized.startsWith("officer@") || normalized.includes("+officer@") || normalized.includes("officer")) {
    return "officer" as const;
  }

  return "farmer" as const;
}

export const usersRepository = {
  async findById(userId: string) {
    const snapshot = await usersCollection.doc(userId).get();
    if (!snapshot.exists) {
      return null;
    }

    return serializeDocument<User>(snapshot.id, snapshot.data() ?? {});
  },

  async upsertFromDecodedToken(decoded: DecodedIdToken, input: UpsertOptions) {
    const reference = usersCollection.doc(decoded.uid);
    const snapshot = await reference.get();
    const existing = snapshot.data() ?? {};

    const nextUser = {
      userId: decoded.uid,
      name:
        input.name ||
        (typeof existing.name === "string" ? existing.name : undefined) ||
        decoded.name ||
        "Farmer",
      phone:
        decoded.phone_number ||
        (typeof existing.phone === "string" ? existing.phone : undefined) ||
        null,
      email:
        decoded.email ||
        (typeof existing.email === "string" ? existing.email : undefined) ||
        null,
      role: existing.role || inferRoleFromEmail(decoded.email),
      region:
        input.region ||
        (typeof existing.region === "string" ? existing.region : undefined) ||
        null,
      language:
        input.language ||
        (existing.language as User["language"] | undefined) ||
        "en",
      isActive: typeof existing.isActive === "boolean" ? existing.isActive : true,
      createdAt: snapshot.exists ? existing.createdAt : FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp()
    };

    await reference.set(nextUser, { merge: true });
    const saved = await reference.get();

    return serializeDocument<User>(saved.id, saved.data() ?? {});
  }
};

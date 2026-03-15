"use client";

import type { User as AppUser } from "@dko/shared";
import type { User as FirebaseUser } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { apiClient } from "./api";
import { assertFirebaseClient, firebaseAuth } from "./firebase";
import {
  clearSessionStorage,
  storeCurrentUser,
  storeIdToken
} from "./session";

export async function signInFarmer(email: string, password: string) {
  const { firebaseAuth: auth } = assertFirebaseClient();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return syncSessionWithBackend(credential.user);
}

export async function registerFarmer(
  email: string,
  password: string,
  profile?: { name?: string; language?: AppUser["language"] }
) {
  const { firebaseAuth: auth } = assertFirebaseClient();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return syncSessionWithBackend(credential.user, profile);
}

export async function signInOfficer(email: string, password: string) {
  const { firebaseAuth: auth } = assertFirebaseClient();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return syncSessionWithBackend(credential.user);
}

export async function syncSessionWithBackend(
  firebaseUser: FirebaseUser,
  profile?: { name?: string; language?: AppUser["language"] }
) {
  const idToken = await firebaseUser.getIdToken(true);
  storeIdToken(idToken);

  const result = await apiClient.post<{ success: true; data: { user: AppUser } }>("/auth/verify", {
    idToken,
    ...profile
  });

  const user = result.data.data.user;
  storeCurrentUser(user);
  return user;
}

export async function signOutSession() {
  clearSessionStorage();
  if (firebaseAuth?.currentUser) {
    await signOut(firebaseAuth);
  }
}

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const hasFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId
].every(Boolean);

const canInitializeFirebase = typeof window !== "undefined" && hasFirebaseConfig;

export const firebaseApp: FirebaseApp | null = canInitializeFirebase
  ? getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!firebaseApp) {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  return getMessaging(firebaseApp);
}

export function assertFirebaseClient() {
  if (!firebaseAuth || !firebaseApp) {
    throw new Error(
      "Firebase web config is missing. Set NEXT_PUBLIC_FIREBASE_* values in app/.env.local."
    );
  }

  return {
    firebaseApp,
    firebaseAuth
  };
}

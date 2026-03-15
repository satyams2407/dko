"use client";

import type { User } from "@dko/shared";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { signOutSession, syncSessionWithBackend } from "@/lib/auth";
import { firebaseAuth } from "@/lib/firebase";
import { getStoredCurrentUser } from "@/lib/session";

interface AuthContextValue {
  appUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [appUser, setAppUser] = useState<User | null>(getStoredCurrentUser());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setFirebaseUser(nextUser);

      if (!nextUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      try {
        const syncedUser = await syncSessionWithBackend(nextUser);
        setAppUser(syncedUser);
      } catch (error) {
        console.error("Failed to sync Firebase session with backend", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      appUser,
      firebaseUser,
      loading,
      refreshSession: async () => {
        if (!firebaseAuth?.currentUser) {
          setAppUser(null);
          return;
        }

        const syncedUser = await syncSessionWithBackend(firebaseAuth.currentUser);
        setAppUser(syncedUser);
      },
      logout: async () => {
        await signOutSession();
        setAppUser(null);
        setFirebaseUser(null);
      }
    }),
    [appUser, firebaseUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

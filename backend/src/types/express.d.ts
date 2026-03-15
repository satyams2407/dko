import type { UserRole } from "@dko/shared";

export interface AuthenticatedUser {
  uid: string;
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export {};

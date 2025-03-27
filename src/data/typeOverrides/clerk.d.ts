import { UserRole } from "@/drizzle/schema";

export {};

declare global {
  interface CustomJwtSessionClaims {
    dbId?: string;
    role?: UserRole;
    onboardingComplete?: boolean;
  }

  interface UserPublicMetadata {
    dbId?: string;
    role?: UserRole;
    onboardingComplete?: boolean;
  }
}

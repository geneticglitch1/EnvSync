import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    preferredUsername?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    preferredUsername?: string;
  }
}

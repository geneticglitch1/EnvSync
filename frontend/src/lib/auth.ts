import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: requiredEnv("KEYCLOAK_CLIENT_ID"),
      clientSecret: requiredEnv("KEYCLOAK_CLIENT_SECRET"),
      issuer: requiredEnv("KEYCLOAK_ISSUER"),
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }

      if (profile && typeof profile === "object" && "preferred_username" in profile) {
        token.preferredUsername = String(profile.preferred_username);
      }

      return token;
    },
    async session({ session, token }) {
      session.preferredUsername = typeof token.preferredUsername === "string" ? token.preferredUsername : undefined;

      return session;
    },
  },
};

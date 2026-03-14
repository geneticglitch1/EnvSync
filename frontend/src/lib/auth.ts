import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const issuer = requiredEnv("KEYCLOAK_ISSUER");
  const tokenUrl = `${issuer}/protocol/openid-connect/token`;

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: requiredEnv("KEYCLOAK_CLIENT_ID"),
      client_secret: requiredEnv("KEYCLOAK_CLIENT_SECRET"),
      refresh_token: String(token.refreshToken ?? ""),
    }),
  });

  const refreshed = await res.json();

  if (!res.ok) {
    // Refresh failed — force re-login by returning an error token
    return { ...token, error: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: refreshed.access_token,
    idToken: refreshed.id_token ?? token.idToken,
    refreshToken: refreshed.refresh_token ?? token.refreshToken,
    // expires_in is seconds from now
    accessTokenExpiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: requiredEnv("KEYCLOAK_CLIENT_ID"),
      clientSecret: requiredEnv("KEYCLOAK_CLIENT_SECRET"),
      issuer: requiredEnv("KEYCLOAK_ISSUER"),
      authorization: { params: { scope: "openid email profile offline_access" } },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign-in — store everything from the provider
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpiresAt = account.expires_at; // unix seconds
      }

      if (profile && typeof profile === "object" && "preferred_username" in profile) {
        token.preferredUsername = String(profile.preferred_username);
      }

      // Token still valid (with 60-second buffer)
      const expiresAt = typeof token.accessTokenExpiresAt === "number"
        ? token.accessTokenExpiresAt
        : 0;
      if (Math.floor(Date.now() / 1000) < expiresAt - 60) {
        return token;
      }

      // Access token expired — try to refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.preferredUsername = typeof token.preferredUsername === "string"
        ? token.preferredUsername
        : undefined;
      session.accessToken = typeof token.accessToken === "string"
        ? token.accessToken
        : undefined;
      // Expose refresh errors to the client so it can redirect to sign-in
      if (token.error) {
        (session as typeof session & { error?: string }).error = token.error as string;
      }
      return session;
    },
  },
};

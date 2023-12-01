import NextAuth from "next-auth/next";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticate } from "@/services/authService";
import refreshAccessToken from "@/services/refreshAccessToken";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          name: "email",
          label: "email",
          type: "email",
          placeholder: "Email",
        },
        password: {
          name: "password",
          label: "password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        if (typeof credentials !== "undefined") {
          const res = await authenticate({
            email: credentials.email,
            password: credentials.password,
          });
          if (typeof res !== "undefined") {
            return { ...res };
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }: any) {
      console.log("JWT Callback - Start");
      if (user && account) {
        return {
          userId: user?.id,
          token: user?.token,
          accessTokenExpires: Date.now() + parseInt(user?.expiresIn, 10) * 1000,
          refreshToken: user?.tokenRefresh,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        console.log("Token is still valid");
        return token;
      } else {
        console.log("Token expired. Attempting to refresh...");
        const refreshedToken = await refreshAccessToken(token.refreshToken);
        console.log("Refreshed token:", refreshedToken);
        return {
          ...token,
          token: refreshedToken.token,
          refreshToken: refreshedToken.tokenRefresh,
          accessTokenExpires:
            Date.now() + parseInt(refreshedToken.expiresIn, 10) * 1000,
        };
      }
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

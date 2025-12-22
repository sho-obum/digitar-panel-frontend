import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";
import NextAuth, { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;
if (!JWT_SECRET) throw new Error("❌ Missing NEXTAUTH_SECRET in environment variables");

function generateAccessToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullname: user.fullname,
      team_id: user.team_id
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

async function logAuthEvent({ userId, email, status, message, req }: any) {
  try {
    const ip = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || null;
    const userAgent = req?.headers?.["user-agent"] || null;
    await pool.query(
      "INSERT INTO login_logs (user_id, email, status, message, ip_address, user_agent) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)",
      [userId || null, email || null, status, message || null, ip, userAgent]
    );
  } catch (err) {
    console.error("❌ Failed to write auth log:", err);
  }
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: JWT_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            await logAuthEvent({
              email: credentials?.email,
              status: "failed",
              message: "Missing credentials",
              req,
            });
            return null;
          }

          const [rows]: any = await pool.query(
            "SELECT BIN_TO_UUID(u.id) as id, fullname, email, r.name as role, password_hash,BIN_TO_UUID(u.team_id) as team_id FROM users u JOIN roles r ON r.id= u.role_id WHERE email = ? AND status='active' LIMIT 1",
            [credentials.email]
          );
          const user = rows?.[0];
          if (!user) {
            await logAuthEvent({
              email: credentials.email,
              status: "failed",
              message: "Invalid Email Or password",
              req,
            });
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!isValid) {
            await logAuthEvent({
              userId: user.id,
              email: user.email,
              status: "failed",
              message: "Invalid Email Or password",
              req,
            });
            return null;
          }

          await logAuthEvent({
            userId: user.id,
            email: user.email,
            status: "success",
            message: "Login successful",
            req,
          });

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: user.fullname,
            team_id:user.team_id
          };
        } catch (error) {
          console.error("❌ Authorize error:", error);
          await logAuthEvent({
            email: credentials?.email,
            status: "error",
            message: "Authorize error",
            req,
          });
          return null;
        }
      },
    }),
  ],

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    async encode({ token }) {
      if (!token) return "";
      const cleanToken = { ...token };
      delete (cleanToken as any).exp; // 🩵 remove existing exp before signing
      return jwt.sign(cleanToken, JWT_SECRET, { expiresIn: "10d" });
    },
    async decode({ token }): Promise<JWT | null> {
      if (!token) return null;
      try {
        const verified = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        return verified as JWT;
      } catch {
        return null;
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial login
      if (user) {
        token.id = String(user.id);
        token.email = user.email;
        token.role = user.role;
        token.fullname = user.fullname;
        token.team_id = String(user.team_id),
        token.accessToken = generateAccessToken(user);
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        return token;
      }

      // If access token still valid, reuse
      if (Date.now() < (token.accessTokenExpires as number)) return token;

      // Refresh access token
      try {
        const [rows]: any = await pool.query("SELECT BIN_TO_UUID(u.id) as id, fullname, email, r.name as role, password_hash,BIN_TO_UUID(u.team_id) as team_id FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = UUID_TO_BIN(?) AND status='active'", [token.id]);
        const userFromDB = rows?.[0];
        if (!userFromDB) throw new Error("User not found during refresh");

        token.accessToken = generateAccessToken(userFromDB);
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;

        await logAuthEvent({
          userId: userFromDB.id,
          email: userFromDB.email,
          status: "refresh",
          message: "Access token refreshed",
        });

        return token;
      } catch (error) {
        console.error("❌ Token refresh failed:", error);
        await logAuthEvent({
          userId: token.id,
          email: token.email,
          status: "error",
          message: "Token refresh failed",
        });
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
        fullname: token.fullname,
        team_id:token.team_id
      };
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production" ? true : false,
      },
    },
  },
};
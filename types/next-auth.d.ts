import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number | string;
      role: string;
      fullname: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
    accessToken?: string;
    error?: string;
  }

  interface User extends DefaultUser {
    id: number | string;
    role: string;
    fullname: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number | string;
    role: string;
    fullname: string;
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      phone: string;
      phoneVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    phone: string;
    phoneVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    phone: string;
    phoneVerified: boolean;
  }
}

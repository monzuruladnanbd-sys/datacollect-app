import { SessionOptions } from "iron-session";

export type Role = "submitter" | "reviewer" | "approver" | "admin";
export type User = { id: string; name: string; email: string; role: Role; };
export type SessionData = { user?: User };

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || "dev_password_should_be_32+_chars________________",
  cookieName: process.env.SESSION_COOKIE_NAME || "wb_session",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

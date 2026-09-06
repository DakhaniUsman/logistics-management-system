"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export interface LoginState {
  error: string | null;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  if (!email.trim() || !password.trim()) {
    return { error: "Email and password are required" };
  }

  const envEmail = (process.env.AUTH_EMAIL!).trim().toLowerCase();
  const envPassword = (process.env.AUTH_PASSWORD!).trim();

  const inputEmail = email.trim().toLowerCase();
  const inputPassword = password.trim();

  if (inputEmail !== envEmail || inputPassword !== envPassword) {
    return { error: "Invalid email or password" };
  }

  const token = await createSessionToken(inputEmail);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  const targetPath = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
  redirect(targetPath);
}

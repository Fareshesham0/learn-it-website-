"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPublicSiteUrl } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/auth-state";
import type { LearningMode } from "@/lib/supabase/database.types";

const learningModes: LearningMode[] = ["Explorer", "Learner", "Technical"];

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getPassword(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Supabase is not configured")) {
    return error.message;
  }
  return error instanceof Error ? error.message : "We couldn't complete that request. Please try again.";
}

function getCallbackUrl(next: string) {
  const callback = new URL("/auth/callback", getPublicSiteUrl());
  callback.searchParams.set("next", next);
  return callback.toString();
}

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const displayName = getText(formData, "display_name");
  const email = getText(formData, "email").toLowerCase();
  const password = getPassword(formData, "password");
  const confirmPassword = getPassword(formData, "confirm_password");

  if (displayName.length < 1 || displayName.length > 80) {
    return { status: "error", message: "Enter a display name between 1 and 80 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { status: "error", message: "Use a password with at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { status: "error", message: "The passwords don't match." };
  }

  let hasSession = false;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getCallbackUrl("/profile"),
        data: { display_name: displayName },
      },
    });

    if (error) return { status: "error", message: error.message };
    hasSession = Boolean(data.session);
  } catch (error) {
    return { status: "error", message: getErrorMessage(error) };
  }

  if (hasSession) redirect("/profile");
  return { status: "success", message: "Check your email for a verification link to finish creating your account." };
}

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = getText(formData, "email").toLowerCase();
  const password = getPassword(formData, "password");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  let errorMessage: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    errorMessage = error?.message ?? null;
  } catch (error) {
    errorMessage = getErrorMessage(error);
  }

  if (errorMessage) return { status: "error", message: errorMessage };
  redirect("/profile");
}

export async function signOutAction() {
  let failed = false;
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    failed = Boolean(error);
  } catch {
    failed = true;
  }

  if (failed) redirect("/login?notice=signout-failed");
  redirect("/");
}

export async function requestPasswordResetAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = getText(formData, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getCallbackUrl("/reset-password"),
    });
    if (error) return { status: "error", message: error.message };
    return { status: "success", message: "If an account matches that email, a password reset link is on its way." };
  } catch (error) {
    return { status: "error", message: getErrorMessage(error) };
  }
}

export async function updatePasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = getPassword(formData, "password");
  const confirmPassword = getPassword(formData, "confirm_password");
  if (password.length < 8) return { status: "error", message: "Use a password with at least 8 characters." };
  if (password !== confirmPassword) return { status: "error", message: "The passwords don't match." };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { status: "error", message: "Your reset link is invalid or expired. Request a new one to continue." };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { status: "error", message: error.message };
    return { status: "success", message: "Your password has been updated. You can now sign in with it." };
  } catch (error) {
    return { status: "error", message: getErrorMessage(error) };
  }
}

export async function updateProfileAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const displayName = getText(formData, "display_name");
  const learningMode = getText(formData, "learning_mode");
  if (displayName.length < 1 || displayName.length > 80) {
    return { status: "error", message: "Enter a display name between 1 and 80 characters." };
  }
  if (!learningModes.includes(learningMode as LearningMode)) {
    return { status: "error", message: "Choose one of the available learning modes." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { status: "error", message: "Sign in again to update your profile." };

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, learning_mode: learningMode as LearningMode })
      .eq("user_id", user.id);

    if (error) return { status: "error", message: error.message };
    revalidatePath("/profile");
    return { status: "success", message: "Your profile has been updated." };
  } catch (error) {
    return { status: "error", message: getErrorMessage(error) };
  }
}
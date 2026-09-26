"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  requestPasswordResetAction,
  signUpAction,
  updatePasswordAction,
} from "@/app/actions/auth";
import type { AuthActionState } from "@/lib/auth-state";
import { Button } from "@/components/site-ui";

type AuthFormVariant = "signup" | "login" | "forgot-password" | "reset-password";

const actionByVariant = {
  signup: signUpAction,
  login: loginAction,
  "forgot-password": requestPasswordResetAction,
  "reset-password": updatePasswordAction,
} satisfies Record<AuthFormVariant, (state: AuthActionState, formData: FormData) => Promise<AuthActionState>>;

const buttonLabel: Record<AuthFormVariant, string> = {
  signup: "Create account",
  login: "Sign in",
  "forgot-password": "Send reset link",
  "reset-password": "Update password",
};

const pendingLabel: Record<AuthFormVariant, string> = {
  signup: "Creating account...",
  login: "Signing in...",
  "forgot-password": "Sending link...",
  "reset-password": "Updating password...",
};

function AuthField({
  id,
  label,
  type = "text",
  autoComplete,
  minLength,
  maxLength,
  required = true,
}: {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        name={id}
        required={required}
        type={type}
      />
    </label>
  );
}

export function AuthForm({
  variant,
  notice,
}: {
  variant: AuthFormVariant;
  notice?: { status: "error" | "success"; message: string };
}) {
  const [state, formAction, pending] = useActionState(actionByVariant[variant], null);

  return (
    <form action={formAction} className="auth-form">
      {variant === "signup" && <AuthField autoComplete="name" id="display_name" label="Display name" maxLength={80} />}
      {variant !== "reset-password" && (
        <AuthField autoComplete="email" id="email" label="Email address" type="email" />
      )}
      {(variant === "signup" || variant === "login" || variant === "reset-password") && (
        <AuthField
          autoComplete={variant === "login" ? "current-password" : "new-password"}
          id="password"
          label="Password"
          type="password"
          minLength={8}
        />
      )}
      {(variant === "signup" || variant === "reset-password") && (
        <AuthField autoComplete="new-password" id="confirm_password" label="Confirm password" type="password" minLength={8} />
      )}
      {notice && <p className={`auth-message auth-message-${notice.status}`} role={notice.status === "error" ? "alert" : "status"}>{notice.message}</p>}
      {state && <p className={`auth-message auth-message-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      <Button className="auth-submit" disabled={pending} type="submit">
        {pending ? pendingLabel[variant] : buttonLabel[variant]}
      </Button>
      <nav className="auth-links" aria-label="Account links">
        {variant === "login" && <Link href="/forgot-password">Forgot password?</Link>}
        {variant === "login" && <span>New to Learn It? <Link href="/signup">Create an account</Link></span>}
        {variant === "signup" && <span>Already have an account? <Link href="/login">Sign in</Link></span>}
        {(variant === "forgot-password" || variant === "reset-password") && <Link href="/login">Back to sign in</Link>}
      </nav>
    </form>
  );
}
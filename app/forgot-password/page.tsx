import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthPageFrame eyebrow="Account help" title="Reset your password" description="Enter your account email and we'll send a secure reset link if an account matches.">
      <AuthForm variant="forgot-password" />
    </AuthPageFrame>
  );
}
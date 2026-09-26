import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthPageFrame eyebrow="Account help" title="Choose a new password" description="Set a new password for your Learn It account.">
      <AuthForm variant="reset-password" />
    </AuthPageFrame>
  );
}
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthPageFrame eyebrow="Create your account" title="A little more personal" description="Create an account to see your profile and choose your preferred learning depth.">
      <AuthForm variant="signup" />
    </AuthPageFrame>
  );
}
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthPageFrame } from "@/components/auth-page-frame";

export const metadata: Metadata = { title: "Sign in" };

const notices: Record<string, { status: "error" | "success"; message: string }> = {
  "verification-failed": { status: "error", message: "That verification link is invalid or expired. Try creating an account again or request a fresh link." },
  "signout-failed": { status: "error", message: "We couldn't sign you out. Please try again." },
  "supabase-not-configured": { status: "error", message: "Supabase is not configured. Add the public project URL and anon key to .env.local." },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return (
    <AuthPageFrame eyebrow="Welcome back" title="Sign in to Learn It" description="Use your email and password to open your profile.">
      <AuthForm variant="login" notice={notice ? notices[notice] : undefined} />
    </AuthPageFrame>
  );
}
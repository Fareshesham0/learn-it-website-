import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, StatusBadge, Button } from "@/components/site-ui";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return (
      <div className="page-main page-width">
        <PageHeader eyebrow="Profile" title="Connect your account" description="Add your Supabase project URL and public anon key to .env.local to enable account access." />
        <p className="inline-note">Copy .env.example to .env.local, add your project values, then restart the development server.</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, display_name, learning_mode, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="page-main page-width">
      <div className="profile-heading-row">
        <PageHeader eyebrow="Profile" title="Your account" description="Your account details and learning preferences." />
        <form action={signOutAction}><Button variant="secondary" type="submit">Sign out</Button></form>
      </div>
      <section className="account-card" aria-labelledby="account-details-heading">
        <div className="account-card-heading">
          <div><p className="eyebrow">Account details</p><h2 id="account-details-heading">Your Learn It profile</h2></div>
          {user.email_confirmed_at && <StatusBadge tone="success">Email verified</StatusBadge>}
        </div>
        <dl className="account-email">
          <div><dt>Email address</dt><dd>{user.email}</dd></div>
        </dl>
        {profile ? (
          <ProfileForm displayName={profile.display_name ?? ""} learningMode={profile.learning_mode} />
        ) : (
          <p className="auth-message auth-message-error" role="alert">
            {profileError
              ? "The profile table is not available yet. Apply the SQL migration in supabase/migrations to enable profile details."
              : "Your profile record is not ready yet. Contact support if this continues."}
          </p>
        )}
      </section>
    </div>
  );
}
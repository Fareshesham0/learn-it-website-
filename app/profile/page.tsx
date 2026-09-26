import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { EmptyState, PageHeader, ProgressBar, SectionHeader, StatusBadge, Button } from "@/components/site-ui";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLearningProgressOverview } from "@/lib/learning-progress";
import Link from "next/link";

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

  let learningOverview = null;
  try {
    learningOverview = await getLearningProgressOverview(supabase, user.id);
  } catch {
    learningOverview = null;
  }

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
      <section className="profile-section profile-learning-section">
        <SectionHeader eyebrow="Your learning" title="Learning Progress" />
        {learningOverview ? (
          <>
            <div className="profile-learning-summary">
              <div><span>Completed lessons</span><strong>{learningOverview.totalCompletedLessons}</strong></div>
              <div><span>Overall path completion</span><strong>{learningOverview.completionPercent}%</strong></div>
              <ProgressBar
                value={learningOverview.totalCompletedLessons}
                max={Math.max(learningOverview.totalLessons, 1)}
                label={`Overall path completion: ${learningOverview.completionPercent}%`}
                showValue={false}
              />
            </div>
            <div className="profile-learning-paths">
              {learningOverview.paths.length > 0 ? learningOverview.paths.map((path) => (
                <article className="profile-learning-path" key={path.id}>
                  <div className="profile-learning-path-heading">
                    <div><p className="eyebrow">{path.complete ? "Completed path" : "Active path"}</p><h3>{path.title}</h3></div>
                    <StatusBadge tone={path.complete ? "success" : "info"}>{path.completionPercent}%</StatusBadge>
                  </div>
                  <p>{path.completedLessons} of {path.totalLessons} lessons completed</p>
                  <ProgressBar value={path.completedLessons} max={Math.max(path.totalLessons, 1)} label={`${path.title} completion: ${path.completionPercent}%`} showValue={false} />
                </article>
              )) : (
                <div className="profile-learning-empty">
                  <EmptyState title="No learning path started yet" description="Start with Computer Basics and your progress will appear here." />
                </div>
              )}
            </div>
            <Link
              className="button-primary profile-continue-button"
              href={learningOverview.recommendation
                ? `/learn/${learningOverview.recommendation.pathSlug}/${learningOverview.recommendation.lessonSlug}`
                : "/learn"}
            >
              Continue Learning
            </Link>
          </>
        ) : (
          <p className="auth-message auth-message-error" role="alert">Learning progress could not be loaded right now.</p>
        )}
      </section>
    </div>
  );
}
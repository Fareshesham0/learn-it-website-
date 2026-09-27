import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/site-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLearningProgressOverview } from "@/lib/learning-progress";
import { getAuthenticatedUserXpSummary } from "@/lib/xp";

export async function ContinueLearningSection() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return <ProgressEmptyState />;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="continue-empty">
        <EmptyState icon={BookOpen} title="Your learning journey starts here" description="Sign in to track your learning progress." />
        <Link className="button-secondary" href="/login">Sign in <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    );
  }

  let overview;
  let xpSummary = null;
  try {
    overview = await getLearningProgressOverview(supabase, user.id);
    xpSummary = await getAuthenticatedUserXpSummary(supabase);
  } catch {
    return <ProgressEmptyState />;
  }

  if (!overview.hasProgress) return <ProgressEmptyState />;
  if (!overview.recommendation) {
    return (
      <div className="continue-empty">
        <EmptyState icon={BookOpen} title="You’re all caught up" description="You’ve completed the published lessons in your current paths." />
        <Link className="button-secondary" href="/learn">Browse learning paths <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    );
  }

  const { recommendation } = overview;
  const href = `/learn/${recommendation.pathSlug}/${recommendation.lessonSlug}`;

  return (
    <article className="continue-card">
      <div className="continue-card-copy">
        <p className="eyebrow">{recommendation.pathTitle}</p>
        <h3>{recommendation.lessonTitle}</h3>
        <p>{recommendation.lessonSummary ?? "Continue with the next lesson in your learning path."}</p>
      </div>
      <div className="continue-card-progress">
        <div className="continue-progress-copy">
          <span>{recommendation.path.completedLessons} of {recommendation.path.totalLessons} lessons completed</span>
          <strong>{recommendation.path.completionPercent}% complete</strong>
        </div>
        {xpSummary && (
          <div className="continue-xp-indicator">
            <span>Level {xpSummary.currentLevel}</span>
            <strong>{xpSummary.totalXp} XP</strong>
          </div>
        )}
        <div className="path-progress-track" role="progressbar" aria-label={`${recommendation.pathTitle} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={recommendation.path.completionPercent}>
          <span style={{ width: `${recommendation.path.completionPercent}%` }} />
        </div>
        <Link className="button-primary continue-button" href={href}>Continue <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

function ProgressEmptyState() {
  return (
    <div className="continue-empty">
      <EmptyState icon={BookOpen} title="Your learning journey starts here" description="Begin with Computer Basics and build useful skills one lesson at a time." />
      <Link className="button-primary" href="/learn/computer-basics">Start learning <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  );
}

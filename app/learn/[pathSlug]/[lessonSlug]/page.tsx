import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { LessonPresentation } from "@/components/lesson-presentation";
import { LessonProgressControls } from "@/components/lesson-progress-controls";
import { PageHeader, StatusBadge } from "@/components/site-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LearningMode } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Lesson" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ pathSlug: string; lessonSlug: string }> };

function LearningUnavailable() {
  return (
    <div className="page-main page-width">
      <PageHeader eyebrow="Learn" title="Lesson content is not ready" description="Apply the learning-data and seed migrations in Supabase, then reload this page." />
    </div>
  );
}

export default async function LessonPage({ params }: PageProps) {
  const { pathSlug, lessonSlug } = await params;
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return <LearningUnavailable />;
  }

  const { data: path, error: pathError } = await supabase
    .from("learning_paths")
    .select("id, slug, title")
    .eq("slug", pathSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (pathError) return <LearningUnavailable />;
  if (!path) notFound();

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, slug, title, summary, estimated_minutes, sort_order")
    .eq("path_id", path.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (lessonsError || !lessons) return <LearningUnavailable />;

  const lessonIndex = lessons.findIndex((item) => item.slug === lessonSlug);
  if (lessonIndex < 0) notFound();

  const lesson = lessons[lessonIndex];
  const { data: { user } } = await supabase.auth.getUser();
  let learningMode: LearningMode = "Learner";
  let progressStatus: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("learning_mode")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.learning_mode) learningMode = profile.learning_mode;

    const { data: progress } = await supabase
      .from("user_lesson_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    progressStatus = progress?.status ?? null;
  }

  const lessonNumber = lessonIndex + 1;
  const previousLesson = lessons[lessonIndex - 1];
  const nextLesson = lessons[lessonIndex + 1];
  const supportsContent = path.slug === "computer-basics" && lesson.slug === "what-is-a-computer";

  return (
    <div className="page-main page-width lesson-page">
      <Link className="back-link" href={`/learn/${path.slug}`}><ArrowLeft size={16} aria-hidden="true" /> {path.title}</Link>
      <p className="eyebrow lesson-position">Lesson {lessonNumber} of {lessons.length}</p>
      <PageHeader eyebrow="Lesson" title={lesson.title} description={lesson.summary ?? "Explore this lesson at your own pace."} />

      <div className="lesson-meta-row">
        {lesson.estimated_minutes && <span><Clock3 size={16} aria-hidden="true" /> {lesson.estimated_minutes} min</span>}
        <span>Learning mode <StatusBadge tone="info">{learningMode}</StatusBadge></span>
        {progressStatus && <StatusBadge tone={progressStatus === "completed" ? "success" : "info"}>{progressStatus === "completed" ? "Completed" : "In progress"}</StatusBadge>}
      </div>

      {supportsContent ? (
        <LessonPresentation mode={learningMode} />
      ) : (
        <section className="lesson-coming-soon" aria-labelledby="coming-soon-title">
          <p className="eyebrow">Coming soon</p>
          <h2 id="coming-soon-title">Lesson content coming soon</h2>
          <p>This lesson is part of the {path.title} path. Its summary and place in the learning sequence are ready; the lesson content will follow in a later step.</p>
        </section>
      )}

      {supportsContent && (
        <LessonProgressControls pathSlug={path.slug} lessonSlug={lesson.slug} status={progressStatus} authenticated={Boolean(user)} />
      )}

      <nav className="lesson-navigation" aria-label="Lesson navigation">
        {previousLesson ? (
          <Link className="lesson-nav-link previous" href={`/learn/${path.slug}/${previousLesson.slug}`}>
            <ArrowLeft size={17} aria-hidden="true" /><span><small>Previous lesson</small><strong>{previousLesson.title}</strong></span>
          </Link>
        ) : (
          <Link className="lesson-nav-link previous" href={`/learn/${path.slug}`}>
            <ArrowLeft size={17} aria-hidden="true" /><span><small>Back to path</small><strong>{path.title}</strong></span>
          </Link>
        )}
        {nextLesson ? (
          <Link className="lesson-nav-link next" href={`/learn/${path.slug}/${nextLesson.slug}`}>
            <span><small>Next lesson</small><strong>{nextLesson.title}</strong></span><ArrowRight size={17} aria-hidden="true" />
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
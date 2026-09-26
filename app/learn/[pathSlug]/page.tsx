import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, Circle, Clock3, Play } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/site-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Learning Path" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ pathSlug: string }> };

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function LearningUnavailable() {
  return (
    <div className="page-main page-width">
      <PageHeader eyebrow="Learn" title="Learning content is not ready" description="Apply the learning-data and seed migrations in Supabase, then reload this page." />
    </div>
  );
}

export default async function LearningPathPage({ params }: PageProps) {
  const { pathSlug } = await params;
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return <LearningUnavailable />;
  }

  const { data: path, error: pathError } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description, sort_order, is_published")
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

  const { data: { user } } = await supabase.auth.getUser();
  const progressByLesson = new Map<string, string>();

  if (user && lessons.length > 0) {
    const { data: progress } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", user.id)
      .in("lesson_id", lessons.map((lesson) => lesson.id));

    progress?.forEach((row) => progressByLesson.set(row.lesson_id, row.status));
  }

  const completedCount = lessons.filter((lesson) => progressByLesson.get(lesson.id) === "completed").length;
  const completionPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const totalMinutes = lessons.reduce((total, lesson) => total + (lesson.estimated_minutes ?? 0), 0);

  return (
    <div className="page-main page-width learning-path-page">
      <Link className="back-link" href="/learn"><ArrowLeft size={16} aria-hidden="true" /> All learning paths</Link>
      <PageHeader eyebrow="Learning path" title={path.title} description={path.description ?? "Explore this learning path at your own pace."} />

      <div className="learning-path-stats" aria-label="Learning path details">
        <div><BookOpen size={18} aria-hidden="true" /><strong>{lessons.length}</strong><span>{lessons.length === 1 ? "lesson" : "lessons"}</span></div>
        <div><Clock3 size={18} aria-hidden="true" /><strong>{formatDuration(totalMinutes)}</strong><span>estimated total</span></div>
        {user ? (
          <div className="path-completion"><strong>{completedCount} of {lessons.length} lessons completed</strong><span>{completionPercent}% complete</span></div>
        ) : (
          <div className="path-completion"><Link href="/login">Sign in to track your progress</Link></div>
        )}
      </div>

      {user && (
        <div className="path-progress-track" role="progressbar" aria-label="Learning path completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
          <span style={{ width: `${completionPercent}%` }} />
        </div>
      )}

      <section className="lesson-list-section" aria-labelledby="lesson-list-title">
        <div className="lesson-list-heading">
          <div><p className="eyebrow">Your roadmap</p><h2 id="lesson-list-title">Lessons</h2></div>
          <span>{lessons.length} lessons</span>
        </div>
        <ol className="lesson-list">
          {lessons.map((lesson, index) => {
            const status = user ? progressByLesson.get(lesson.id) ?? "not_started" : null;
            const statusLabel = status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : user ? "Not started" : "Not tracked";
            const statusTone = status === "completed" ? "success" : status === "in_progress" ? "info" : "neutral";
            const StatusIcon = status === "completed" ? Check : status === "in_progress" ? Play : Circle;

            return (
              <li key={lesson.id}>
                <Link className="lesson-list-item" href={`/learn/${path.slug}/${lesson.slug}`}>
                  <span className="lesson-list-number">{index + 1}</span>
                  <span className="lesson-list-copy">
                    <strong>{lesson.title}</strong>
                    <span>{lesson.summary ?? "Open this lesson to explore the topic."}</span>
                    {lesson.estimated_minutes && <small><Clock3 size={13} aria-hidden="true" /> {lesson.estimated_minutes} min</small>}
                  </span>
                  <span className="lesson-list-meta">
                    <StatusBadge tone={statusTone}><span className="lesson-status"><StatusIcon size={14} aria-hidden="true" />{statusLabel}</span></StatusBadge>
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
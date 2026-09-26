import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type LessonStatus = "not_started" | "in_progress" | "completed";

export type PathProgressSummary = {
  id: string;
  slug: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  started: boolean;
  complete: boolean;
};

export type LessonRecommendation = {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonSummary: string | null;
  pathSlug: string;
  pathTitle: string;
  lessonNumber: number;
  path: PathProgressSummary;
  status: LessonStatus | null;
};

export type LearningProgressOverview = {
  hasProgress: boolean;
  totalCompletedLessons: number;
  totalLessons: number;
  completionPercent: number;
  paths: PathProgressSummary[];
  recommendation: LessonRecommendation | null;
};

type LessonRecord = {
  id: string;
  path_id: string;
  slug: string;
  title: string;
  summary: string | null;
  sort_order: number;
};

function timestamp(value: string | null, fallback: string) {
  return new Date(value ?? fallback).getTime();
}

export async function getLearningProgressOverview(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<LearningProgressOverview> {
  const { data: paths, error: pathsError } = await supabase
    .from("learning_paths")
    .select("id, slug, title, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (pathsError) throw pathsError;
  if (!paths?.length) {
    return { hasProgress: false, totalCompletedLessons: 0, totalLessons: 0, completionPercent: 0, paths: [], recommendation: null };
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, path_id, slug, title, summary, sort_order")
    .in("path_id", paths.map((path) => path.id))
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (lessonsError) throw lessonsError;

  const { data: progressRows, error: progressError } = lessons?.length
    ? await supabase
      .from("user_lesson_progress")
      .select("lesson_id, status, started_at, completed_at, updated_at")
      .eq("user_id", userId)
      .in("lesson_id", lessons.map((lesson) => lesson.id))
    : { data: [], error: null };

  if (progressError) throw progressError;

  const progressByLesson = new Map((progressRows ?? []).map((row) => [row.lesson_id, row]));
  const lessonsByPath = new Map<string, LessonRecord[]>();
  lessons?.forEach((lesson) => {
    const current = lessonsByPath.get(lesson.path_id) ?? [];
    current.push(lesson);
    lessonsByPath.set(lesson.path_id, current);
  });

  const pathsById = new Map(paths.map((path) => [path.id, path]));
  const pathSummaries = paths.map((path) => {
    const pathLessons = lessonsByPath.get(path.id) ?? [];
    const completedLessons = pathLessons.filter((lesson) => progressByLesson.get(lesson.id)?.status === "completed").length;
    const started = pathLessons.some((lesson) => {
      const status = progressByLesson.get(lesson.id)?.status;
      return status === "in_progress" || status === "completed";
    });

    return {
      id: path.id,
      slug: path.slug,
      title: path.title,
      totalLessons: pathLessons.length,
      completedLessons,
      completionPercent: pathLessons.length ? Math.round((completedLessons / pathLessons.length) * 100) : 0,
      started,
      complete: pathLessons.length > 0 && completedLessons === pathLessons.length,
    };
  });

  const trackedPaths = pathSummaries.filter((path) => path.started);
  const totalLessons = trackedPaths.reduce((total, path) => total + path.totalLessons, 0);
  const totalCompletedLessons = trackedPaths.reduce((total, path) => total + path.completedLessons, 0);
  const completionPercent = totalLessons ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;
  const publishedLessonById = new Map((lessons ?? []).map((lesson) => [lesson.id, lesson]));
  const toRecommendation = (lessonId: string): LessonRecommendation | null => {
    const lesson = publishedLessonById.get(lessonId);
    const path = lesson && pathsById.get(lesson.path_id);
    const pathProgress = lesson && pathSummaries.find((item) => item.id === lesson.path_id);
    const pathLessons = lesson && lessonsByPath.get(lesson.path_id);
    if (!lesson || !path || !pathProgress || !pathLessons) return null;

    return {
      lessonId: lesson.id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      lessonSummary: lesson.summary,
      pathSlug: path.slug,
      pathTitle: path.title,
      lessonNumber: pathLessons.findIndex((item) => item.id === lesson.id) + 1,
      path: pathProgress,
      status: progressByLesson.get(lesson.id)?.status ?? null,
    };
  };

  const progress = progressRows ?? [];
  const hasStartedLesson = progress.some((row) => row.status === "in_progress" || row.status === "completed");
  const inProgressRows = progress
    .filter((row) => row.status === "in_progress" && publishedLessonById.has(row.lesson_id))
    .sort((a, b) => timestamp(b.updated_at, "") - timestamp(a.updated_at, ""));

  let recommendation = inProgressRows[0] ? toRecommendation(inProgressRows[0].lesson_id) : null;

  if (!recommendation) {
    const completedRows = progress
      .filter((row) => row.status === "completed" && publishedLessonById.has(row.lesson_id))
      .sort((a, b) => timestamp(b.completed_at, b.updated_at) - timestamp(a.completed_at, a.updated_at));
    const mostRecentlyCompleted = completedRows[0] && publishedLessonById.get(completedRows[0].lesson_id);

    if (mostRecentlyCompleted) {
      const currentPath = pathsById.get(mostRecentlyCompleted.path_id);
      const currentPathLessons = lessonsByPath.get(mostRecentlyCompleted.path_id) ?? [];
      const incomplete = (lesson: LessonRecord) => progressByLesson.get(lesson.id)?.status !== "completed";
      const nextInPath = currentPathLessons.find((lesson) => lesson.sort_order > mostRecentlyCompleted.sort_order && incomplete(lesson))
        ?? currentPathLessons.find(incomplete);
      const laterPathLesson = currentPath
        ? (lessons ?? []).find((lesson) => {
          const lessonPath = pathsById.get(lesson.path_id);
          return Boolean(lessonPath && lessonPath.sort_order > currentPath.sort_order && incomplete(lesson));
        })
        : undefined;
      const anyIncompleteLesson = (lessons ?? []).find(incomplete);
      const nextLesson = nextInPath ?? laterPathLesson ?? anyIncompleteLesson;
      if (nextLesson) recommendation = toRecommendation(nextLesson.id);
    }
  }

  if (!recommendation && !hasStartedLesson && lessons?.[0]) {
    recommendation = toRecommendation(lessons[0].id);
  }

  return {
    hasProgress: trackedPaths.length > 0,
    totalCompletedLessons,
    totalLessons,
    completionPercent,
    paths: trackedPaths,
    recommendation,
  };
}
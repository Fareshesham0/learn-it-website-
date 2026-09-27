"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUserBadges, getAuthenticatedUserBadgeSlugs } from "@/lib/badges";

type ProgressStatus = "in_progress" | "completed";
type ProgressActionState = {
  status: "error" | "success";
  message: string;
  continueHref?: string;
  pathComplete?: boolean;
  xpMessages?: string[];
  badgeMessages?: string[];
} | null;

function getSlug(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getXpMessage(eventType: "lesson_completed" | "final_mission_completed" | "path_completed", xpAmount: number) {
  switch (eventType) {
    case "final_mission_completed":
      return `Final mission completed · +${xpAmount} XP`;
    case "path_completed":
      return `Path completed · +${xpAmount} bonus XP`;
    case "lesson_completed":
    default:
      return `Lesson completed · +${xpAmount} XP`;
  }
}

async function saveLessonProgress(formData: FormData, status: ProgressStatus): Promise<ProgressActionState> {
  const pathSlug = getSlug(formData, "path_slug");
  const lessonSlug = getSlug(formData, "lesson_slug");
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slugPattern.test(pathSlug) || !slugPattern.test(lessonSlug)) {
    return { status: "error", message: "This lesson link is invalid. Return to the learning path and try again." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { status: "error", message: "Sign in to save your progress." };
    }

    const { data: path, error: pathError } = await supabase
      .from("learning_paths")
      .select("id")
      .eq("slug", pathSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (pathError || !path) {
      return { status: "error", message: "This published lesson could not be found." };
    }

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("id, slug, sort_order")
      .eq("path_id", path.id)
      .eq("slug", lessonSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (lessonError || !lesson) {
      return { status: "error", message: "This published lesson could not be found." };
    }

    const { data: existing, error: progressReadError } = await supabase
      .from("user_lesson_progress")
      .select("started_at, status")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    if (progressReadError) {
      return { status: "error", message: "Progress could not be loaded. Check that the learning-data migration has been applied." };
    }

    if (status === "in_progress" && existing?.status === "completed") {
      return { status: "success", message: "This lesson is already complete." };
    }

    let badgeSlugsBeforeCompletion = new Set<string>();
    if (status === "completed" && existing?.status !== "completed") {
      try {
        badgeSlugsBeforeCompletion = await getAuthenticatedUserBadgeSlugs(supabase);
      } catch {
        badgeSlugsBeforeCompletion = new Set<string>();
      }
    }

    const now = new Date().toISOString();
    const { error: saveError } = await supabase
      .from("user_lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        status,
        started_at: existing?.started_at ?? now,
        completed_at: status === "completed" ? now : null,
      }, { onConflict: "user_id,lesson_id" });

    if (saveError) {
      return { status: "error", message: "Progress could not be saved. Check that the learning-data migration has been applied." };
    }

    revalidatePath(`/learn/${pathSlug}`);
    revalidatePath(`/learn/${pathSlug}/${lessonSlug}`);
    revalidatePath("/profile");
    revalidatePath("/");

    if (status === "completed") {
      const { data: nextLesson, error: nextLessonError } = await supabase
        .from("lessons")
        .select("slug")
        .eq("path_id", path.id)
        .eq("is_published", true)
        .gt("sort_order", lesson.sort_order)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      const xpMessages: string[] = [];
      const badgeMessages: string[] = [];

      if (existing?.status !== "completed") {
        const lessonEventKey = lesson.slug.startsWith("final-mission-")
          ? `final-mission:${lesson.id}`
          : `lesson:${lesson.id}`;
        const eventKeys = nextLessonError || nextLesson
          ? [lessonEventKey]
          : [lessonEventKey, `path:${path.id}`];
        const { data: xpEvents } = await supabase
          .from("xp_events")
          .select("event_type, xp_amount")
          .eq("user_id", user.id)
          .in("event_key", eventKeys)
          .order("created_at", { ascending: true });

        xpEvents?.forEach((event) => {
          xpMessages.push(getXpMessage(event.event_type, event.xp_amount));
        });

        try {
          const badgesAfterCompletion = await getAuthenticatedUserBadges(supabase);
          badgesAfterCompletion.forEach((badge) => {
            if (!badgeSlugsBeforeCompletion.has(badge.slug)) {
              badgeMessages.push(`Badge unlocked: ${badge.title}`);
            }
          });
        } catch {
          badgeMessages.length = 0;
        }
      }

      return {
        status: "success",
        message: "Lesson marked complete.",
        continueHref: nextLessonError || !nextLesson ? undefined : `/learn/${pathSlug}/${nextLesson.slug}`,
        pathComplete: !nextLessonError && !nextLesson,
        xpMessages,
        badgeMessages,
      };
    }

    return {
      status: "success",
      message: "Lesson started. Your progress is saved.",
    };
  } catch {
    return { status: "error", message: "Progress could not be saved right now. Please try again." };
  }
}

export async function startLessonAction(_state: ProgressActionState, formData: FormData): Promise<ProgressActionState> {
  return saveLessonProgress(formData, "in_progress");
}

export async function completeLessonAction(_state: ProgressActionState, formData: FormData): Promise<ProgressActionState> {
  return saveLessonProgress(formData, "completed");
}

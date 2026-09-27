import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type LevelProgress = {
  totalXp: number;
  currentLevel: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpTowardNextLevel: number;
  xpNeededForNextLevel: number;
  xpRemainingForNextLevel: number;
  percentageTowardNextLevel: number;
};

export type RecentXpEvent = {
  eventType: "lesson_completed" | "final_mission_completed" | "path_completed";
  xpAmount: number;
  createdAt: string;
  label: string;
};

const BASE_LEVEL_WIDTH = 100;
const LEVEL_WIDTH_STEP = 50;

export function getLevelProgress(totalXp: number): LevelProgress {
  const safeTotal = Math.max(0, Math.floor(totalXp));
  let currentLevel = 1;
  let levelStartXp = 0;
  let nextLevelXp = BASE_LEVEL_WIDTH;

  while (safeTotal >= nextLevelXp) {
    currentLevel += 1;
    levelStartXp = nextLevelXp;
    nextLevelXp += BASE_LEVEL_WIDTH + ((currentLevel - 1) * LEVEL_WIDTH_STEP);
  }

  const xpNeededForNextLevel = nextLevelXp - levelStartXp;
  const xpTowardNextLevel = safeTotal - levelStartXp;
  const percentageTowardNextLevel = xpNeededForNextLevel > 0
    ? Math.min(100, Math.round((xpTowardNextLevel / xpNeededForNextLevel) * 100))
    : 100;

  return {
    totalXp: safeTotal,
    currentLevel,
    levelStartXp,
    nextLevelXp,
    xpTowardNextLevel,
    xpNeededForNextLevel,
    xpRemainingForNextLevel: Math.max(0, nextLevelXp - safeTotal),
    percentageTowardNextLevel,
  };
}

export function getXpEventLabel(eventType: RecentXpEvent["eventType"]) {
  switch (eventType) {
    case "final_mission_completed":
      return "Final mission completed";
    case "path_completed":
      return "Learning path completed";
    case "lesson_completed":
    default:
      return "Lesson completed";
  }
}

async function getAuthenticatedUserId(supabase: SupabaseClient<Database>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;
  return user.id;
}

export async function getAuthenticatedUserTotalXp(supabase: SupabaseClient<Database>) {
  const userId = await getAuthenticatedUserId(supabase);
  if (!userId) return 0;

  const { data, error } = await supabase
    .from("xp_events")
    .select("xp_amount")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).reduce((total, event) => total + event.xp_amount, 0);
}

export async function getAuthenticatedUserXpSummary(supabase: SupabaseClient<Database>) {
  const totalXp = await getAuthenticatedUserTotalXp(supabase);
  return getLevelProgress(totalXp);
}

export async function getAuthenticatedUserRecentXpEvents(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<RecentXpEvent[]> {
  const userId = await getAuthenticatedUserId(supabase);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("xp_events")
    .select("event_type, xp_amount, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((event) => ({
    eventType: event.event_type,
    xpAmount: event.xp_amount,
    createdAt: event.created_at,
    label: getXpEventLabel(event.event_type),
  }));
}

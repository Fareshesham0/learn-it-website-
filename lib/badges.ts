import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type AwardedBadge = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string | null;
  awardedAt: string;
};

async function getAuthenticatedUserId(supabase: SupabaseClient<Database>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

export async function getAuthenticatedUserBadgeSlugs(supabase: SupabaseClient<Database>) {
  const badges = await getAuthenticatedUserBadges(supabase);
  return new Set(badges.map((badge) => badge.slug));
}

export async function getAuthenticatedUserBadges(
  supabase: SupabaseClient<Database>,
): Promise<AwardedBadge[]> {
  const userId = await getAuthenticatedUserId(supabase);
  if (!userId) return [];

  const { data: userBadges, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id, awarded_at")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });

  if (userBadgesError) throw userBadgesError;
  if (!userBadges?.length) return [];

  const badgeIds = userBadges.map((badge) => badge.badge_id);
  const { data: badges, error: badgesError } = await supabase
    .from("badges")
    .select("id, slug, title, description, icon")
    .in("id", badgeIds);

  if (badgesError) throw badgesError;

  const badgeById = new Map((badges ?? []).map((badge) => [badge.id, badge]));

  return userBadges.flatMap((userBadge) => {
    const badge = badgeById.get(userBadge.badge_id);
    if (!badge) return [];

    return {
      id: badge.id,
      slug: badge.slug,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      awardedAt: userBadge.awarded_at,
    };
  });
}

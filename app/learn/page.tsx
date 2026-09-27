import type { Metadata } from "next";
import { Cpu, Globe2, HardDrive, Keyboard, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { LearningModeSelector } from "@/components/learning-mode-selector";
import { CategoryCard, PageHeader, StatusBadge } from "@/components/site-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LearningMode } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Learn" };
export const dynamic = "force-dynamic";

const categories = [
  { icon: Keyboard, title: "Computer Basics", description: "The building blocks of computers and how they work.", tone: "mint" as const, href: "/learn/computer-basics" },
  { icon: Cpu, title: "Hardware", description: "Meet the components that make a computer tick.", tone: "blue" as const },
  { icon: HardDrive, title: "Using a Computer", description: "Everyday skills for getting things done.", tone: "peach" as const },
  { icon: Globe2, title: "Internet & Networking", description: "Understand websites, Wi-Fi, and connections.", tone: "lemon" as const },
  { icon: Wrench, title: "Maintenance", description: "Keep devices running smoothly over time.", tone: "mint" as const },
  { icon: ShieldCheck, title: "Cybersecurity", description: "Protect your accounts, devices, and information.", tone: "blue" as const },
];

const validLearningModes: LearningMode[] = ["Explorer", "Learner", "Technical"];

function isLearningMode(value: unknown): value is LearningMode {
  return typeof value === "string" && validLearningModes.includes(value as LearningMode);
}

export default async function LearnPage() {
  let authenticated = false;
  let savedLearningMode: LearningMode | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    authenticated = Boolean(user);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("learning_mode")
        .eq("user_id", user.id)
        .maybeSingle();
      savedLearningMode = isLearningMode(profile?.learning_mode) ? profile.learning_mode : null;
    }
  } catch {
    authenticated = false;
    savedLearningMode = null;
  }

  return (
    <div className="page-main page-width">
      <PageHeader eyebrow="Learn" title="Build your computer confidence" description="Explore practical topics at your own pace. Start with the basics or jump straight into something you want to know." />
      {savedLearningMode ? (
        <div className="learning-mode-summary">
          <span>Learning mode: <StatusBadge tone="info">{savedLearningMode}</StatusBadge></span>
          <Link href="/profile">Change</Link>
        </div>
      ) : (
        <LearningModeSelector saveMode={authenticated} />
      )}
      <div className="category-grid">{categories.map((category) => <CategoryCard key={category.title} {...category} />)}</div>
      <p className="inline-note">Guides and interactive lessons will be added in a future phase.</p>
    </div>
  );
}

import type { Metadata } from "next";
import { Accessibility, BookOpen, LockKeyhole, UserRound } from "lucide-react";
import { PageIntro, StatusBadge } from "@/components/site-ui";

export const metadata: Metadata = { title: "Settings" };

const settings = [
  { icon: UserRound, title: "Account", description: "Account details and preferences.", tone: "mint" },
  { icon: BookOpen, title: "Learning Mode", description: "Choose how you want lessons to feel.", tone: "blue" },
  { icon: Accessibility, title: "Accessibility", description: "Adjust the experience to work for you.", tone: "peach" },
  { icon: LockKeyhole, title: "Privacy", description: "Manage your privacy preferences.", tone: "lemon" },
] as const;

export default function SettingsPage() {
  return (
    <div className="page-main page-width">
      <PageIntro eyebrow="Settings" title="Make Learn It yours" description="Your preferences will live here as Learn It grows. Settings controls are planned for a future phase." />
      <div className="settings-list">
        {settings.map(({ icon: Icon, title, description, tone }) => (
          <div className="setting-row" key={title}>
            <span className={`icon-tile ${tone}`}><Icon size={21} aria-hidden="true" /></span>
            <div style={{ flex: 1 }}><strong>{title}</strong><p>{description}</p></div>
            <StatusBadge>Coming later</StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}
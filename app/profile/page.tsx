import type { Metadata } from "next";
import { Bookmark, ChartNoAxesColumnIncreasing, Medal, Sparkles } from "lucide-react";
import { CategoryCard, PageIntro, ProgressBar, SectionHeader } from "@/components/site-ui";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="page-main page-width">
      <PageIntro eyebrow="Profile" title="Your learning space" description="A home for your progress, milestones, and saved guides. Profile features are planned for a future phase." />
      <div className="profile-stats">
        <div className="stat-card"><span>Level</span><strong>—</strong><p>Coming in a future phase</p></div>
        <div className="stat-card"><span>XP</span><strong>—</strong><p>Coming in a future phase</p></div>
        <div className="stat-card"><span>Badges</span><strong>—</strong><p>Coming in a future phase</p></div>
      </div>
      <section className="profile-section">
        <SectionHeader eyebrow="Your journey" title="Learning Progress" />
        <div className="placeholder-panel"><span className="icon-tile mint"><ChartNoAxesColumnIncreasing size={23} aria-hidden="true" /></span><div><strong>Your progress will show up here</strong><p>Lessons completed and milestones will be collected here later.</p><ProgressBar value={0} max={300} label="Learning progress" showValue={false} /></div></div>
      </section>
      <section className="profile-section">
        <SectionHeader eyebrow="Keep close" title="Saved Guides" />
        <CategoryCard icon={Bookmark} title="Your saved guides" description="Guides you save will be easy to find here." tone="blue" status="Coming later" />
      </section>
      <span className="sr-only"><Medal aria-hidden="true" /><Sparkles aria-hidden="true" /></span>
    </div>
  );
}
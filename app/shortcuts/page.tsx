import type { Metadata } from "next";
import { Apple, Command, Globe, Keyboard, Monitor, Terminal } from "lucide-react";
import { CategoryCard, PageIntro } from "@/components/site-ui";

export const metadata: Metadata = { title: "Shortcuts" };

const categories = [
  { icon: Monitor, title: "Windows", description: "Useful key combinations for Windows.", tone: "blue" as const },
  { icon: Apple, title: "macOS", description: "Move faster around your Mac.", tone: "peach" as const },
  { icon: Terminal, title: "Linux", description: "Handy shortcuts for Linux desktops.", tone: "mint" as const },
  { icon: Globe, title: "Browser", description: "Navigate tabs and pages with ease.", tone: "lemon" as const },
];

export default function ShortcutsPage() {
  return (
    <div className="page-main page-width">
      <PageIntro eyebrow="Shortcuts" title="A quicker way around" description="Find keyboard shortcuts for your operating system and the apps you use most." />
      <div className="category-grid">{categories.map((category) => <CategoryCard key={category.title} {...category} />)}</div>
      <section className="profile-section">
        <CategoryCard icon={Keyboard} title="Shortcut Trainer" description="Practice until the combinations feel natural." tone="peach" status="Coming later" />
      </section>
      <p className="inline-note"><Command size={15} aria-hidden="true" /> Shortcut guides and practice are planned for a future phase.</p>
    </div>
  );
}
import type { Metadata } from "next";
import { Boxes, Cpu, Hammer } from "lucide-react";
import { CategoryCard, PageIntro } from "@/components/site-ui";

export const metadata: Metadata = { title: "Build" };

export default function BuildPage() {
  return (
    <div className="page-main page-width">
      <PageIntro eyebrow="Build" title="Plan your next PC" description="A place to plan builds and keep track of your parts. These tools are future features." />
      <div className="category-grid">
        <CategoryCard icon={Hammer} title="PC Builder" description="Choose parts and check how they fit together." tone="mint" status="Coming later" />
        <CategoryCard icon={Boxes} title="My Builds" description="Keep your planned and completed builds together." tone="blue" status="Coming later" />
      </div>
      <p className="inline-note">The PC builder and saved builds are not available in this phase.</p>
      <span className="sr-only"><Cpu aria-hidden="true" /></span>
    </div>
  );
}
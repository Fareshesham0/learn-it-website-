import type { Metadata } from "next";
import { Cable, Cpu, Laptop, Monitor } from "lucide-react";
import { CategoryCard, PageIntro } from "@/components/site-ui";

export const metadata: Metadata = { title: "Explore" };

const categories = [
  { icon: Monitor, title: "Desktop PC", description: "See how a desktop computer fits together.", tone: "mint" as const },
  { icon: Laptop, title: "Laptop", description: "Explore the compact parts inside a laptop.", tone: "blue" as const },
  { icon: Cpu, title: "Components", description: "Get familiar with the parts that do the work.", tone: "peach" as const },
  { icon: Cable, title: "Ports & Connectors", description: "Learn what plugs in where and why.", tone: "lemon" as const },
];

export default function ExplorePage() {
  return (
    <div className="page-main page-width">
      <PageIntro eyebrow="Explore" title="Get to know your computer" description="Take a closer look at the devices and components you use every day." />
      <div className="category-grid">{categories.map((category) => <CategoryCard key={category.title} {...category} />)}</div>
      <p className="inline-note">Interactive hardware views are planned for a later phase.</p>
    </div>
  );
}
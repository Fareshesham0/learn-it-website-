import type { Metadata } from "next";
import { Cpu, Globe2, HardDrive, Keyboard, ShieldCheck, Wrench } from "lucide-react";
import { LearningModeSelector } from "@/components/learning-mode-selector";
import { CategoryCard, PageHeader } from "@/components/site-ui";

export const metadata: Metadata = { title: "Learn" };

const categories = [
  { icon: Keyboard, title: "Computer Basics", description: "The building blocks of computers and how they work.", tone: "mint" as const },
  { icon: Cpu, title: "Hardware", description: "Meet the components that make a computer tick.", tone: "blue" as const },
  { icon: HardDrive, title: "Using a Computer", description: "Everyday skills for getting things done.", tone: "peach" as const },
  { icon: Globe2, title: "Internet & Networking", description: "Understand websites, Wi-Fi, and connections.", tone: "lemon" as const },
  { icon: Wrench, title: "Maintenance", description: "Keep devices running smoothly over time.", tone: "mint" as const },
  { icon: ShieldCheck, title: "Cybersecurity", description: "Protect your accounts, devices, and information.", tone: "blue" as const },
];

export default function LearnPage() {
  return (
    <div className="page-main page-width">
      <PageHeader eyebrow="Learn" title="Build your computer confidence" description="Explore practical topics at your own pace. Start with the basics or jump straight into something you want to know." />
      <LearningModeSelector />
      <div className="category-grid">{categories.map((category) => <CategoryCard key={category.title} {...category} />)}</div>
      <p className="inline-note">Guides and interactive lessons will be added in a future phase.</p>
    </div>
  );
}
import type { Metadata } from "next";
import { ArrowRight, Bug, Laptop, Monitor, Wrench } from "lucide-react";
import { Button, CategoryCard, PageHeader, SearchInput, SectionHeader } from "@/components/site-ui";

export const metadata: Metadata = { title: "Fix" };

export default function FixPage() {
  return (
    <div className="page-main page-width">
      <PageHeader eyebrow="Fix" title="Let’s figure it out" description="Start with what’s going wrong. Clear troubleshooting guides are on the way." />
      <form className="search-form" action="/fix" method="get">
        <SearchInput label="Describe the problem you’re having" placeholder="Describe the problem you’re having" />
        <Button type="submit">Search <ArrowRight size={16} aria-hidden="true" /></Button>
      </form>
      <section>
        <SectionHeader eyebrow="Troubleshooting" title="Common Problems" description="Choose the kind of device or issue you need help with." />
        <div className="category-grid">
          <CategoryCard icon={Monitor} title="Desktop PC" description="Power, display, performance, and more." tone="mint" />
          <CategoryCard icon={Laptop} title="Laptop" description="Battery, connection, screen, and setup." tone="blue" />
          <CategoryCard icon={Bug} title="Software" description="Apps, updates, settings, and errors." tone="peach" />
        </div>
      </section>
      <p className="inline-note"><Wrench size={15} aria-hidden="true" /> Detailed troubleshooting guides will be added in a future phase.</p>
    </div>
  );
}
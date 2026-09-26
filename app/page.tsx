import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Cpu, Lightbulb, Play, Wrench } from "lucide-react";
import { ContinueLearningSection } from "@/components/continue-learning-section";
import { FeatureCard, SectionHeader } from "@/components/site-ui";

const actions = [
  { icon: BookOpen, title: "Learn Something", description: "Build useful computer skills, one idea at a time.", href: "/learn", tone: "mint" as const },
  { icon: Compass, title: "Explore a Computer", description: "Get to know the parts inside and out.", href: "/explore", tone: "blue" as const },
  { icon: Wrench, title: "Fix a Problem", description: "Find a clear place to start when tech gets tricky.", href: "/fix", tone: "peach" as const },
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="page-width hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">A friendlier way to learn tech</p>
            <h1>Learn computers.<br /><span>Explore hardware.</span><br />Fix problems.</h1>
            <p>Learn It helps you understand computers interactively, pick up practical skills, and troubleshoot common problems with confidence.</p>
            <div className="hero-actions">
              <Link className="button-primary" href="/learn">Start learning <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="button-secondary" href="/explore">Explore hardware</Link>
            </div>
          </div>
          <div className="hero-art" role="img" aria-label="A desktop computer setup">
            <div className="art-content">
              <div className="art-label"><span /> YOUR NEXT DISCOVERY</div>
              <span className="art-sticker"><Cpu size={36} strokeWidth={1.6} aria-hidden="true" /></span>
              <div className="art-bottom">
                <p>COMPUTER BASICS · 5 MIN</p>
                <strong>What happens when you press power?</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-actions page-width" aria-label="Start here">
        <div className="action-grid">
          {actions.map((action) => <FeatureCard key={action.title} {...action} />)}
        </div>
      </section>

      <section className="content-section page-width">
        <SectionHeader eyebrow="Pick up where you left off" title="Continue Learning" action={{ label: "Browse lessons", href: "/learn" }} />
        <ContinueLearningSection />
      </section>

      <section className="content-section page-width">
        <SectionHeader eyebrow="A few good places to begin" title="Popular Topics" action={{ label: "Explore all topics", href: "/learn" }} />
        <div className="topic-row">
          {["How computers work", "Inside a desktop PC", "Safer passwords", "Wi-Fi basics", "Keyboard shortcuts"].map((topic) => <span className="topic-chip" key={topic}>{topic}</span>)}
        </div>
      </section>

      <section className="content-section page-width">
        <div className="mission-panel">
          <div><p className="eyebrow">Small steps, real skills</p><h3>Try a Mission</h3><p>Short guided activities are on the way. Pick a topic and get ready to put your new skills to work.</p></div>
          <Link className="button-secondary" href="/learn">Explore topics <Play size={15} aria-hidden="true" /></Link>
          <Lightbulb className="mission-spark" size={1} aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
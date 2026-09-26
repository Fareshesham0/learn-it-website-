import type { LearningMode } from "@/lib/supabase/database.types";
import { Cpu, Keyboard, Monitor } from "lucide-react";

const learnerConcepts = [
  { title: "Hardware", detail: "The parts you can touch, like the keyboard, screen, and components inside the computer." },
  { title: "Software", detail: "The instructions and apps that tell the hardware what jobs to do." },
  { title: "Input", detail: "Information going in. Typing a message on a keyboard is one example." },
  { title: "Processing", detail: "The computer follows instructions to work with the input, such as arranging the letters you typed." },
  { title: "Output", detail: "The result coming back out, like your message appearing on the screen." },
  { title: "Storage", detail: "A place to keep information so it is still there later, like saving the message as a file." },
];

const technicalConcepts = [
  { title: "CPU", detail: "The processor executes program instructions and coordinates many operations. It repeatedly fetches, decodes, and carries out instructions." },
  { title: "Memory", detail: "RAM holds data and instructions that active programs need quickly. It is fast working space and is cleared when the computer loses power." },
  { title: "Storage", detail: "An SSD or hard drive keeps programs and files without power. The operating system loads needed instructions and data from storage into memory." },
  { title: "Input and output devices", detail: "A keyboard, mouse, camera, display, and speakers exchange data with the computer through device controllers and ports." },
  { title: "Operating system", detail: "The operating system manages hardware resources, provides common services to applications, and helps coordinate files and devices." },
  { title: "Stored-program idea", detail: "A computer can keep program instructions in memory as data, then have the CPU read and execute them in sequence." },
];

export function LessonPresentation({ mode }: { mode: LearningMode }) {
  if (mode === "Explorer") {
    return (
      <article className="lesson-content lesson-content-explorer">
        <p className="eyebrow">The simple idea</p>
        <h2>A computer takes information and turns it into useful results.</h2>
        <div className="computer-flow" aria-label="Keyboard sends input to a computer, which shows a result on screen">
          <div><Keyboard aria-hidden="true" /><strong>Keyboard</strong><small>Input</small></div>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <div className="flow-computer"><Cpu aria-hidden="true" /><strong>Computer</strong><small>Processes</small></div>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <div><Monitor aria-hidden="true" /><strong>Screen</strong><small>Result</small></div>
        </div>
        <div className="explorer-steps">
          <div><span>1</span><strong>Receive</strong><p>A key press gives the computer information.</p></div>
          <div><span>2</span><strong>Process</strong><p>The computer follows instructions.</p></div>
          <div><span>3</span><strong>Produce</strong><p>Your letters appear on the screen.</p></div>
          <div><span>4</span><strong>Store</strong><p>Save the work to use it later.</p></div>
        </div>
      </article>
    );
  }

  if (mode === "Technical") {
    return (
      <article className="lesson-content">
        <p className="eyebrow">A closer technical look</p>
        <h2>A computer is a programmable system that transforms data.</h2>
        <p className="lesson-lead">Programs describe operations for the hardware to carry out. Data moves between input/output devices, the processor, memory, and storage.</p>
        <div className="lesson-concept-grid">
          {technicalConcepts.map((concept) => <section className="lesson-concept" key={concept.title}><h3>{concept.title}</h3><p>{concept.detail}</p></section>)}
        </div>
      </article>
    );
  }

  return (
    <article className="lesson-content">
      <p className="eyebrow">Computer basics</p>
      <h2>What is a computer?</h2>
      <p className="lesson-lead">A computer is a machine that follows instructions to work with information and produce useful results. You can use one to write, draw, communicate, play, and much more.</p>
      <div className="lesson-concept-grid">
        {learnerConcepts.map((concept) => <section className="lesson-concept" key={concept.title}><h3>{concept.title}</h3><p>{concept.detail}</p></section>)}
      </div>
    </article>
  );
}
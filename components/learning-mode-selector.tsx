"use client";

import { useState } from "react";

const modes = [
  { name: "Explorer", description: "Visual and simple" },
  { name: "Learner", description: "Balanced detail" },
  { name: "Technical", description: "Deeper technical explanations" },
] as const;

export function LearningModeSelector() {
  const [selected, setSelected] = useState<(typeof modes)[number]["name"]>("Learner");

  return (
    <fieldset className="learning-mode">
      <legend>Choose your learning depth</legend>
      <div className="mode-options" role="group" aria-label="Learning depth">
        {modes.map((mode) => (
          <button
            aria-pressed={selected === mode.name}
            className={`mode-option${selected === mode.name ? " is-selected" : ""}`}
            key={mode.name}
            onClick={() => setSelected(mode.name)}
            type="button"
          >
            <span className="mode-name">{mode.name}</span>
            <span className="mode-description">{mode.description}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
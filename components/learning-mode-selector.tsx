"use client";

import { useActionState, useState } from "react";
import { updateLearningModeAction } from "@/app/actions/profile";
import type { LearningMode } from "@/lib/supabase/database.types";

const modes = [
  { name: "Explorer", description: "Visual and simple" },
  { name: "Learner", description: "Balanced detail" },
  { name: "Technical", description: "Deeper technical explanations" },
] as const;

export function LearningModeSelector({
  saveMode = false,
}: {
  saveMode?: boolean;
}) {
  const [selected, setSelected] = useState<LearningMode>("Learner");
  const [state, formAction, pending] = useActionState(updateLearningModeAction, null);

  if (saveMode) {
    return (
      <form action={formAction}>
        <fieldset className="learning-mode">
          <legend>Choose your learning depth</legend>
          <div className="mode-options" role="group" aria-label="Learning depth">
            {modes.map((mode) => (
              <button
                aria-pressed={selected === mode.name}
                className={`mode-option${selected === mode.name ? " is-selected" : ""}`}
                disabled={pending}
                key={mode.name}
                name="learning_mode"
                onClick={() => setSelected(mode.name)}
                type="submit"
                value={mode.name}
              >
                <span className="mode-name">{mode.name}</span>
                <span className="mode-description">{mode.description}</span>
              </button>
            ))}
          </div>
          {state && <p className={`auth-message auth-message-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
        </fieldset>
      </form>
    );
  }

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

"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/auth";
import { Button } from "@/components/site-ui";
import type { LearningMode } from "@/lib/supabase/database.types";

export function ProfileForm({
  displayName,
  learningMode,
}: {
  displayName: string;
  learningMode: LearningMode;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="profile-form">
      <label className="auth-field" htmlFor="profile-display-name">
        <span>Display name</span>
        <input id="profile-display-name" name="display_name" defaultValue={displayName} maxLength={80} required />
      </label>
      <label className="auth-field" htmlFor="profile-learning-mode">
        <span>Learning mode</span>
        <select id="profile-learning-mode" name="learning_mode" defaultValue={learningMode}>
          <option value="Explorer">Explorer · Visual and simple</option>
          <option value="Learner">Learner · Balanced detail</option>
          <option value="Technical">Technical · Deeper explanations</option>
        </select>
      </label>
      {state && <p className={`auth-message auth-message-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      <Button disabled={pending} type="submit">{pending ? "Saving..." : "Save profile"}</Button>
    </form>
  );
}
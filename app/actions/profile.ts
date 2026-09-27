"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/auth-state";
import type { LearningMode } from "@/lib/supabase/database.types";

const learningModes: LearningMode[] = ["Explorer", "Learner", "Technical"];

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Supabase is not configured")) {
    return error.message;
  }
  return error instanceof Error ? error.message : "We couldn't complete that request. Please try again.";
}

export async function updateLearningModeAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const learningMode = getText(formData, "learning_mode");
  if (!learningModes.includes(learningMode as LearningMode)) {
    return { status: "error", message: "Choose one of the available learning modes." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { status: "error", message: "Sign in to save your learning mode." };

    const { error } = await supabase
      .from("profiles")
      .update({ learning_mode: learningMode as LearningMode })
      .eq("user_id", user.id);

    if (error) return { status: "error", message: error.message };
    revalidatePath("/learn");
    revalidatePath("/profile");
    return { status: "success", message: "Your learning mode has been saved." };
  } catch (error) {
    return { status: "error", message: getErrorMessage(error) };
  }
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { completeLessonAction, startLessonAction } from "@/app/actions/learning";
import { Button, StatusBadge } from "@/components/site-ui";

export function LessonProgressControls({
  pathSlug,
  lessonSlug,
  status,
  authenticated,
  nextLessonHref,
}: {
  pathSlug: string;
  lessonSlug: string;
  status: string | null;
  authenticated: boolean;
  nextLessonHref?: string;
}) {
  const [startState, startAction, starting] = useActionState(startLessonAction, null);
  const [completeState, completeAction, completing] = useActionState(completeLessonAction, null);
  const currentStatus = completeState?.status === "success"
    ? "completed"
    : startState?.status === "success"
      ? "in_progress"
      : status ?? "not_started";
  const continueHref = completeState?.continueHref ?? (currentStatus === "completed" ? nextLessonHref : undefined);

  if (!authenticated) {
    return (
      <div className="lesson-signin-note">
        <p>Sign in to save your progress.</p>
        <Link href="/login">Sign in</Link>
      </div>
    );
  }

  return (
    <section className="lesson-progress-controls" aria-label="Lesson progress">
      {currentStatus === "completed" ? (
        <div className="lesson-completed-state" role="status">
          <StatusBadge tone="success">Lesson completed</StatusBadge>
          <span>Review lesson</span>
        </div>
      ) : (
        <>
          {currentStatus === "in_progress" && <StatusBadge tone="info">In progress</StatusBadge>}
          <div className="lesson-progress-buttons">
            {currentStatus === "not_started" && (
              <form action={startAction}>
                <input type="hidden" name="path_slug" value={pathSlug} />
                <input type="hidden" name="lesson_slug" value={lessonSlug} />
                <Button disabled={starting || completing} type="submit" variant="secondary">{starting ? "Starting..." : "Start lesson"}</Button>
              </form>
            )}
            {currentStatus === "in_progress" && (
              <form action={completeAction}>
                <input type="hidden" name="path_slug" value={pathSlug} />
                <input type="hidden" name="lesson_slug" value={lessonSlug} />
                <Button disabled={starting || completing} type="submit">{completing ? "Saving..." : "Mark lesson complete"}</Button>
              </form>
            )}
          </div>
        </>
      )}
      {startState && <p className={`auth-message auth-message-${startState.status}`} role={startState.status === "error" ? "alert" : "status"}>{startState.message}</p>}
      {completeState && <p className={`auth-message auth-message-${completeState.status}`} role={completeState.status === "error" ? "alert" : "status"}>{completeState.message}</p>}
      {completeState?.status === "success" && completeState.xpMessages && completeState.xpMessages.length > 0 && (
        <div className="lesson-xp-feedback" role="status" aria-label="XP earned">
          {completeState.xpMessages.map((message) => <p key={message}>{message}</p>)}
        </div>
      )}
      {completeState?.status === "success" && completeState.badgeMessages && completeState.badgeMessages.length > 0 && (
        <div className="lesson-badge-feedback" role="status" aria-label="Badge unlocked">
          {completeState.badgeMessages.map((message) => <p key={message}>{message}</p>)}
        </div>
      )}
      {continueHref && (
        <Link className="button-primary lesson-continue-next" href={continueHref}>
          Continue to next lesson <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
      {completeState?.status === "success" && completeState.pathComplete && (
        <p className="lesson-path-complete" role="status">You’ve completed this learning path. Nice work!</p>
      )}
    </section>
  );
}

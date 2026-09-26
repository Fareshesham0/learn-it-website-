import type { ReactNode } from "react";

export function AuthPageFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="page-main page-width auth-main">
      <header className="page-intro auth-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="intro-description">{description}</p>
      </header>
      <section className="auth-panel">{children}</section>
    </div>
  );
}
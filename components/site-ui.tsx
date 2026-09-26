import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Search } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ children, variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  const classes = `button button-${variant} ${className}`.trim();
  return <button className={classes} type={type} {...props}>{children}</button>;
}

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function IconButton({ icon: Icon, label, className = "", ...props }: IconButtonProps) {
  const classes = `icon-button ${className}`.trim();
  const icon = <Icon size={19} aria-hidden="true" />;
  return props.href ? (
    <Link className={classes} href={props.href} aria-label={label} title={label}>{icon}</Link>
  ) : (
    <button className={classes} type={props.type ?? "button"} disabled={props.disabled} onClick={props.onClick} aria-label={label} title={label}>{icon}</button>
  );
}

export function SearchInput({
  label,
  placeholder,
  name = "q",
}: {
  label: string;
  placeholder: string;
  name?: string;
}) {
  return (
    <label className="search-input">
      <Search size={19} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input name={name} type="search" placeholder={placeholder} aria-label={label} />
    </label>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "error" | "info" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function DifficultyBadge({ difficulty }: { difficulty: "Beginner" | "Intermediate" | "Advanced" }) {
  const tone = difficulty === "Beginner" ? "success" : difficulty === "Advanced" ? "warning" : "info";
  return <StatusBadge tone={tone}>{difficulty}</StatusBadge>;
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
}: {
  value: number;
  max: number;
  label: string;
  showValue?: boolean;
}) {
  const progress = max > 0 ? Math.min(Math.max(value, 0), max) : 0;
  return (
    <div className="progress-component">
      <div className="progress-label-row"><span>{label}</span>{showValue && <span>{progress} / {max} XP</span>}</div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={progress}>
        <span style={{ width: `${max > 0 ? (progress / max) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { icon?: LucideIcon; title: string; description: string }) {
  return (
    <div className="empty-state">
      {Icon && <span className="icon-tile mint"><Icon size={23} aria-hidden="true" /></span>}
      <div><strong>{title}</strong><p>{description}</p></div>
    </div>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && (
        <Link className="text-link" href={action.href}>
          {action.label} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  tone?: "mint" | "peach" | "blue";
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  tone = "mint",
}: FeatureCardProps) {
  return (
    <Link className="feature-card" href={href}>
      <span className={`icon-tile ${tone}`}>
        <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="card-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <ArrowRight className="card-arrow" size={18} aria-hidden="true" />
    </Link>
  );
}

type CategoryCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  tone?: "mint" | "peach" | "blue" | "lemon";
  status?: string;
};

export function CategoryCard({
  icon: Icon,
  title,
  description,
  href,
  tone = "mint",
  status,
}: CategoryCardProps) {
  const content = (
    <>
      <span className={`icon-tile ${tone}`}>
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="card-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      {status ? <StatusBadge>{status}</StatusBadge> : href ? <ArrowRight className="card-arrow" size={18} aria-hidden="true" /> : null}
    </>
  );

  return href ? (
    <Link className="category-card" href={href}>{content}</Link>
  ) : (
    <div className="category-card">{content}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="intro-description">{description}</p>
    </header>
  );
}

export const PageIntro = PageHeader;
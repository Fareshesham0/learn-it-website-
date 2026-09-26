import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { IconButton } from "@/components/site-ui";

const links = [
  ["Learn", "/learn"],
  ["Explore", "/explore"],
  ["Fix", "/fix"],
  ["Build", "/build"],
  ["Shortcuts", "/shortcuts"],
] as const;

export function Navbar() {
  return (
    <header className="site-header">
      <div className="navbar-wrap">
        <Link className="brand" href="/" aria-label="Learn It home">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>Learn It</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link key={label} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="nav-actions">
          <IconButton icon={Search} label="Search help topics" href="/fix" />
          <IconButton icon={UserRound} label="Profile" href="/profile" className="profile-button" />
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu"><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              {links.map(([label, href]) => (
                <Link key={label} href={href}>{label}</Link>
              ))}
              <Link href="/settings">Settings</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
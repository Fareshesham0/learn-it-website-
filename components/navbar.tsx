import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { IconButton } from "@/components/site-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["Learn", "/learn"],
  ["Explore", "/explore"],
  ["Fix", "/fix"],
  ["Build", "/build"],
  ["Shortcuts", "/shortcuts"],
] as const;

export async function Navbar() {
  let accountLabel: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      const metadataName = user.user_metadata?.display_name;
      accountLabel = profile?.display_name?.trim()
        || (typeof metadataName === "string" ? metadataName.trim() : "")
        || "Profile";
    }
  } catch {
    accountLabel = null;
  }

  const accountHref = accountLabel ? "/profile" : "/login";
  const accountText = accountLabel ?? "Sign in";

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
          <Link className="nav-sign-in" href={accountHref}>{accountText}</Link>
        </nav>
        <div className="nav-actions">
          <IconButton icon={Search} label="Search help topics" href="/fix" />
          <IconButton icon={UserRound} label={accountLabel ? "Profile" : "Sign in"} href={accountHref} className="profile-button" />
          <ThemeToggle />
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu"><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              {links.map(([label, href]) => (
                <Link key={label} href={href}>{label}</Link>
              ))}
              <Link href={accountHref}>{accountText}</Link>
              {!accountLabel && <Link href="/signup">Create account</Link>}
              <Link href="/settings">Settings</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="footer-brand" href="/">Learn It</Link>
        <p>Understand your tech, one step at a time.</p>
        <Link href="/settings">Settings</Link>
      </div>
    </footer>
  );
}
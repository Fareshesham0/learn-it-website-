import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Learn It | Understand your computer",
    template: "%s | Learn It",
  },
  description: "Learn practical computer skills, explore hardware, and find clear help for common problems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="learn-it-theme-bootstrap" strategy="beforeInteractive">
          {`(() => {
            const key = "learn-it-theme";
            const media = window.matchMedia("(prefers-color-scheme: dark)");
            try {
              const preference = localStorage.getItem(key) || "system";
              const dark = preference === "dark" || (preference === "system" && media.matches);
              document.documentElement.classList.toggle("dark", dark);
              document.documentElement.style.colorScheme = dark ? "dark" : "light";
            } catch {
              document.documentElement.classList.toggle("dark", media.matches);
              document.documentElement.style.colorScheme = media.matches ? "dark" : "light";
            }
          })()`}
        </Script>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
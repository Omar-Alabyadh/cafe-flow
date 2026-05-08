import { DashboardChromeHeader } from "./dashboard-chrome-header";
import { DashboardSidebar } from "./dashboard-sidebar";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  /** Used to build locale-aware dashboard links (Arabic default routes). */
  locale: string;
  /** When true, sidebar omits marketing “home” link and tenant “Overview” on operator console URLs. */
  platformShell?: boolean;
};

/**
 * High-level shell for dashboard pages.
 * It keeps main layout structure predictable: header + sidebar + content.
 */
export function AppShell({ children, title, locale, platformShell = false }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <DashboardChromeHeader title={title} locale={locale} />
      <div className="flex flex-1 flex-col md:flex-row">
        <DashboardSidebar locale={locale} platformShell={platformShell} />
        <main className="flex-1 px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5">{children}</main>
      </div>
    </div>
  );
}


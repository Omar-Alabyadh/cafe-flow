import { signOut } from "@/auth";
import { clearPlatformStepUpCookie } from "@/lib/platform/platform-step-up-cookie";
import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";

type LogoutButtonProps = {
  locale: string;
  /** Top bar variant for task-focused roles with compact styling. */
  variant?: "sidebar" | "header";
};

/**
 * Reusable logout button.
 * We keep sign-out as a tiny server action so the flow is explicit:
 * submit form -> invalidate session -> redirect to locale sign-in page.
 */
export async function LogoutButton({ locale, variant = "sidebar" }: LogoutButtonProps) {
  const t = await getTranslations("auth.logout");

  async function logoutAction() {
    "use server";
    await clearPlatformStepUpCookie();
    await signOut({ redirectTo: `/${locale}/sign-in` });
  }

  if (variant === "header") {
    return (
      <form action={logoutAction} className="inline [direction:rtl]">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/60"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          {t("button")}
        </button>
      </form>
    );
  }

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        {t("button")}
      </button>
    </form>
  );
}


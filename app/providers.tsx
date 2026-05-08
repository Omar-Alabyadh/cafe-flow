"use client";

import { ThemeProvider } from "next-themes";
import { THEME_STORAGE_KEY } from "@/lib/theme/storage-key";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * Single global theme provider (next-themes).
 * - `attribute="class"` toggles `.dark` on `<html>` for Tailwind v4 dark variants.
 * - `storageKey` matches the inline script in `app/layout.tsx` to reduce first-paint flash.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}


type PageContainerProps = {
  children: React.ReactNode;
};

/**
 * Shared page width and spacing.
 * This keeps pages visually consistent across sections.
 */
export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</div>;
}


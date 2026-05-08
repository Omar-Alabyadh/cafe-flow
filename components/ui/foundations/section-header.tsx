type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

/**
 * Reusable section heading with optional action area.
 * It is intentionally explicit so students can explain it quickly.
 */
export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}


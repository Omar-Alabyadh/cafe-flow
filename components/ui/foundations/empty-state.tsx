import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

/**
 * Displays a friendly placeholder when no data exists yet.
 * We use this in foundation phase instead of building business modules early.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="cf-surface rounded-xl p-8 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Inbox className="h-5 w-5 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}


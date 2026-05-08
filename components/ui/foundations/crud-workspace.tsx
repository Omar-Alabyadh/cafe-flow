type CrudWorkspaceProps = {
  form: React.ReactNode;
  table: React.ReactNode;
};

/**
 * Reusable CRUD page composition:
 * elevated form card + management table card side-by-side on desktop.
 */
export function CrudWorkspace({ form, table }: CrudWorkspaceProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[380px,1fr]">
      <div className="cf-surface rounded-xl p-4">{form}</div>
      <div className="cf-surface rounded-xl p-4">{table}</div>
    </div>
  );
}


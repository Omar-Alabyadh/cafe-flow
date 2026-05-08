import type { PermissionTemplateKey } from "@/lib/authorization/permissions";

/** Template labels shown on invite owner UI and employee preview. */
export const INVITE_TEMPLATE_LABELS_AR: Record<PermissionTemplateKey, string> = {
  DEFAULT: "Default by role",
  POS_ONLY: "POS only",
  INVENTORY_ONLY: "Inventory only",
  READ_ONLY: "Read only",
  CUSTOM: "Custom",
};

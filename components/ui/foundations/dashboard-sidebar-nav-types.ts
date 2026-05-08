export type IconKey =
  | "home"
  | "business"
  | "store"
  | "boxes"
  | "inventory"
  | "recipes"
  | "orders"
  | "reports"
  | "addons"
  | "settings"
  | "staff"
  | "shield"
  | "wallet";

export type NavItem = { href: string; label: string; icon: IconKey };
export type NavGroup = { title: string; items: NavItem[] };


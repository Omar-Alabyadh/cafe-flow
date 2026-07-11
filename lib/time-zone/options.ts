export type CuratedTimeZoneOption = {
  value: string;
  label: string;
  group: string;
};

export const CURATED_TIME_ZONE_OPTIONS: CuratedTimeZoneOption[] = [
  { value: "Africa/Tripoli", label: "Tripoli", group: "Africa" },
  { value: "Africa/Cairo", label: "Cairo", group: "Africa" },
  { value: "Africa/Tunis", label: "Tunis", group: "Africa" },
  { value: "Africa/Algiers", label: "Algiers", group: "Africa" },
  { value: "Asia/Riyadh", label: "Riyadh", group: "Asia" },
  { value: "Asia/Dubai", label: "Dubai", group: "Asia" },
  { value: "Europe/London", label: "London", group: "Europe" },
  { value: "Europe/Paris", label: "Paris", group: "Europe" },
  { value: "America/New_York", label: "New York", group: "America" },
  { value: "America/Los_Angeles", label: "Los Angeles", group: "America" },
  { value: "UTC", label: "UTC", group: "UTC" },
];

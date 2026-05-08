import { promises as fs } from "fs";
import path from "path";

export type LandingLocaleContent = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  primaryCta: string;
  pricingIntro: string;
  featuresTitle: string;
  faqTitle: string;
  contactText: string;
};

export type LandingContent = {
  ar: LandingLocaleContent;
  en: LandingLocaleContent;
};

const LANDING_KEYS: (keyof LandingLocaleContent)[] = [
  "heroBadge",
  "heroTitle",
  "heroDescription",
  "primaryCta",
  "pricingIntro",
  "featuresTitle",
  "faqTitle",
  "contactText",
];

const CONTENT_FILE = path.join(process.cwd(), "data", "platform", "landing-content.json");

const DEFAULT_CONTENT: LandingContent = {
  ar: {
    heroBadge: "🔥 يُستخدم من قِبل أصحاب المقاهي في ليبيا",
    heroTitle: "أوقِف فوضى تشغيل المقهى خلال 7 أيام فقط",
    heroDescription: "تتبّع الطلبات والمخزون والمبيعات من مكان واحد وبأقل أخطاء.",
    primaryCta: "ابدأ مجانًا الآن",
    pricingIntro: "اختر الخطة المناسبة وابدأ تجربة 14 يومًا.",
    featuresTitle: "ما الذي ستحصل عليه",
    faqTitle: "الأسئلة الشائعة",
    contactText: "⚡ تفعيل فوري + دعم واتساب",
  },
  en: {
    heroBadge: "🔥 Used by cafe owners in Libya",
    heroTitle: "Stop cafe operation chaos in just 7 days",
    heroDescription: "Track orders, inventory, and sales in one place with fewer mistakes.",
    primaryCta: "Start free now",
    pricingIntro: "Choose the right plan and start a 14-day trial.",
    featuresTitle: "What you get",
    faqTitle: "Frequently asked questions",
    contactText: "⚡ Instant activation + WhatsApp support",
  },
};

/**
 * Older installs (and the first DEFAULT_CONTENT) stored the same English strings under `ar` and `en`.
 * When both still match the shipped English default for a field, we treat Arabic as unmigrated and
 * substitute the Arabic default so the editor and `/ar` landing show proper copy without deleting JSON.
 * If the operator later makes AR and EN intentionally identical for a key, that value will differ from
 * DEFAULT_CONTENT.en[key] and is left untouched.
 */
function normalizeArabicFromLegacyFile(parsed: LandingContent): LandingLocaleContent {
  const out: LandingLocaleContent = { ...DEFAULT_CONTENT.ar };
  for (const key of LANDING_KEYS) {
    const arVal = (parsed.ar?.[key] ?? "").trim();
    const enVal = (parsed.en?.[key] ?? "").trim();
    const defaultEn = DEFAULT_CONTENT.en[key];
    if (!arVal) {
      continue;
    }
    if (arVal === enVal && arVal === defaultEn) {
      out[key] = DEFAULT_CONTENT.ar[key];
      continue;
    }
    out[key] = arVal;
  }
  return out;
}

export async function readLandingContent(): Promise<LandingContent> {
  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as LandingContent;
    return {
      ar: normalizeArabicFromLegacyFile(parsed),
      en: { ...DEFAULT_CONTENT.en, ...parsed.en },
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

/**
 * Hybrid CMS approach:
 * - current persistence: local JSON file for fast, explainable first admin version.
 * - upgrade path: replace this storage adapter with Prisma while keeping route/UI unchanged.
 */
export async function saveLandingContent(next: LandingContent) {
  await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
  await fs.writeFile(CONTENT_FILE, JSON.stringify(next, null, 2), "utf-8");
}

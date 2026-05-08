import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import Link from "next/link";

type CatalogNeedBusinessProps = {
  locale: string;
  title: string;
};

/**
 * Shown when the user has no owned business yet (same idea as branches/staff pages).
 */
export function CatalogNeedBusiness({ locale, title }: CatalogNeedBusinessProps) {
  return (
    <PageContainer>
      <SectionHeader title={title} description="Create a business first to activate catalog features." />
      <EmptyState
        title="No business found"
        description="Go to the business page to create your first business."
        action={
          <Link
            href={`/${locale}/dashboard/business`}
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Go to business
          </Link>
        }
      />
    </PageContainer>
  );
}

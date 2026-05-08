import { PageContainer } from "@/components/ui/foundations/page-container";
import { getPlatformFourthLayerUIFlags } from "@/lib/platform/platform-fourth-layer";
import { getTranslations } from "next-intl/server";
import { PlatformStepUpForm } from "./platform-step-up-form";

type Props = { locale: string };

/**
 * Operator password re-check before any platform child renders.
 * Translations stay on the server; only the form is client-side for pending state.
 */
export async function PlatformStepUpPanel({ locale }: Props) {
  const t = await getTranslations("platform.layout");
  const fourthLayer = getPlatformFourthLayerUIFlags();

  let descriptionKey: "stepUpDescription" | "stepUpDescriptionTotp" | "stepUpDescriptionExtra" | "stepUpDescriptionBoth" =
    "stepUpDescription";
  if (fourthLayer.totp && fourthLayer.extraSecret) descriptionKey = "stepUpDescriptionBoth";
  else if (fourthLayer.totp) descriptionKey = "stepUpDescriptionTotp";
  else if (fourthLayer.extraSecret) descriptionKey = "stepUpDescriptionExtra";

  return (
    <PageContainer>
      <PlatformStepUpForm
        locale={locale}
        fourthLayer={fourthLayer}
        labels={{
          title: t("stepUpTitle"),
          description: t(descriptionKey),
          passwordLabel: t("stepUpPasswordLabel"),
          totpLabel: t("stepUpTotpLabel"),
          totpHint: t("stepUpTotpHint"),
          extraSecretLabel: t("stepUpExtraSecretLabel"),
          extraSecretHint: t("stepUpExtraSecretHint"),
          submit: t("stepUpSubmit"),
          submitting: t("stepUpSubmitting"),
          securityNote: t("stepUpSecurityNote"),
        }}
      />
    </PageContainer>
  );
}

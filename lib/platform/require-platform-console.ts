import "server-only";

import { hasValidPlatformStepUpCookie } from "./platform-step-up-cookie";
import { isPlatformOperator } from "./require-platform-operator";

/**
 * Full gate for mutating platform routes and the platform UI shell:
 * operator identity (`isPlatformOperator`) plus a recent password re-check (`hasValidPlatformStepUpCookie`).
 */
export async function hasPlatformConsoleAccess(userId: string): Promise<boolean> {
  if (!(await isPlatformOperator(userId))) return false;
  return hasValidPlatformStepUpCookie(userId);
}

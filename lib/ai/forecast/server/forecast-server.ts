import "server-only";

import { FinancialDataOrigin, MembershipRole, OrderStatus, PermissionScope } from "@prisma/client";
import { getCurrentUserId } from "@/lib/auth/session";
import { canAccessBranch } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { createForecastServerService } from "./service";
import type { ForecastReadRepository, ForecastRequest } from "./types";

/**
 * The only Prisma adapter for A4. It is read-only, uses one bounded order query,
 * and deliberately selects no Payment or financial amount fields.
 */
export const prismaForecastReadRepository: ForecastReadRepository = {
  async findAuthorizedBranch({ businessId, branchId }) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, businessId, archivedAt: null, isActive: true },
      select: { id: true, nameAr: true, nameEn: true },
    });
    if (!branch) return null;
    return { id: branch.id, displayLabel: branch.nameAr || branch.nameEn || "Branch" };
  },
  async readNativeDemand(query) {
    const orders = await prisma.order.findMany({
      where: {
        businessId: query.businessId,
        status: OrderStatus.COMPLETED,
        financialDataOrigin: FinancialDataOrigin.NATIVE,
        completedAt: { not: null, gte: query.historyStart },
        ...(query.scopeType === "BRANCH" ? { branchId: query.branchId, branchDataOrigin: FinancialDataOrigin.NATIVE } : {}),
      },
      select: {
        branchId: true,
        completedAt: true,
        financialDataOrigin: true,
        branchDataOrigin: true,
        items: {
          select: {
            quantity: true,
            product: { select: { id: true, businessId: true, nameAr: true, nameEn: true, isActive: true, archivedAt: true } },
          },
        },
      },
      orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }],
      take: query.maxOrders,
    });
    return orders.flatMap((order) => order.items.map((item) => ({
      status: OrderStatus.COMPLETED,
      financialDataOrigin: order.financialDataOrigin,
      branchDataOrigin: order.branchDataOrigin,
      branchId: order.branchId,
      completedAt: order.completedAt,
      product: item.product ? {
        id: item.product.id,
        businessId: item.product.businessId,
        displayLabel: item.product.nameAr || item.product.nameEn || "Product",
        isActive: item.product.isActive,
        archivedAt: item.product.archivedAt,
      } : null,
      quantity: Number(item.quantity),
    })));
  },
};

const forecastService = createForecastServerService({
  getCurrentUserId,
  async getBusinessContext(userId) {
    const context = await getCurrentBusinessMemberContext(userId);
    return {
      userId,
      businessId: context.business.id,
      member: {
        role: context.member.role,
        scope: context.member.scope,
        branchId: context.member.branchId,
        grantedPermissions: context.member.grantedPermissions,
        revokedPermissions: context.member.revokedPermissions,
      },
    };
  },
  canAccessBranch(member, branchId) {
    return canAccessBranch({
      id: "server-forecast-membership",
      userId: "server-forecast-user",
      businessId: "server-forecast-business",
      branchId: member.branchId,
      role: member.role as MembershipRole,
      scope: member.scope as PermissionScope,
      grantedPermissions: member.grantedPermissions,
      revokedPermissions: member.revokedPermissions,
    }, branchId);
  },
  repository: prismaForecastReadRepository,
});

/** Future UI/server actions call these server-only functions; no client-supplied business ID exists. */
export const getForecastReadiness = (request: ForecastRequest) => forecastService.getForecastReadiness(request);
export const generateRealPilotForecast = (request: Omit<ForecastRequest, "forecastMode">) => forecastService.generateRealPilotForecast(request);
export const generateAcademicDemoForecast = (request: Omit<ForecastRequest, "forecastMode">) => forecastService.generateAcademicDemoForecast(request);

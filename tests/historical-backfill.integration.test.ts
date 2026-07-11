import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { applyHistoricalBackfill, previewHistoricalBackfill } from "@/lib/finance/historical-backfill";

const url = process.env.F2_TEST_DATABASE_URL;
if (!url) test.skip("backfill integration requires disposable F2_TEST_DATABASE_URL", () => {});
else {
  const db = new PrismaClient({ datasources: { db: { url } } });
  test.after(async () => db.$disconnect());
  test("backfill preview is read-only and apply changes only approved legacy null fields", async () => {
    await db.$executeRawUnsafe('TRUNCATE TABLE "FinancialBackfillBatch", "Payment", "OrderItem", "Order", "DocumentSequence", "Product", "Branch", "Business", "User" CASCADE');
    const user=await db.user.create({data:{fullName:"Test",email:"f3@test.local",passwordHash:"x"}});
    const business=await db.business.create({data:{code:"F3",nameAr:"F3",ownerId:user.id}});
    const product=await db.product.create({data:{businessId:business.id,code:"P",nameAr:"Changed current name",basePrice:"999.99"}});
    const order=await db.order.create({data:{businessId:business.id,status:"COMPLETED"}});
    const item=await db.orderItem.create({data:{orderId:order.id,productId:product.id,quantity:"1"}});
    const before=await db.order.findUniqueOrThrow({where:{id:order.id}}); const preview=await previewHistoricalBackfill(business.id); const afterPreview=await db.order.findUniqueOrThrow({where:{id:order.id}});
    assert.equal(preview.candidates,1); assert.equal(before.currency,afterPreview.currency);
    const applied=await applyHistoricalBackfill({businessId:business.id,backfillVersion:"test-v1",idempotencyKey:"key-1",confirmationToken:"APPLY_FINANCIAL_BACKFILL"});
    const updated=await db.order.findUniqueOrThrow({where:{id:order.id}}); const updatedItem=await db.orderItem.findUniqueOrThrow({where:{id:item.id}});
    assert.equal(applied.replayed,false); assert.equal(updated.currency,"LYD"); assert.equal(updated.discountTotal?.toFixed(3),"0.000"); assert.equal(updated.taxTotal?.toFixed(3),"0.000"); assert.equal(updated.totalAmount,null); assert.equal(updated.branchId,null); assert.equal(updated.financialDataOrigin,"LEGACY_UNKNOWN"); assert.equal(updatedItem.unitPrice,null); assert.equal(updatedItem.productNameSnapshot,null); assert.equal(updatedItem.lineDiscountTotal?.toFixed(3),"0.000");
    const replay=await applyHistoricalBackfill({businessId:business.id,backfillVersion:"test-v1",idempotencyKey:"key-1",confirmationToken:"APPLY_FINANCIAL_BACKFILL"}); assert.equal(replay.replayed,true);
    assert.equal(await db.payment.count({where:{businessId:business.id}}),0); assert.equal(await db.stockMovement.count({where:{businessId:business.id}}),0); assert.equal(await db.documentSequence.count({where:{businessId:business.id}}),0);
  });
}

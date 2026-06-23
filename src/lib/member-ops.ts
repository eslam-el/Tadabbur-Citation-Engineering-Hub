import { db } from "@/lib/db";

// حذف آمن مرتّب لمجموعة أعضاء ضمن معاملة واحدة — يعالج قيود المفاتيح الأجنبية بالترتيب.
async function deleteMembers(ids: string[]): Promise<{ members: number; reports: number }> {
  if (ids.length === 0) return { members: 0, reports: 0 };
  return db.$transaction(async (tx) => {
    // (2) صفّر solutionAuthorId المُشير لمستهدَف في بلاغ مؤلفه ليس مستهدَفاً (حماية بيانات الآخرين)
    await tx.errorReport.updateMany({
      where: { solutionAuthorId: { in: ids }, authorId: { notIn: ids } },
      data: { solutionAuthorId: null },
    });
    // (3) احذف تعليقات المستهدفين على أي بلاغ (علاقة ReportComment.author إلزامية بلا onDelete)
    await tx.reportComment.deleteMany({ where: { authorId: { in: ids } } });
    // (4) احذف بلاغات المستهدفين (تعليقاتها المتبقية تُحذف تتاليّاً عبر onDelete: Cascade)
    const reports = await tx.errorReport.deleteMany({ where: { authorId: { in: ids } } });
    // (5) احذف سجلات نشاطهم
    await tx.activityLog.deleteMany({ where: { actorId: { in: ids } } });
    // (6) احذف الأعضاء
    const members = await tx.member.deleteMany({ where: { id: { in: ids } } });
    return { members: members.count, reports: reports.count };
  });
}

export async function safeDeleteMember(id: string) {
  return deleteMembers([id]);
}

export async function cleanupSeededData() {
  // (1) المستهدفون = الأعضاء بلا بريد جوجل (التجريبيون/القدامى)
  const targets = await db.member.findMany({ where: { email: null }, select: { id: true } });
  return deleteMembers(targets.map((t) => t.id));
}

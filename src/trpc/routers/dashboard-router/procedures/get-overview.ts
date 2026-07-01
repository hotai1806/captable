import { checkMembership } from "@/server/auth";
import { withAuth } from "@/trpc/api/trpc";

const ACTIVE_SHARE_STATUSES = new Set(["ACTIVE"]);
const ACTIVE_OPTION_STATUSES = new Set(["ACTIVE", "EXERCISED"]);
const RETURNED_TO_POOL_STATUSES = new Set(["CANCELLED", "EXPIRED"]);
const EXCLUDED_CAPITAL_STATUSES = new Set(["DRAFT", "CANCELLED"]);

export type LaunchTask = {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
};

export type ShareClassSummary = {
  id: string;
  name: string;
  classType: string;
  authorizedShares: number;
  outstandingShares: number;
  dilutedShares: number;
  ownership: number;
  raised: number;
};

export type OwnershipBucket = {
  key: string;
  value: number;
};

type NamedHolder = { id: string; name: string };

/**
 * Buckets ownership by holder into the top `limit` holders (by share count),
 * grouping the remainder into a single "Others" slice, expressed as rounded
 * percentages of `totalShares`.
 */
function buildOwnershipBuckets(
  sharesByHolder: Map<string, { name: string; shares: number }>,
  totalShares: number,
  limit = 4,
): OwnershipBucket[] {
  if (totalShares <= 0) {
    return [];
  }

  const sorted = [...sharesByHolder.values()]
    .filter((holder) => holder.shares > 0)
    .sort((a, b) => b.shares - a.shares);

  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  const restShares = rest.reduce((sum, holder) => sum + holder.shares, 0);

  const buckets: OwnershipBucket[] = top.map((holder) => ({
    key: holder.name,
    value: Math.round((holder.shares / totalShares) * 100),
  }));

  if (restShares > 0) {
    buckets.push({
      key: "Others",
      value: Math.round((restShares / totalShares) * 100),
    });
  }

  return buckets;
}

export const getOverviewProcedure = withAuth.query(async ({ ctx }) => {
  const { db, session } = ctx;

  return db.$transaction(async (tx) => {
    const { companyId } = await checkMembership({ session, tx });

    const [
      shareClasses,
      shares,
      options,
      equityPlans,
      investments,
      safes,
      convertibleNotes,
      stakeholders,
      bankAccounts,
      documentCount,
      templates,
      members,
    ] = await Promise.all([
      tx.shareClass.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          classType: true,
          initialSharesAuthorized: true,
        },
        orderBy: { idx: "asc" },
      }),
      tx.share.findMany({
        where: { companyId },
        select: {
          quantity: true,
          capitalContribution: true,
          ipContribution: true,
          debtCancelled: true,
          otherContributions: true,
          status: true,
          shareClassId: true,
          stakeholderId: true,
          stakeholder: { select: { name: true } },
        },
      }),
      tx.option.findMany({
        where: { companyId },
        select: {
          quantity: true,
          status: true,
          equityPlanId: true,
          stakeholderId: true,
          stakeholder: { select: { name: true } },
          equityPlan: { select: { shareClassId: true } },
        },
      }),
      tx.equityPlan.findMany({
        where: { companyId },
        select: { id: true, shareClassId: true, initialSharesReserved: true },
      }),
      tx.investment.findMany({
        where: { companyId },
        select: {
          amount: true,
          shares: true,
          shareClassId: true,
          stakeholderId: true,
          stakeholder: { select: { name: true } },
        },
      }),
      tx.safe.findMany({
        where: { companyId },
        select: { capital: true, status: true },
      }),
      tx.convertibleNote.findMany({
        where: { companyId },
        select: { capital: true, status: true },
      }),
      tx.stakeholder.findMany({
        where: { companyId },
        select: { id: true },
      }),
      tx.bankAccount.findMany({
        where: { companyId },
        select: { id: true },
      }),
      tx.document.count({ where: { companyId } }),
      tx.template.findMany({
        where: { companyId },
        select: { status: true },
      }),
      tx.member.findMany({
        where: { companyId },
        select: { status: true },
      }),
    ]);

    // How much of each plan's reserved pool is still unallocated (i.e. not
    // tied up in a grant that hasn't been cancelled/expired back into it).
    const unallocatedPoolByPlan = new Map<string, number>();
    for (const plan of equityPlans) {
      const granted = options
        .filter(
          (option) =>
            option.equityPlanId === plan.id &&
            !RETURNED_TO_POOL_STATUSES.has(option.status),
        )
        .reduce((sum, option) => sum + option.quantity, 0);

      unallocatedPoolByPlan.set(
        plan.id,
        Math.max(Number(plan.initialSharesReserved) - granted, 0),
      );
    }

    const shareClassSummary: ShareClassSummary[] = shareClasses.map((sc) => {
      const classShares = shares.filter(
        (share) =>
          share.shareClassId === sc.id &&
          ACTIVE_SHARE_STATUSES.has(share.status),
      );
      const classInvestments = investments.filter(
        (investment) => investment.shareClassId === sc.id,
      );
      const investmentShares = classInvestments.reduce(
        (sum, investment) => sum + Number(investment.shares),
        0,
      );

      const outstandingShares =
        classShares.reduce((sum, share) => sum + share.quantity, 0) +
        investmentShares;

      const classOptionShares = options
        .filter(
          (option) =>
            option.equityPlan.shareClassId === sc.id &&
            ACTIVE_OPTION_STATUSES.has(option.status),
        )
        .reduce((sum, option) => sum + option.quantity, 0);

      const classUnallocatedPool = equityPlans
        .filter((plan) => plan.shareClassId === sc.id)
        .reduce(
          (sum, plan) => sum + (unallocatedPoolByPlan.get(plan.id) ?? 0),
          0,
        );

      const raisedFromShares = classShares.reduce(
        (sum, share) =>
          sum +
          (share.capitalContribution ?? 0) +
          (share.ipContribution ?? 0) +
          (share.debtCancelled ?? 0) +
          (share.otherContributions ?? 0),
        0,
      );

      const raisedFromInvestments = classInvestments.reduce(
        (sum, investment) => sum + investment.amount,
        0,
      );

      return {
        id: sc.id,
        name: sc.name,
        classType: sc.classType,
        authorizedShares: Number(sc.initialSharesAuthorized),
        outstandingShares,
        dilutedShares:
          outstandingShares + classOptionShares + classUnallocatedPool,
        ownership: 0, // filled in below once we know the fully diluted total
        raised: raisedFromShares + raisedFromInvestments,
      };
    });

    const totalDilutedShares = shareClassSummary.reduce(
      (sum, sc) => sum + sc.dilutedShares,
      0,
    );

    for (const sc of shareClassSummary) {
      sc.ownership =
        totalDilutedShares > 0
          ? Math.round((sc.dilutedShares / totalDilutedShares) * 100)
          : 0;
    }

    const raisedFromShareClasses = shareClassSummary.reduce(
      (sum, sc) => sum + sc.raised,
      0,
    );
    const raisedFromSafes = safes
      .filter((safe) => !EXCLUDED_CAPITAL_STATUSES.has(safe.status))
      .reduce((sum, safe) => sum + safe.capital, 0);
    const raisedFromNotes = convertibleNotes
      .filter((note) => !EXCLUDED_CAPITAL_STATUSES.has(note.status))
      .reduce((sum, note) => sum + note.capital, 0);

    const totalRaised =
      raisedFromShareClasses + raisedFromSafes + raisedFromNotes;

    const sharesByHolder = new Map<string, { name: string; shares: number }>();

    const addToHolder = (holder: NamedHolder, quantity: number) => {
      const existing = sharesByHolder.get(holder.id);
      if (existing) {
        existing.shares += quantity;
      } else {
        sharesByHolder.set(holder.id, { name: holder.name, shares: quantity });
      }
    };

    for (const share of shares) {
      if (!ACTIVE_SHARE_STATUSES.has(share.status)) continue;
      addToHolder(
        { id: share.stakeholderId, name: share.stakeholder.name },
        share.quantity,
      );
    }

    for (const option of options) {
      if (!ACTIVE_OPTION_STATUSES.has(option.status)) continue;
      addToHolder(
        { id: option.stakeholderId, name: option.stakeholder.name },
        option.quantity,
      );
    }

    for (const investment of investments) {
      addToHolder(
        { id: investment.stakeholderId, name: investment.stakeholder.name },
        Number(investment.shares),
      );
    }

    const totalUnallocatedPool = [...unallocatedPoolByPlan.values()].reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
    if (totalUnallocatedPool > 0) {
      addToHolder(
        { id: "unallocated-pool", name: "Unallocated pool" },
        totalUnallocatedPool,
      );
    }

    const stakeholderBreakdown = buildOwnershipBuckets(
      sharesByHolder,
      totalDilutedShares,
    );

    const sharesByShareClass = new Map<
      string,
      { name: string; shares: number }
    >();
    for (const sc of shareClassSummary) {
      sharesByShareClass.set(sc.id, {
        name: sc.name,
        shares: sc.dilutedShares,
      });
    }
    const shareClassBreakdown = buildOwnershipBuckets(
      sharesByShareClass,
      totalDilutedShares,
      shareClassSummary.length || 4,
    );

    const pendingInvites = members.filter(
      (member) => member.status === "PENDING",
    ).length;
    const pendingSignatures = templates.filter(
      (template) =>
        template.status === "PENDING" || template.status === "DRAFT",
    ).length;

    const tasks: LaunchTask[] = [
      {
        id: "share-classes",
        title: "Create your first share class",
        description:
          "Set up common or preferred stock to start tracking ownership.",
        href: "/share-classes",
        completed: shareClasses.length > 0,
      },
      {
        id: "stakeholders",
        title: "Add your stakeholders",
        description:
          "Add founders, investors, and employees to your cap table.",
        href: "/stakeholders",
        completed: stakeholders.length > 0,
      },
      {
        id: "equity-plan",
        title: "Set up an equity incentive plan",
        description: "Reserve a stock option pool for future hires.",
        href: "/equity-plans",
        completed: equityPlans.length > 0,
      },
      {
        id: "shares",
        title: "Issue your first shares",
        description:
          "Issue founder or investor shares to populate your cap table.",
        href: "/securities/shares",
        completed: shares.length > 0,
      },
      {
        id: "bank-account",
        title: "Add a company bank account",
        description: "Connect a bank account to manage payments and payroll.",
        href: "/settings/bank-accounts",
        completed: bankAccounts.length > 0,
      },
      {
        id: "esign",
        title:
          pendingSignatures > 0
            ? `Complete ${pendingSignatures} document${
                pendingSignatures > 1 ? "s" : ""
              } awaiting signature`
            : "Send your first document for signature",
        description: "Keep legal paperwork signed, sealed, and organized.",
        href: "/documents/esign",
        completed: pendingSignatures === 0 && templates.length > 0,
      },
      {
        id: "team",
        title:
          pendingInvites > 0
            ? `Follow up on ${pendingInvites} pending invite${
                pendingInvites > 1 ? "s" : ""
              }`
            : "Invite your team",
        description: "Give co-founders and teammates access to the cap table.",
        href: "/settings/team",
        completed: pendingInvites === 0 && members.length > 1,
      },
    ];

    return {
      stats: {
        totalRaised,
        dilutedShares: totalDilutedShares,
        stakeholderCount: stakeholders.length,
        documentCount,
      },
      shareClassSummary,
      stakeholderBreakdown,
      shareClassBreakdown,
      tasks,
    };
  });
});

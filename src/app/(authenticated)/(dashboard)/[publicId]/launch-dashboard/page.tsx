import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { withServerComponentSession } from "@/server/auth";
import { db } from "@/server/db";
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiFolder5Line,
  RiGroup2Line,
  RiMailSendLine,
  RiMoneyDollarCircleLine,
  RiPieChartLine,
  RiSafeLine,
} from "@remixicon/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Launch dashboard",
};

type LaunchTask = {
  title: string;
  description: string;
  href: string;
  done: boolean;
};

type LaunchRecommendation = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatNumber = (value: number | bigint | null | undefined) => {
  if (typeof value === "bigint") {
    return numberFormatter.format(Number(value));
  }

  return numberFormatter.format(value ?? 0);
};

const getLaunchDashboardData = async (companyId: string) => {
  const [
    company,
    stakeholderCount,
    shareClassCount,
    equityPlanCount,
    shareAggregate,
    optionAggregate,
    safeCount,
    documentCount,
    dataRoomCount,
    updateCount,
    recentAudits,
  ] = await Promise.all([
    db.company.findUniqueOrThrow({
      where: { id: companyId },
      select: {
        name: true,
        logo: true,
        website: true,
        incorporationDate: true,
        incorporationState: true,
        incorporationCountry: true,
        incorporationType: true,
      },
    }),
    db.stakeholder.count({ where: { companyId } }),
    db.shareClass.count({ where: { companyId } }),
    db.equityPlan.count({ where: { companyId } }),
    db.share.aggregate({
      where: { companyId },
      _count: { id: true },
      _sum: {
        quantity: true,
        capitalContribution: true,
      },
    }),
    db.option.aggregate({
      where: { companyId },
      _count: { id: true },
      _sum: { quantity: true },
    }),
    db.safe.count({ where: { companyId } }),
    db.document.count({ where: { companyId } }),
    db.dataRoom.count({ where: { companyId } }),
    db.update.count({ where: { companyId } }),
    db.audit.findMany({
      where: { companyId },
      orderBy: { occurredAt: "desc" },
      take: 3,
      select: {
        id: true,
        summary: true,
        occurredAt: true,
      },
    }),
  ]);

  return {
    company,
    stakeholderCount,
    shareClassCount,
    equityPlanCount,
    issuedShareCount: shareAggregate._count.id,
    issuedShareQuantity: shareAggregate._sum.quantity ?? 0,
    optionGrantCount: optionAggregate._count.id,
    optionQuantity: optionAggregate._sum.quantity ?? 0,
    safeCount,
    documentCount,
    dataRoomCount,
    updateCount,
    capitalRaised: shareAggregate._sum.capitalContribution ?? 0,
    recentAudits,
  };
};

const LaunchDashboardPage = async ({
  params: { publicId },
}: {
  params: { publicId: string };
}) => {
  const {
    user: { companyId },
  } = await withServerComponentSession();
  const data = await getLaunchDashboardData(companyId);

  const companyProfileDone = Boolean(
    data.company.website &&
      data.company.incorporationDate &&
      data.company.incorporationState &&
      data.company.incorporationCountry &&
      data.company.incorporationType,
  );

  const tasks: LaunchTask[] = [
    {
      title: "Complete company profile",
      description: "Confirm incorporation details, address, logo, and website.",
      href: `/${publicId}/settings/company`,
      done: companyProfileDone,
    },
    {
      title: "Add stakeholders",
      description: "Invite founders, investors, employees, and advisors.",
      href: `/${publicId}/stakeholders`,
      done: data.stakeholderCount > 0,
    },
    {
      title: "Create share classes",
      description: "Define common or preferred stock classes before issuing equity.",
      href: `/${publicId}/share-classes`,
      done: data.shareClassCount > 0,
    },
    {
      title: "Issue initial equity",
      description: "Record founder shares, option grants, or other securities.",
      href: `/${publicId}/securities/shares`,
      done: data.issuedShareCount + data.optionGrantCount > 0,
    },
    {
      title: "Prepare fundraising documents",
      description: "Create SAFEs and organize investor-ready documents.",
      href: `/${publicId}/fundraise/safes`,
      done: data.safeCount > 0 || data.documentCount > 0,
    },
  ];

  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  const recommendations: LaunchRecommendation[] = [
    {
      title: "Build your first cap table",
      description:
        data.shareClassCount > 0
          ? "Your share classes are started. Keep your ownership model current as securities are issued."
          : "Start with a share class so equity issuances can roll into a clean cap table.",
      href: `/${publicId}/share-classes`,
      cta: data.shareClassCount > 0 ? "Review share classes" : "Create share class",
    },
    {
      title: "Raise with SAFEs",
      description:
        data.safeCount > 0
          ? "Track investor agreements from one fundraising workspace."
          : "Generate and manage SAFE agreements when you are ready to raise.",
      href: `/${publicId}/fundraise/safes`,
      cta: data.safeCount > 0 ? "View SAFEs" : "Create SAFE",
    },
    {
      title: "Open an investor data room",
      description:
        data.dataRoomCount > 0
          ? "Keep investor documents organized and easy to share."
          : "Create a data room for pitch materials, diligence files, and signed agreements.",
      href: `/${publicId}/documents/data-rooms`,
      cta: data.dataRoomCount > 0 ? "View data rooms" : "Create data room",
    },
  ];

  const metrics = [
    {
      label: "Launch progress",
      value: `${progress}%`,
      detail: `${completedTasks} of ${tasks.length} setup tasks complete`,
      icon: RiCheckboxCircleLine,
    },
    {
      label: "Stakeholders",
      value: formatNumber(data.stakeholderCount),
      detail: "People and institutions on the cap table",
      icon: RiGroup2Line,
    },
    {
      label: "Issued equity",
      value: compactFormatter.format(
        data.issuedShareQuantity + data.optionQuantity,
      ),
      detail: `${formatNumber(data.issuedShareCount)} share issuances, ${formatNumber(
        data.optionGrantCount,
      )} option grants`,
      icon: RiPieChartLine,
    },
    {
      label: "Capital recorded",
      value: currencyFormatter.format(data.capitalRaised),
      detail: `${formatNumber(data.safeCount)} SAFEs tracked`,
      icon: RiMoneyDollarCircleLine,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-sm">
        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_20rem] lg:p-10">
          <div className="space-y-6">
            <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
              Launch dashboard
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
                Get {data.company.name} investor-ready from one workspace.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                A founder-focused setup guide for building the company profile,
                creating a cap table, issuing equity, and preparing for your
                first fundraise.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${publicId}/stakeholders`}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "bg-white text-slate-950 hover:bg-slate-100",
                )}
              >
                Continue setup
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
              <Link
                href={`/${publicId}/captable`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
                )}
              >
                View cap table
              </Link>
            </div>
          </div>

          <Card className="border-white/10 bg-white/10 text-white shadow-none">
            <CardHeader>
              <CardDescription className="text-slate-300">
                Setup progress
              </CardDescription>
              <CardTitle className="text-5xl">{progress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-slate-300">
                Complete the remaining tasks to unlock a cleaner operating
                dashboard for equity, documents, and fundraising.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="mt-2 text-2xl">{metric.value}</CardTitle>
              </div>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Your launch tasks</CardTitle>
                <CardDescription>
                  The highest-impact actions for a complete startup workspace.
                </CardDescription>
              </div>
              <Badge variant={completedTasks === tasks.length ? "success" : "info"}>
                {completedTasks}/{tasks.length} complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {tasks.map((task) => (
                <Link
                  href={task.href}
                  key={task.title}
                  className="group flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border",
                        task.done
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-slate-200 bg-slate-50 text-slate-500",
                      )}
                    >
                      <RiCheckLine className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary">
                        {task.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <RiArrowRightLine className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace snapshot</CardTitle>
              <CardDescription>
                What has been added for this company so far.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <SnapshotRow
                icon={RiSafeLine}
                label="Share classes"
                value={formatNumber(data.shareClassCount)}
              />
              <SnapshotRow
                icon={RiFileTextLine}
                label="Equity plans"
                value={formatNumber(data.equityPlanCount)}
              />
              <SnapshotRow
                icon={RiFolder5Line}
                label="Documents"
                value={formatNumber(data.documentCount)}
              />
              <SnapshotRow
                icon={RiMailSendLine}
                label="Investor updates"
                value={formatNumber(data.updateCount)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Latest changes recorded in the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentAudits.length ? (
                <div className="space-y-4">
                  {data.recentAudits.map((audit) => (
                    <div key={audit.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-medium">
                        {audit.summary ?? "Workspace activity recorded"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {audit.occurredAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No activity has been recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-medium">Recommended next steps</h2>
          <p className="text-sm text-muted-foreground">
            Helpful actions for moving from setup to fundraising readiness.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.title}>
              <CardHeader>
                <CardTitle className="text-base">{recommendation.title}</CardTitle>
                <CardDescription>{recommendation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={recommendation.href}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {recommendation.cta}
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

const SnapshotRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof RiSafeLine;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-medium">{value}</span>
  </div>
);

export default LaunchDashboardPage;

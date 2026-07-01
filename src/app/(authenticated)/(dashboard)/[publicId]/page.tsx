import ActivitiesCard from "@/components/dashboard/overview/activities-card";
import DonutCard from "@/components/dashboard/overview/donut-card";
import EmptyOverview from "@/components/dashboard/overview/empty";
import RecommendationsCard from "@/components/dashboard/overview/recommendations-card";
import SummaryTable from "@/components/dashboard/overview/summary-table";
import TasksCard from "@/components/dashboard/overview/tasks-card";
import OverviewCard from "@/components/dashboard/overview/top-card";
import { withServerComponentSession } from "@/server/auth";
import { api } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

const OverviewPage = async ({
  params: { publicId },
}: {
  params: { publicId: string };
}) => {
  const [{ user }, overview] = await Promise.all([
    withServerComponentSession(),
    api.dashboard.getOverview.query(),
  ]);

  const isNotSetUp =
    overview.stats.stakeholderCount === 0 &&
    overview.shareClassSummary.length === 0;

  if (isNotSetUp) {
    return (
      <EmptyOverview
        firstName={user.name?.split(" ")[0]}
        publicCompanyId={publicId}
      />
    );
  }

  return (
    <>
      <header>
        <h3 className="font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">
          View your company{`'`}s captable overview
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="sm:col-span-12 md:col-span-6 lg:col-span-8">
          {/* Overview */}
          <section className="mt-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <OverviewCard
                title="Amount raised"
                amount={overview.stats.totalRaised}
                prefix="$"
              />
              <OverviewCard
                title="Diluted shares"
                amount={overview.stats.dilutedShares}
              />
              <OverviewCard
                title="Stakeholders"
                amount={overview.stats.stakeholderCount}
                format={false}
              />
            </div>
          </section>

          {/* Tremor chart */}
          <section className="mt-6">
            <DonutCard
              stakeholderBreakdown={overview.stakeholderBreakdown}
              shareClassBreakdown={overview.shareClassBreakdown}
            />
          </section>

          <section className="mt-8">
            <RecommendationsCard publicId={publicId} />
          </section>
        </div>

        <div className="mt-6 space-y-6 sm:col-span-12 md:col-span-6 lg:col-span-4">
          <TasksCard publicId={publicId} tasks={overview.tasks} />

          <ActivitiesCard
            publicId={publicId}
            className="border-none bg-transparent shadow-none"
          />
        </div>
      </div>

      <div className="mt-10">
        <h4 className="font-medium">Summary</h4>
        <p className="text-sm text-muted-foreground">
          Summary of your company{`'`}s captable
        </p>

        <SummaryTable
          shareClasses={overview.shareClassSummary}
          totalRaised={overview.stats.totalRaised}
        />
      </div>
    </>
  );
};

export default OverviewPage;

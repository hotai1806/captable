import { createTRPCRouter } from "@/trpc/api/trpc";
import { getOverviewProcedure } from "./procedures/get-overview";

export const dashboardRouter = createTRPCRouter({
  getOverview: getOverviewProcedure,
});

import { withServerComponentSession } from "@/server/auth";
import { redirect } from "next/navigation";

const CorporationLaunchDashboardPage = async () => {
  const {
    user: { companyPublicId },
  } = await withServerComponentSession();

  redirect(`/${companyPublicId}/launch-dashboard`);
};

export default CorporationLaunchDashboardPage;

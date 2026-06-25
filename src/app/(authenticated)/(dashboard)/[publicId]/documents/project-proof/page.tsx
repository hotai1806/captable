import EmptyState from "@/components/common/empty-state";
import { PageLayout } from "@/components/dashboard/page-layout";
import { Card } from "@/components/ui/card";
import { UnAuthorizedState } from "@/components/ui/un-authorized-state";
import { TAG } from "@/lib/tags";
import { serverAccessControl } from "@/lib/rbac/access-control";
import { withServerComponentSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { RiUploadCloudLine } from "@remixicon/react";
import type { Metadata } from "next";
import DocumentsTable from "../components/table";
import { DocumentUploadButton } from "../document-upload-button";

export const metadata: Metadata = {
  title: "Project proof documents",
};

const ProjectProofDocumentsPage = async () => {
  const { allow } = await serverAccessControl();
  const session = await withServerComponentSession();

  const documents = await allow(
    api.document.getAll.query({
      tags: [TAG.PROJECT_PROOF],
    }),
    ["documents", "read"],
  );

  const canUpload = allow(true, ["documents", "read"]);

  if (!documents) {
    return <UnAuthorizedState />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<RiUploadCloudLine />}
        title="You do not have any project proof documents yet."
        subtitle="Upload permits, contracts, photos, financials, and other supporting evidence for your project."
      >
        {canUpload && (
          <DocumentUploadButton
            companyPublicId={session.user.companyPublicId}
            buttonDisplayName="Upload a project document"
            title="Upload a project proof document"
            subtitle="Upload permits, ownership records, contracts, photos, and other materials that support your project."
            keyPrefix="project-proof-documents"
            tags={[TAG.PROJECT_PROOF]}
          />
        )}
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <PageLayout
        title="Project proof documents"
        description="Keep all project evidence in one place, including permits, contracts, ownership records, site photos, and supporting financial documents."
        action={
          canUpload ? (
            <DocumentUploadButton
              companyPublicId={session.user.companyPublicId}
              buttonDisplayName="Project document"
              title="Upload a project proof document"
              subtitle="Upload permits, ownership records, contracts, photos, and other materials that support your project."
              keyPrefix="project-proof-documents"
              tags={[TAG.PROJECT_PROOF]}
            />
          ) : null
        }
      />
      <Card className="mt-3">
        <div className="p-6">
          <DocumentsTable
            companyPublicId={session.user.companyPublicId}
            documents={documents}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProjectProofDocumentsPage;

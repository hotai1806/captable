"use client";

import Modal from "@/components/common/push-modal";
import Uploader, { type UploadReturn } from "@/components/ui/uploader";
import { TAG, type TagType } from "@/lib/tags";
import type { TypeKeyPrefixes } from "@/server/file-uploads";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

type DocumentUploadModalProps = {
  companyPublicId: string;
  title?: string;
  subtitle?: string;
  keyPrefix?: TypeKeyPrefixes;
  tags?: TagType[];
};

export const DocumentUploadModal = ({
  companyPublicId,
  title = "Upload a document",
  subtitle = "Upload a document to your company's document library.",
  keyPrefix = "generic-documents",
  tags = [TAG.GENERIC],
}: DocumentUploadModalProps) => {
  const router = useRouter();

  const { mutateAsync } = api.document.create.useMutation();

  return (
    <Modal title={title} subtitle={subtitle}>
      <Uploader
        shouldUpload={true}
        identifier={companyPublicId}
        keyPrefix={keyPrefix}
        tags={tags}
        onSuccess={async (uploadedData: UploadReturn) => {
          await mutateAsync({
            name: uploadedData.name,
            bucketId: uploadedData.id,
          });

          router.refresh();
        }}
      />
    </Modal>
  );
};

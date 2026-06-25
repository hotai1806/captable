"use client";

import { pushModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import type { TagType } from "@/lib/tags";
import type { TypeKeyPrefixes } from "@/server/file-uploads";
import { RiAddFill } from "@remixicon/react";
import React from "react";

type DocumentUploadButtonProps = {
  companyPublicId: string;
  buttonDisplayName: string;
  title?: string;
  subtitle?: string;
  keyPrefix?: TypeKeyPrefixes;
  tags?: TagType[];
};

export const DocumentUploadButton = ({
  companyPublicId,
  buttonDisplayName,
  title,
  subtitle,
  keyPrefix,
  tags,
}: DocumentUploadButtonProps) => {
  return (
    <Button
      onClick={() => {
        pushModal("DocumentUploadModal", {
          companyPublicId,
          title,
          subtitle,
          keyPrefix,
          tags,
        });
      }}
    >
      <RiAddFill className="mr-2 h-5 w-5" />
      {buttonDisplayName}
    </Button>
  );
};

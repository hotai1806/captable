import { z } from "zod";

export enum TAG {
  SAFE = "safe",
  ESIGN = "esign",
  EQUITY = "equity",
  DATA_ROOM = "data-room",
  PROJECT_PROOF = "project-proof",
  GENERIC = "generic",
}

const TagSchema = z.nativeEnum(TAG);
export type TagType = z.infer<typeof TagSchema>;

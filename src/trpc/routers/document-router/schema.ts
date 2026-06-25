import { TAG } from "@/lib/tags";
import { z } from "zod";

export const ZodCreateDocumentMutationSchema = z.object({
  name: z.string(),
  bucketId: z.string(),
});

export type TypeZodCreateDocumentMutationSchema = z.infer<
  typeof ZodCreateDocumentMutationSchema
>;

export const ZodGetAllDocumentsQuerySchema = z
  .object({
    tags: z.array(z.nativeEnum(TAG)).optional(),
  })
  .optional();

export type TypeZodGetAllDocumentsQuerySchema = z.infer<
  typeof ZodGetAllDocumentsQuerySchema
>;

export const ZodGetDocumentQuerySchema = z.object({
  publicId: z.string(),
});

export type TypeZodGetDocumentQuerySchema = z.infer<
  typeof ZodGetDocumentQuerySchema
>;

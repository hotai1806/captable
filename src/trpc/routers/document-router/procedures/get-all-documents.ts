import { withAccessControl } from "@/trpc/api/trpc";
import { ZodGetAllDocumentsQuerySchema } from "../schema";

export const getAllDocumentsProcedure = withAccessControl
  .meta({ policies: { documents: { allow: ["read"] } } })
  .input(ZodGetAllDocumentsQuerySchema)
  .query(
    async ({
      ctx: {
        db,
        membership: { companyId },
      },
      input,
    }) => {
      const data = await db.document.findMany({
        where: {
          companyId,
          ...(input?.tags?.length
            ? {
                bucket: {
                  tags: {
                    hasSome: input.tags,
                  },
                },
              }
            : {}),
        },
        include: {
          uploader: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          bucket: {
            select: {
              id: true,
              key: true,
              mimeType: true,
              size: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return data;
    },
  );

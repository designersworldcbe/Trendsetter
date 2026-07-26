import { createUploadthing, type FileRouter } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const uploadthingRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req, res }) => {
      const session = await auth(req, res);
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
  
  modelUploader: f({ 
    "application/octet-stream": { maxFileSize: "50MB", maxFileCount: 5 }
  })
    .middleware(async ({ req, res }) => {
      const session = await auth(req, res);
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
  
  documentUploader: f({ 
    pdf: { maxFileSize: "10MB", maxFileCount: 5 }
  })
    .middleware(async ({ req, res }) => {
      const session = await auth(req, res);
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadthingRouter;

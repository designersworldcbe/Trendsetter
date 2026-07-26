import { createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const uploadthingRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
  
  modelUploader: f({ 
    "application/octet-stream": { maxFileSize: "32MB", maxFileCount: 5 }
  })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
  
  documentUploader: f({ 
    pdf: { maxFileSize: "8MB", maxFileCount: 5 }
  })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
};

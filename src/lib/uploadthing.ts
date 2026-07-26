import { UploadThing } from "uploadthing/server";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const utApi = UploadThing({
  apiKey: process.env.UPLOADTHING_SECRET,
});

export const utRoutes = {
  apiRouter: {},
  middleware: () => {
    return {};
  },
};

export type UploadThingRouter = typeof import("@/app/api/uploadthing/core").default;

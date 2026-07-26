import { createRouteHandler } from "uploadthing/server/adapters/next";
import { uploadthingRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: uploadthingRouter,
});

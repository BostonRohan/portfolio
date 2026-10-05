import { defineMiddleware } from "astro:middleware";

import { createHomepageDiagnostics } from "./utils/homepageDiagnostics.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname !== "/") {
    return next();
  }

  const diagnostics = createHomepageDiagnostics();
  context.locals.homepageDiagnostics = diagnostics;
  try {
    const response = await next();
    diagnostics.finish("response-created", response.status);
    return response;
  } catch (error) {
    diagnostics.finish("failed");
    throw error;
  }
});

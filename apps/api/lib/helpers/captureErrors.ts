// import * as Sentry from "@sentry/nextjs";
import type { NextMiddleware } from "next-api-middleware";
import type { LogArgument } from "rollbar";
import Rollbar from "rollbar";

import { redactError } from "@calcom/lib/redactError";

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export const captureErrors: NextMiddleware = async (_req, res, next) => {
  try {
    // Catch any errors that are thrown in remaining
    // middleware and the API route handler
    await next();
  } catch (error) {
    // Sentry.captureException(error);
    rollbar.error(error as LogArgument);
    const redactedError = redactError(error);
    if (redactedError instanceof Error) {
      res.status(400).json({ message: redactedError.message, error: redactedError });
      return;
    }
    res.status(400).json({ message: "Something went wrong", error });
  }
};

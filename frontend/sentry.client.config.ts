// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e85f04ab69c76f33f183fec0574417ca@o4507960601214976.ingest.de.sentry.io/4507960603115600",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  integrations: [
    Sentry.feedbackIntegration({
      triggerLabel: "Send feedback",
      formTitle: "Send feedback",
      submitButtonLabel: "Send",
      colorScheme: "system",
      autoInject: false,
    }),
    Sentry.captureConsoleIntegration({
      levels: ["error", "warn"],
    }),
  ],
});

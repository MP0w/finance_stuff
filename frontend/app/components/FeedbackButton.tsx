import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function FeedbackButton() {
  const [feedback, setFeedback] =
    useState<ReturnType<typeof Sentry.getFeedback>>(undefined);

  useEffect(() => {
    setFeedback(Sentry.getFeedback());
  }, []);

  if (!feedback) {
    return null;
  }
  return (
    <button
      type="button"
      className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
      onClick={async () => {
        const form = await feedback.createForm();
        form.appendToDom();
        form.open();
      }}
    >
      Send feedback
    </button>
  );
}

import { useEffect, useState } from "react";
import { getFeedback } from "@sentry/nextjs";

export default function FeedbackButton() {
  const [feedback, setFeedback] =
    useState<ReturnType<typeof getFeedback>>(undefined);

  useEffect(() => {
    setFeedback(getFeedback());
  }, []);

  if (!feedback) {
    return null;
  }
  return (
    <button
      type="button"
      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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

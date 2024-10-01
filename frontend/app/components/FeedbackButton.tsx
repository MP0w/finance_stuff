import { useEffect, useState } from "react";
import { getFeedback } from "@sentry/nextjs";
import { useTranslation } from "react-i18next";

export default function FeedbackButton() {
  const [feedback, setFeedback] =
    useState<ReturnType<typeof getFeedback>>(undefined);
  const { t } = useTranslation();

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
      {t("feedbackButton.sendFeedback")}
    </button>
  );
}

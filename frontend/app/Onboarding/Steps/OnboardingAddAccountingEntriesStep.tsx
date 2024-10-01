import React, { useState } from "react";
import { OnboardingProps } from "../Onboarding";
import DatePicker from "react-datepicker";
import { DateTime } from "luxon";
import { getFirstDaysOfMonth } from "../OnboardingAppPreview";
import { useTranslation } from "react-i18next";

export function OnboardingAddAccountingEntriesStep({
  props,
  nextStep,
}: {
  props: OnboardingProps;
  nextStep: () => void;
}) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(
    getFirstDaysOfMonth(new Date(), 1)[0]
  );

  return (
    <div className="mb-8 max-w-prose">
      {t("onboardingAddAccountingEntriesStep.regularEntry")}
      <br />
      {t("onboardingAddAccountingEntriesStep.entryApplies")}
      <br />
      {t("onboardingAddAccountingEntriesStep.entryUsage")}
      <b>{t("common.summary")}</b> {t("common.together")}{" "}
      <b>{t("common.graphs")}</b>, <b>{t("common.statistics")}</b>{" "}
      {t("common.and")} <b>{t("common.projections")}</b>.
      <div className="flex flex-col items-center mt-8">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            if (date) {
              setSelectedDate(date);
            }
          }}
          inline
          dayClassName={() => "pixel-corners-small"}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 pixel-corners-small mt-4"
          onClick={async () => {
            await props.actions.handleCreateAccountingEntry(
              DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd")
            );
            nextStep();
          }}
        >
          {t("onboardingAddAccountingEntriesStep.addEntry")}
        </button>
      </div>
    </div>
  );
}

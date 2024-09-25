import React, { useState } from "react";
import { OnboardingProps } from "../Onboarding";
import DatePicker from "react-datepicker";
import { DateTime } from "luxon";
import { getFirstDaysOfMonth } from "../OnboardingAppPreview";

export function OnboardingAddAccountingEntriesStep({
  props,
  nextStep,
}: {
  props: OnboardingProps;
  nextStep: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(
    getFirstDaysOfMonth(new Date(), 1)[0]
  );

  return (
    <div className="mb-8 max-w-prose">
      Regularly, for example each 1st of the month, you will add an entry.
      <br />
      An entry applies to all your bank accounts and investments.
      <br />
      Once you fill in the data for an entry, it will be used to do your
      accounting, you will be able to see it in <b>Summary</b> together with{" "}
      <b>graphs</b>, <b>statistics</b> and <b>projections</b>.
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
          Add Entry
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { OnboardingProps } from "../Onboarding";
import { DateTime } from "luxon";
import AccountsTable from "@/app/Home/Accounts/AccountsTable";
import InvestmentTable from "@/app/Home/Investments/InvestmentTable";

export function OnboardingFillAccountingEntriesStep({
  props,
}: {
  props: OnboardingProps;
  nextStep: () => void;
}) {
  const lastEntry = props.data.accountingEntries.at(-1);
  const firstAccount = props.data.accounts.at(0);
  const empty = !lastEntry || !firstAccount;
  const firstFiatAccount = props.data.accounts.find(
    (account) => account.type === "fiat"
  );
  const firstInvestmentAccount = props.data.accounts.find(
    (account) => account.type === "investment"
  );

  return (
    <div>
      {empty &&
        "You need at least one account and one entry to fill in the data. Go back to add them!"}
      {!empty && (
        <div>
          <div className="mb-8 max-w-prose">
            Now that you have an entry for{" "}
            <b>
              {lastEntry &&
                DateTime.fromFormat(lastEntry.date, "yyyy-MM-dd")
                  .toJSDate()
                  .toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
            </b>
            , you can fill in the data in the tables for each account or later
            on you can connect your accounts to external providers to auto-fill
            them.
            <br />
            <br />
            Fill in the glowing red cells and then your are done for that entry.
            <br />
            <b>TIP:</b> You can hover the table headers for more info!
          </div>
          {firstFiatAccount && (
            <div>
              <h3>Bank Accounts</h3>
              <AccountsTable
                accounts={[firstFiatAccount]}
                accountingEntries={[lastEntry]}
                handleCellChange={props.actions.handleCellChange}
              />
            </div>
          )}
          {firstInvestmentAccount && (
            <InvestmentTable
              account={firstInvestmentAccount}
              accountingEntries={[lastEntry]}
              handleCellChange={props.actions.handleCellChange}
            />
          )}
        </div>
      )}
    </div>
  );
}

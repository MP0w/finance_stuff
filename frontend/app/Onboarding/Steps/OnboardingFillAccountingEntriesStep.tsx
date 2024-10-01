import React from "react";
import { OnboardingProps } from "../Onboarding";
import { DateTime } from "luxon";
import AccountsTable from "@/app/Home/Accounts/AccountsTable";
import InvestmentTable from "@/app/Home/Investments/InvestmentTable";
import { useTranslation } from "react-i18next";

export function OnboardingFillAccountingEntriesStep({
  props,
}: {
  props: OnboardingProps;
  nextStep: () => void;
}) {
  const { t } = useTranslation();
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
      {empty && t("onboardingFillAccountingEntriesStep.emptyMessage")}
      {!empty && (
        <div>
          <div className="mb-8 max-w-prose">
            {t("onboardingFillAccountingEntriesStep.introText")}{" "}
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
            , {t("onboardingFillAccountingEntriesStep.fillInstructions")}
            <br />
            <br />
            {t("onboardingFillAccountingEntriesStep.glowingCellsInstruction")}
            <br />
            <b>{t("onboardingFillAccountingEntriesStep.tip")}</b>{" "}
            {t("onboardingFillAccountingEntriesStep.hoverInstruction")}
          </div>
          {firstFiatAccount && (
            <div>
              <h3>{t("onboardingFillAccountingEntriesStep.bankAccounts")}</h3>
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

import { ArcherContainer } from "react-archer";
import { tabs } from "../Home/HomeContent";
import TabView from "../Home/TabView";
import { OnboardingProps } from "./Onboarding";
import { AccountType } from "../../../shared/types";
import { useMemo } from "react";
import Table from "@/app/Home/Table";

export function OnboardingAppPreview({
  props,
  tab,
  mockEntries,
}: {
  props: OnboardingProps;
  tab?: AccountType;
  mockEntries: boolean;
}) {
  function getBestType() {
    const fiatAccounts = props.data.accounts.filter(
      (account) => account.type === "fiat"
    );
    const investmentAccounts = props.data.accounts.filter(
      (account) => account.type === "investment"
    );
    return fiatAccounts.length >= investmentAccounts.length
      ? "fiat"
      : "investment";
  }

  const type = tab ?? getBestType();

  const accounts = useMemo(() => {
    const accounts = props.data.accounts.filter(
      (account) => account.type === type
    );
    return accounts.length > 0
      ? accounts
      : [
          { id: "1", name: "Account 1", type },
          { id: "2", name: "Account 2", type },
          { id: "3", name: "Account 3", type },
        ];
  }, [props.data.accounts, type]);

  const existingEntriesDates = props.data.accountingEntries.map(
    (e) => new Date(e.date)
  );

  const dates = mockEntries
    ? getFirstDaysOfMonth(new Date(), 3)
    : existingEntriesDates;

  const rows = dates.map((date) => {
    const values = accounts.map(() => ({
      value: Math.random() * 1000,
      color: "bg-white",
    }));
    const total = values.reduce((acc, curr) => acc + curr.value, 0);
    return { date, values, total };
  });

  return (
    <div className="flex items-center overflow-hidden">
      <div className="w-[900px] h-[600px] border-[16px] border-gray-400 rounded-[24px] overflow-hidden shadow-xl bg-white flex-shrink-0">
        <ArcherContainer strokeColor="gray" className="w-full h-full">
          <TabView
            email={undefined}
            signOut={() => {}}
            tabs={tabs}
            activeTab={type === "fiat" ? "fiat" : "investments"}
            setActiveTab={() => {}}
            exportData={() => {}}
            hideSettings={true}
          >
            <div className="text-sm">
              <Table
                onAddEntry={
                  mockEntries
                    ? undefined
                    : props.actions.handleCreateAccountingEntry
                }
                headers={[
                  {
                    title: "Date",
                  },
                  ...accounts.map((account) => ({
                    title: account.name,
                  })),
                  {
                    title: "Total",
                  },
                ]}
                rows={rows.map((row) => [
                  {
                    value: row.date,
                    color: "bg-gray-100",
                  },
                  ...row.values,
                  {
                    value: row.total,
                    color: "bg-gray-100",
                  },
                ])}
              />
            </div>
          </TabView>
        </ArcherContainer>
      </div>
    </div>
  );
}

export function getFirstDaysOfMonth(date: Date, count: number): Date[] {
  const result: Date[] = [];
  const currentDate = new Date(date);

  for (let i = 0; i < count; i++) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    result.push(firstDayOfMonth);

    // Move to the previous month
    if (month === 0) {
      // If it's January, go to December of the previous year
      currentDate.setFullYear(year - 1, 11, 1);
    } else {
      currentDate.setMonth(month - 1);
    }
  }

  return result;
}

export default OnboardingAppPreview;

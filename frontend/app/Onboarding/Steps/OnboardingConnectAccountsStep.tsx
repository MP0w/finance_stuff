import ConnectorsTab from "@/app/Home/Connectors/ConnectorTab";
import React from "react";
import { Accounts } from "../../../../shared/types";

export function OnboardingConnectAccountsStep(props: {
  accounts: Accounts[];
  fetchAccountingEntries: () => void;
}) {
  return (
    <ConnectorsTab
      accounts={props.accounts ?? []}
      onAddConnection={() => {
        props.fetchAccountingEntries();
      }}
      isOnboarding={true}
    />
  );
}

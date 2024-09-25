import React, { useMemo, useState } from "react";
import { AccountType } from "../../../../shared/types";
import { OnboardingProps } from "../Onboarding";

export function OnboardingAddAccountsStep({
  props,
  type,
}: {
  props: OnboardingProps;
  type: AccountType;
}) {
  const [newAccountName, setNewAccountName] = useState("");
  const { accounts, accountNames } = useMemo(() => {
    const accounts = props.data.accounts.filter(
      (account) => account.type === type
    );
    const accountNames = new Set(accounts.map((account) => account.name));
    return { accounts, accountNames };
  }, [props.data.accounts, type]);

  return (
    <div>
      {type === "fiat" && (
        <p className="mb-4 max-w-prose">
          Any account where, unlike investment accounts,{" "}
          <b>you don&apos;t expect the value to fluctuate</b> unless you
          add/spend/remove money from it.
          <br />
          For example: bank accounts, cash, even loans or debt you have with
          someone (using negative values)
        </p>
      )}
      {type === "investment" && (
        <p className="mb-4 max-w-prose">
          Unlike Bank accounts, Investments accounts are accounts{" "}
          <b>where you expect value to fluctuate</b> even if you won&apos;t add
          or remove money.
          <br />
          For example: stocks, crypto, bonds. You initially invest an amount,
          might add/remove each month but their value also fluctuates.
        </p>
      )}
      <div className="flex flex-wrap gap-4 max-w-xs">
        {(type === "fiat"
          ? ["Bank", "Cash", "Credit Card"]
          : ["Stocks", "Crypto", "Ethereum", "Bitcoin", "Bonds", "House"]
        )
          .filter((account) => !accountNames.has(account))
          .map((account) => (
            <button
              className={`py-1 px-2 rounded-md border border-gray-500`}
              key={account}
              onClick={() => {
                props.actions.handleCreateAccount(account, type);
              }}
            >
              {account}
            </button>
          ))}
      </div>
      <div className="my-4 flex">
        <input
          type="text"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder={"Account name"}
          className="border rounded px-2 py-1 mr-2"
        />
        <button
          onClick={async () => {
            await props.actions.handleCreateAccount(newAccountName, type);
            setNewAccountName("");
          }}
          className="bg-gray-600 text-white px-4 py-1 pixel-corners-small hover:bg-gray-800 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={newAccountName.length === 0}
        >
          Create
        </button>
      </div>
      <div className="flex flex-wrap gap-4 max-w-xs">
        {accounts.map((account) => (
          <div
            className={`${
              type === "fiat" ? "bg-indigo-200" : "bg-lime-200"
            } py-1 px-2 rounded-md border relative group`}
            key={account.id}
          >
            {account.name}
            <button
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => props.actions.confirmDeleteAccount(account.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OnboardingAddAccountsStepUI({}) {
  return <div>UI</div>;
}

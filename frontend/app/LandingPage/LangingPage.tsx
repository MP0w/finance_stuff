import React from "react";
import { useUserState } from "../UserState";
import TotalTable, { TotalTableProps } from "../Home/Summary/TotalTable";
import {
  mockAccountingEntries,
  mockFiatAccounts,
  mockInvestmentsAccounts,
} from "./mockData";
import Link from "next/link";

const LandingPage: React.FC<{ showLogin: () => void }> = ({ showLogin }) => {
  const { user, loaded } = useUserState();
  if (user || !loaded) {
    return <></>;
  }

  const mock: TotalTableProps = {
    title: undefined,
    fiatAccounts: mockFiatAccounts,
    investmentAccounts: mockInvestmentsAccounts,
    accountingEntries: mockAccountingEntries,
    onAddEntry: () => {},
    onDeleteAccountingEntry: () => {},
  };

  return (
    <div className="p-8 md:p-16 flex flex-col items-center min-h-screen bg-gray-50">
      <header className="text-center mb-12 max-w-4xl w-full">
        <h1 className="text-4xl md:text-6xl mb-2 text-gray-600">
          finance_stuff
        </h1>
        <p className="text-xl md:text-2xl text-gray-800">
          10 minutes a month to keep your finances in order
        </p>
      </header>

      <main className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl w-full mb-4">
        <section className="w-full md:w-1/2">
          <div>
            <ul className="space-y-2">
              {[
                "Keep your finances under control",
                "Track all your bank accounts",
                "Track all your investments",
                "Manage and monitor your investments",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="w-full md:w-1/2">
          <div>
            <ul className="space-y-2">
              {[
                "AI insights & recommendations",
                "Financial summaries",
                "Visualize your finances with graphs",
                "Plan for the future",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <button
        onClick={showLogin}
        className="mt-8 w-1/2 max-w-4xl text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 pixel-corners-small"
      >
        Get in
      </button>

      <div className="mt-8 w-full max-w-4xl">
        <TotalTable
          title={mock.title}
          fiatAccounts={mock.fiatAccounts}
          investmentAccounts={mock.investmentAccounts}
          accountingEntries={mock.accountingEntries}
          onAddEntry={mock.onAddEntry}
          onDeleteAccountingEntry={mock.onDeleteAccountingEntry}
        />
      </div>

      <footer className="mt-12 text-center text-gray-600 w-full max-w-4xl">
        <p>
          stuff.finance <b>-</b> info@stuff.finance
        </p>
        <p>
          <Link href="/privacy">Privacy Policy</Link>
          <b> - </b>
          <Link href="/terms">Terms of Service</Link>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

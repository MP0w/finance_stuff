import React from "react";
import { useUserState } from "../UserState";
import TotalTable, { TotalTableProps } from "../Home/Summary/TotalTable";
import {
  mockAccountingEntries,
  mockFiatAccounts,
  mockInvestmentsAccounts,
} from "./mockData";
import Link from "next/link";
import { ChatMessage } from "../Home/ChatTab";

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
    liveAccountingEntry: undefined,
  };

  return (
    <div className="p-4 pt-8 flex flex-col items-center min-h-screen">
      <header className="text-center mb-8 max-w-4xl w-full">
        <h1 className="text-4xl md:text-6xl mb-2">finance_stuff</h1>
        <p className="text-xl md:text-2xl mt-8">
          Effortlessly Track & Grow your Finances
          <br />
          in just 10 minutes a month
        </p>
      </header>

      <main className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl w-full mb-8">
        <section className="w-full md:w-1/2">
          <h3 className="text-center">AI Assistant</h3>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
            {[
              {
                content:
                  "I'm thinking of buying a flat, do you think I can pay off the mortgage safely?",
                role: "user",
              },
              {
                content:
                  "Based on your income, a mortgage payment of up to 1200€/month should be manageable. Consider properties below 300,000€. Your savings could cover a 10-15% down payment. It's feasible!",
                role: "assistant",
              },
            ].map((msg, index) => (
              <ChatMessage key={index} message={msg} maxWidth={90} />
            ))}
          </div>
        </section>
        <section className="w-full md:w-1/2 ">
          <h3 className="text-center">Key Features</h3>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <ul className="space-y-2">
              {[
                "Track All Accounts and Investments",
                "AI Powered Insights for Smarter Decisions",
                "Visualize Your Growth",
                "Easy Future Planning & Projections",
                "Connect your accounts to automate your tracking",
                "Export/Import your spreadsheets",
                "Graphs and Charts",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"
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
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <div className="flex flex-col justify-center gap-4 text-center font-bold w-full max-w-sm">
        <button
          onClick={showLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 g rounded transition duration-300 pixel-corners-small"
        >
          Get Started for Free
        </button>
        <button
          onClick={showLogin}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded transition duration-300 pixel-corners-small"
        >
          Login
        </button>
      </div>

      <div className="mt-4 w-full max-w-4xl">
        <TotalTable
          liveAccountingEntry={undefined}
          title={mock.title}
          fiatAccounts={mock.fiatAccounts}
          investmentAccounts={mock.investmentAccounts}
          accountingEntries={mock.accountingEntries}
          onAddEntry={mock.onAddEntry}
          onDeleteAccountingEntry={mock.onDeleteAccountingEntry}
        />
      </div>

      <footer className="mt-12 text-center w-full max-w-4xl">
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

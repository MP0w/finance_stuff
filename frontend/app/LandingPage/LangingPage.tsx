import React, { useState } from "react";
import { useUserState } from "../UserState";
import TotalTable, { TotalTableProps } from "../Home/Summary/TotalTable";
import {
  mockAccountingEntries,
  mockFiatAccounts,
  mockInvestmentsAccounts,
} from "./mockData";
import Link from "next/link";
import { ChatMessage } from "../Home/Chat/ChatTab";
import Loading from "../components/Loading";
import LogScreenView from "../components/LogScreenView";

const LandingPage: React.FC<{
  showLogin: () => void;
  type: "expenses" | "budgeting" | "savings" | "spreadsheet" | "default";
}> = ({ showLogin, type }) => {
  const { user, loaded } = useUserState();
  const [expandedFAQ, setExpandedFAQ] = useState<string>("security");

  if (user || !loaded) {
    return <></>;
  }

  const getKeyFeatures = () => {
    if (type === "expenses") {
      return [
        ["💼", "Track expenses, accounts and investments"],
        ["🔮", "AI Powered Insights for Smarter Decisions"],
        ["🪄", "Automagically Import Expenses"],
        ["📈", "Visualize Your Growth"],
        ["🎯", "Easy Future Planning & Projections"],
        ["🔗", "Connect your accounts to automate your tracking"],
      ];
    } else if (type === "budgeting") {
      return [
        ["💼", "Track expenses, accounts and investments"],
        ["🔮", "AI Powered Insights to help you budget"],
        ["🪄", "Automagically Import Expenses"],
        ["📈", "Visualize Your Growth"],
        ["🎯", "Easy Budgeting & Projections"],
        ["🔗", "Connect your accounts to automate your tracking"],
      ];
    } else if (type === "savings") {
      return [
        ["💼", "Track All Accounts and Investments"],
        ["🔮", "AI Powered Insights to help you save"],
        ["🪄", "Automagically Import Spreadsheets"],
        ["📈", "Visualize Your Savings"],
        ["🎯", "Easy Saving Goals & Projections"],
        ["🔗", "Connect your accounts to automate your tracking"],
      ];
    } else if (type === "spreadsheet") {
      return [
        ["🪄", "Automagically Import Spreadsheets"],
        ["💼", "Track All Accounts and Investments"],
        ["🔮", "AI Powered, more powerful than a spreadsheet"],
        ["📈", "Visualize Your Growth"],
        ["🎯", "Easy Future Planning & Projections"],
        ["🔗", "Connect your accounts to automate your tracking"],
      ];
    }

    return [
      ["💼", "Track All Accounts and Investments"],
      ["🔮", "AI Powered Insights for Smarter Decisions"],
      ["🪄", "Automagically Import Spreadsheets"],
      ["📈", "Visualize Your Growth"],
      ["🎯", "Easy Future Planning & Projections"],
      ["🔗", "Connect your accounts to automate your tracking"],
    ];
  };
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
    <div className="p-4 pt-8 min-h-screen flex flex-col items-center from-gray-100 to-purple-100 via-blue-100 bg-gradient-to-b">
      <LogScreenView screenName="landing_page" />
      <div className="w-full max-w-4xl flex flex-col items-center">
        <header className="text-center mb-6 w-full">
          <h1 className="text-5xl md:text-6xl mb-2">finance_stuff</h1>
          <p className="text-xl md:text-2xl mt-8">
            Effortlessly Track & Grow your Finances
            <br />
            in just 10 minutes a month
          </p>
        </header>

        <div className="flex flex-col justify-center gap-4 text-center font-semibold w-full max-w-sm text-lg tracking-wide relative">
          <span className="text-center bg-red-600 text-sm font-semibold text-white px-2 py-1 rounded-lg border border-white transform rotate-12 shadow-md z-10 absolute -right-4 top-0">
            Free for
            <br />
            limited time!
          </span>
          <button
            onClick={showLogin}
            className="mt-8 from-blue-500 to-purple-500 via-blue-600 bg-gradient-to-r hover:from-blue-800 hover:to-blue-700 text-white py-3 px-6 rounded transition duration-300 pixel-corners-small relative"
          >
            Get Started
          </button>
          <button
            onClick={showLogin}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded transition duration-300 pixel-corners-small"
          >
            Login
          </button>
        </div>

        <main className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl w-full my-8">
          <section className="w-full md:w-1/2 ">
            <h2 className="text-center">Key Features</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <ul className="space-y-2">
                {getKeyFeatures().map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">{feature[0]}</span>
                    <span>{feature[1]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section className="w-full md:w-1/2">
            <h2 className="text-center">AI Assistant</h2>
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-lg border text-sm">
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
                <ChatMessage key={index} message={msg} small={true} />
              ))}
            </div>
          </section>
        </main>

        {type === "default" && (
          <blockquote className="border-l-4 border-gray-600 pl-4 m-4 font-semibold">
            Master your money with simple tracking.
            <br />
            Manage spending, savings, and investments effortlessly!
            <br />
            Start building better financial habits today.
          </blockquote>
        )}

        {type === "expenses" && (
          <blockquote className="border-l-4 border-gray-600 pl-4 m-4 font-semibold">
            Track your expenses automatically using bank statements.
            <br />
            Tracking expense is time consuming, let us do it for you.
          </blockquote>
        )}

        {type === "savings" && (
          <blockquote className="border-l-4 border-gray-600 pl-4 m-4 font-semibold">
            Track your savings and achieve your goals.
            <br />
            Manage your spending, savings, and investments effortlessly!
            <br />
            Start improving your savings today.
          </blockquote>
        )}

        {type === "budgeting" && (
          <blockquote className="border-l-4 border-gray-600 pl-4 m-4 font-semibold">
            We help you budget and track your savings.
            <br />
            Manage your budgets, spending, and investments effortlessly!
          </blockquote>
        )}

        {type === "spreadsheet" && (
          <blockquote className="border-l-4 border-gray-600 pl-4 m-4 font-semibold">
            Spreadsheets are great and very powerful. But they can get very
            complex.
            <br />
            After years of over-engineering a personal finance spreadsheet we
            decided to turn it into an app, to make it simpler and more
            powerful.
            <br />
            It&apos;s tailored to tracking personal finances and easier to use.
          </blockquote>
        )}

        <div className="mt-4 w-full">
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

        <section className="w-full max-w-3xl mt-12">
          <h2 className="text-center">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {[
              {
                key: "security",
                q: "Is my data secure?",
                a: "Your financial data is very sensitive, first of all we offer an anonymous sign up option if you prefer to use it. Other than that the most sensitive data is encrypted in the database.",
              },
              {
                key: "why",
                q: "Why should I track my personal finances?",
                a: "Tracking your personal finances is crucial for achieving financial stability and growth. It helps you understand your spending habits, identify areas for improvement, set realistic financial goals, and make informed decisions about your money. By consistently monitoring your finances, you can build better saving habits, reduce debt, plan for the future, and ultimately gain peace of mind about your financial situation.",
              },
              {
                key: "spreadsheet",
                q: "I already use a spreadsheet, why should I switch over?",
                a: "While spreadsheets are versatile but can get very complex and not user friendly when you want to get more data and insights out of them. finance_stuff offers several advantages:\n1) Automated data import and updates save time and reduce errors. Even simply adding a new bank account or investement in a spreadsheet is time consuming.\n2) Our AI-powered assistant gives you contextual information and can help you make decisions.\n3) User-friendly interface makes tracking and visualizing your finances easier.\n4) Advanced features like statistics and future projections are built-in.\n5) Secure cloud storage ensures your data is safe and accessible across devices.\n6) Regular updates add new features without you having to redesign your spreadsheet.",
              },
              {
                key: "import",
                q: "Can I import data from other apps?",
                a: "Absolutely! We offer an importer from CSV files, most apps should allow you to export your data in CSV, for example google sheets or notion databases.",
              },
              {
                key: "automation",
                q: "Can I automate my personal finance tracking?",
                a: "We offer connections to some popular services to automatically get your balances, for example binance or blockchains connectors are already available. Many more to come! Feel free to hit us up to request a connector.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow"
                onClick={() => setExpandedFAQ(faq.key)}
              >
                <p className="text-lg font-semibold">{faq.q}</p>
                {expandedFAQ === faq.key && (
                  <div className="mt-2">
                    {faq.a.split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl mt-12">
          <h2 className="text-center">About Me</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            I&apos;m Alex Manzella, the creator of <b>finance_stuff</b>.
            I&apos;m a Software Engineer with 13 years of experience, in the
            recent years I have been a Principal Engineer at{" "}
            <Link className="underline" href="https://n26.com">
              N26
            </Link>{" "}
            a popular mobile bank in Europe and a Tech Lead at{" "}
            <Link className="underline" href="https://amie.so">
              Amie
            </Link>{" "}
            an amazing productivity app.
            <br />
            <br />
            I&apos;m very interested in finance and worked for many years in
            fintech. I am interested in blockchains and DeFi.
            <br />
            After years of over-engineering my personal finance spreadsheet I
            decided to turn it into an app, to make it simpler and more
            powerful.
          </div>
        </section>

        <section className="flex flex-col items-center w-full md:w-1/2 mt-12 gap-4">
          <div className="flex items-center gap-4">
            <Loading />
            <h2 className="m-0">Coming Soon™️</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <ul className="space-y-2">
              {[
                ["📱", "Mobile Apps"],
                ["🔮", "Automatic expense tracking from bank statements"],
                ["🎯", "Budgeting"],
                [
                  "🤖",
                  "More connectors to popular banking and investments services",
                ],
                ["🏦", "Better mortgages & loans support"],
                ["💯", "More..."],
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">{feature[0]}</span>
                  <span>{feature[1]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="mt-12 text-center w-full">
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
    </div>
  );
};

export default LandingPage;

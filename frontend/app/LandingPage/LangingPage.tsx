import React, { useMemo, useState } from "react";
import { useUserState } from "../UserState";
import TotalTable from "../Home/Summary/TotalTable";
import Link from "next/link";
import { ChatMessage } from "../Home/Chat/ChatTab";
import Loading from "../components/Loading";
import LogScreenView from "../components/LogScreenView";
import { useTranslation } from "react-i18next";
import { expensesLandingVM } from "./ViewModels/expensesLandingVM";
import { budgetingLandingVM } from "./ViewModels/budegetingLandingVM";
import { savingsLandingVM } from "./ViewModels/savingsLandingVM";
import { spreadsheetLandingVM } from "./ViewModels/spreadsheetLandingVM";
import { defaultLandingVM } from "./ViewModels/defaultLandingVM";

const LandingPage: React.FC<{
  showLogin: () => void;
  type: "expenses" | "budgeting" | "savings" | "spreadsheet" | "default";
}> = ({ showLogin, type }) => {
  const { user, loaded } = useUserState();
  const [expandedFAQ, setExpandedFAQ] = useState<string>("security");
  const { t } = useTranslation();

  const viewModel = useMemo(() => {
    const viewModel = {
      expenses: expensesLandingVM(t),
      budgeting: budgetingLandingVM(t),
      savings: savingsLandingVM(t),
      spreadsheet: spreadsheetLandingVM(t),
      default: defaultLandingVM(t),
    };
    return {
      ...defaultLandingVM(t),
      ...viewModel[type],
    };
  }, [type, t]);

  if (user || !loaded) {
    return <></>;
  }

  return (
    <div className="p-4 pt-8 min-h-screen flex flex-col items-center from-gray-100 to-purple-100 via-blue-100 bg-gradient-to-b">
      <LogScreenView screenName="landing_page" />
      <div className="w-full max-w-4xl flex flex-col items-center">
        <header className="text-center mb-6 w-full">
          <h1 className="text-5xl md:text-6xl mb-2">finance_stuff</h1>
          <p className="text-xl md:text-2xl mt-8 whitespace-pre-line">
            {viewModel.subtitle}
          </p>
        </header>

        <div className="flex flex-col justify-center gap-4 text-center font-semibold w-full max-w-sm text-lg tracking-wide relative">
          <span className="text-center bg-red-600 text-sm font-semibold text-white px-2 py-1 rounded-lg border border-white transform rotate-12 shadow-md z-10 absolute -right-4 top-0 whitespace-pre-line">
            {viewModel.freeOffer}
          </span>
          <button
            onClick={showLogin}
            className="mt-8 from-blue-500 to-purple-500 via-blue-600 bg-gradient-to-r hover:from-blue-800 hover:to-blue-700 text-white py-3 px-6 rounded transition duration-300 pixel-corners-small relative"
          >
            {viewModel.getStarted}
          </button>
          <button
            onClick={showLogin}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded transition duration-300 pixel-corners-small"
          >
            {viewModel.login}
          </button>
        </div>

        <main className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl w-full my-8">
          <section className="w-full md:w-1/2 flex flex-col">
            <h2 className="text-center">{t("landingPage.keyFeaturesTitle")}</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg border flex-grow">
              <ul className="space-y-2">
                {viewModel.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">{feature[0]}</span>
                    <span>{feature[1]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section className="w-full md:w-1/2 flex flex-col">
            <h2 className="text-center">{viewModel.aiAssistant.title}</h2>
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-lg border text-sm flex-grow flex flex-col justify-center">
              {[
                {
                  content: viewModel.aiAssistant.userMessage,
                  role: "user",
                },
                {
                  content: viewModel.aiAssistant.assistantMessage,
                  role: "assistant",
                },
              ].map((msg, index) => (
                <ChatMessage key={index} message={msg} small={true} />
              ))}
            </div>
          </section>
        </main>

        <blockquote className="border-l-4 border-gray-600 pl-4 m-4 font-semibold whitespace-pre-line">
          {viewModel.quote}
        </blockquote>

        <div className="mt-4 w-full">
          <TotalTable
            liveAccountingEntry={undefined}
            title={viewModel.mock.title}
            fiatAccounts={viewModel.mock.fiatAccounts}
            investmentAccounts={viewModel.mock.investmentAccounts}
            accountingEntries={viewModel.mock.accountingEntries}
            onAddEntry={viewModel.mock.onAddEntry}
            onDeleteAccountingEntry={viewModel.mock.onDeleteAccountingEntry}
          />
        </div>

        <section className="w-full max-w-3xl mt-12">
          <h2 className="text-center">{t("landingPage.faq.title")}</h2>
          <div className="space-y-2">
            {[
              {
                key: "security",
                q: t("landingPage.faq.security.question"),
                a: t("landingPage.faq.security.answer"),
              },
              {
                key: "why",
                q: t("landingPage.faq.why.question"),
                a: t("landingPage.faq.why.answer"),
              },
              {
                key: "spreadsheet",
                q: t("landingPage.faq.spreadsheet.question"),
                a: t("landingPage.faq.spreadsheet.answer"),
              },
              {
                key: "import",
                q: t("landingPage.faq.import.question"),
                a: t("landingPage.faq.import.answer"),
              },
              {
                key: "automation",
                q: t("landingPage.faq.automation.question"),
                a: t("landingPage.faq.automation.answer"),
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow"
                onClick={() => setExpandedFAQ(faq.key)}
              >
                <p className="text-lg font-semibold">{faq.q}</p>
                {expandedFAQ === faq.key && (
                  <div className="mt-2 whitespace-pre-line">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl mt-12">
          <h2 className="text-center">{t("landingPage.aboutMe.title")}</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="whitespace-pre-line">
              {t("landingPage.aboutMe.content", {
                n26Link: '<span class="n26-link"></span>',
                amieLink: '<span class="amie-link"></span>',
              })
                .split(/(<span class="(?:n26|amie)-link"><\/span>)/)
                .map((part, index) => {
                  if (part === '<span class="n26-link"></span>') {
                    return (
                      <Link
                        key={index}
                        className="underline"
                        href="https://n26.com"
                      >
                        N26
                      </Link>
                    );
                  } else if (part === '<span class="amie-link"></span>') {
                    return (
                      <Link
                        key={index}
                        className="underline"
                        href="https://amie.so"
                      >
                        Amie
                      </Link>
                    );
                  }
                  return (
                    <span
                      key={index}
                      dangerouslySetInnerHTML={{ __html: part }}
                    />
                  );
                })}
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center w-full md:w-1/2 mt-12 gap-4">
          <div className="flex items-center gap-4">
            <Loading />
            <h2 className="m-0">{t("landingPage.comingSoon")}</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <ul className="space-y-2">
              {viewModel.comingSoon.map((feature, index) => (
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
            {t("landingPage.footer.companyName")} <b>-</b>{" "}
            {t("landingPage.footer.email")}
          </p>
          <p>
            <Link href="/privacy">{t("landingPage.footer.privacyPolicy")}</Link>
            <b> - </b>
            <Link href="/terms">{t("landingPage.footer.termsOfService")}</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

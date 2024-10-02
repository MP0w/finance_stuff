import {
  mockAccountingEntries,
  mockFiatAccounts,
  mockInvestmentsAccounts,
} from "../mockData";

export const defaultLandingVM = (t: (key: string) => string) => {
  return {
    subtitle: t("landingPage.subtitle"),
    getStarted: t("landingPage.getStarted"),
    freeOffer: t("landingPage.freeOffer"),
    login: t("landingPage.login"),
    keyFeatures: [
      ["💼", t("landingPage.keyFeatures.default.1")],
      ["🔮", t("landingPage.keyFeatures.default.2")],
      ["🪄", t("landingPage.keyFeatures.default.3")],
      ["💰", t("landingPage.keyFeatures.default.4")],
      ["📈", t("landingPage.keyFeatures.default.5")],
      ["🎯", t("landingPage.keyFeatures.default.6")],
      ["🔗", t("landingPage.keyFeatures.default.7")],
    ],
    mock: {
      title: undefined,
      fiatAccounts: mockFiatAccounts,
      investmentAccounts: mockInvestmentsAccounts,
      accountingEntries: mockAccountingEntries,
      onAddEntry: () => {},
      onDeleteAccountingEntry: () => {},
      liveAccountingEntry: undefined,
    },
    aiAssistant: {
      title: t("landingPage.aiAssistant"),
      userMessage: t("landingPage.aiChat.userMessage"),
      assistantMessage: t("landingPage.aiChat.assistantMessage"),
    },
    quote: t("landingPage.quotes.default"),
    comingSoon: [
      ["📱", t("landingPage.comingSoonFeatures.mobileApps")],
      ["🔮", t("landingPage.comingSoonFeatures.autoExpenseTracking")],
      ["🎯", t("landingPage.comingSoonFeatures.budgeting")],
      ["🤖", t("landingPage.comingSoonFeatures.moreConnectors")],
      ["🏦", t("landingPage.comingSoonFeatures.mortgageSupport")],
      ["💯", t("landingPage.comingSoonFeatures.more")],
    ],
  };
};

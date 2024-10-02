export const expensesLandingVM = (t: (key: string) => string) => {
  return {
    keyFeatures: [
      ["💼", t("landingPage.keyFeatures.expenses.1")],
      ["🔮", t("landingPage.keyFeatures.expenses.2")],
      ["🪄", t("landingPage.keyFeatures.expenses.3")],
      ["📈", t("landingPage.keyFeatures.expenses.4")],
      ["🎯", t("landingPage.keyFeatures.expenses.5")],
      ["🔗", t("landingPage.keyFeatures.expenses.6")],
    ],
    quote: t("landingPage.quotes.expenses"),
  };
};

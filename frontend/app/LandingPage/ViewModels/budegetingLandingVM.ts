export const budgetingLandingVM = (t: (key: string) => string) => {
  return {
    keyFeatures: [
      ["💼", t("landingPage.keyFeatures.budgeting.1")],
      ["🔮", t("landingPage.keyFeatures.budgeting.2")],
      ["🪄", t("landingPage.keyFeatures.budgeting.3")],
      ["📈", t("landingPage.keyFeatures.budgeting.4")],
      ["🎯", t("landingPage.keyFeatures.budgeting.5")],
      ["🔗", t("landingPage.keyFeatures.budgeting.6")],
    ],
    quote: t("landingPage.quotes.budgeting"),
  };
};

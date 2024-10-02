export const savingsLandingVM = (t: (key: string) => string) => {
  return {
    keyFeatures: [
      ["💼", t("landingPage.keyFeatures.savings.1")],
      ["🔮", t("landingPage.keyFeatures.savings.2")],
      ["🪄", t("landingPage.keyFeatures.savings.3")],
      ["📈", t("landingPage.keyFeatures.savings.4")],
      ["🎯", t("landingPage.keyFeatures.savings.5")],
      ["🔗", t("landingPage.keyFeatures.savings.6")],
    ],
    quote: t("landingPage.quotes.savings"),
  };
};

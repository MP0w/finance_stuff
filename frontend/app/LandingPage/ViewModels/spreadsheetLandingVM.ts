export const spreadsheetLandingVM = (t: (key: string) => string) => {
  return {
    keyFeatures: [
      ["💼", t("landingPage.keyFeatures.spreadsheet.1")],
      ["🔮", t("landingPage.keyFeatures.spreadsheet.2")],
      ["🪄", t("landingPage.keyFeatures.spreadsheet.3")],
      ["📈", t("landingPage.keyFeatures.spreadsheet.4")],
      ["🎯", t("landingPage.keyFeatures.spreadsheet.5")],
      ["🔗", t("landingPage.keyFeatures.spreadsheet.6")],
    ],
    quote: t("landingPage.quotes.spreadsheet"),
  };
};

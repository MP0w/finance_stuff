const defaultMetadata = {
  description:
    "Track your finances and expenses in just 10 minutes a month, AI will do the rest. Get AI insights, statistics, and visualizations for smarter financial management.",
  keywords: [
    "personal finance tracker",
    "AI financial insights",
    "expense tracking",
    "investment management",
    "budget planner",
    "budgeting",
    "financial goal setting",
    "wealth visualization",
    "automated finance tracking",
    "financial projections",
    "smart money management",
    "financial independence",
    "savings goals",
  ],
};

export const getMetadata = (
  type: "default" | "expenses" | "budgeting" | "spreadsheet" | "savings"
) => {
  const metadata: { description: string; keywords: string[] } = {
    description: defaultMetadata.description,
    keywords: defaultMetadata.keywords,
  };

  if (type === "expenses") {
    metadata.description =
      "Track your expenses automatically using our AI to convert your bank statements, get AI insights to manage your finances better.";
    metadata.keywords = [
      "expenses",
      "expense tracker",
      "bank statements",
      "AI expense tracking",
      "bank statement import",
      "bank statements to CSV",
      "bank statements to excel",
      "bank statements to spreadsheet",
      ...defaultMetadata.keywords,
    ];
  }

  if (type === "budgeting") {
    metadata.description =
      "Budgeting made easy.Manage your budget and get AI insights to manage your finances better.";
    metadata.keywords = [
      "easy budgeting app",
      "free budgeting",
      ...defaultMetadata.keywords,
    ];
  }

  if (type === "spreadsheet") {
    metadata.description =
      "Replace your personal finance spreadsheet with an AI-powered app. Manage your finances better.";
    metadata.keywords = [
      "personal finance spreadsheet",
      "savings spreadsheet",
      "expenses spreadsheet",
      "budgeting spreadsheet",
      ...defaultMetadata.keywords,
    ];
  }

  if (type === "savings") {
    metadata.description =
      "Create savings goals and get AI insights to manage your finances better.";
    metadata.keywords = [
      "savings tracker",
      "savings app",
      ...defaultMetadata.keywords,
    ];
  }

  return {
    title: "finance_stuff // Personal Finance Tracker",
    description: metadata.description,
    keywords: metadata.keywords,
  };
};

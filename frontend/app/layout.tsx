import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "finance_stuff",
  description: "Financial accounting made simple for the average person.",
  keywords: [
    "finance_stuff",
    "finance stuff",
    "personal finance",
    "budgeting",
    "financial management",
    "expense tracking",
    "money management",
    "financial planning",
    "savings goals",
    "debt management",
    "investment tracking",
    "financial education",
    "income management",
    "financial independence",
    "retirement planning",
    "financial analysis",
    "cash flow management",
    "financial decision-making",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

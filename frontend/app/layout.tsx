import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "finance_stuff // Personal Finance Tracker",
  description:
    "Effortlessly track and grow your finances in just 10 minutes a month. Get AI insights, statistics, and visualizations for smarter financial management.",
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

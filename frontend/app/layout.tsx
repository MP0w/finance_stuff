import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "finance_stuff",
  description: "Financial accounting made simple for the average person.",
  keywords: [
    "accounting",
    "financial management",
    "personal finance",
    "fire",
    "financial",
    "budgeting",
    "finance",
    "budget",
    "accounting software",
    "personal accounting",
    "finance_stuff",
    "finance_stuff",
    "simple finance",
    "finance stuff",
    "finance spreadsheet",
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

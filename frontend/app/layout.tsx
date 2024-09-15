import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SimpleFI",
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
    "simplefi",
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

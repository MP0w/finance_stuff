import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import { getMetadata } from "./metadata";

const tiny5 = localFont({
  src: "../public/fonts/Tiny5-Regular.ttf",
  variable: "--font-tiny5",
});

export const metadata: Metadata = {
  ...getMetadata("default"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={tiny5.variable}>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

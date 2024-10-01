"use client";

export const runtime = "edge";

import { auth } from "./firebase";
import LoginPage from "./Login/LoginPage";
import { UserStateProvider } from "./UserState";
import React, { useEffect, useState } from "react";
import HomePage from "./Home/HomePage";
import LandingPage from "./LandingPage/LangingPage";
import { usePathname } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import i18n from "./i8n";

export default function Main({
  type,
}: {
  type: "expenses" | "budgeting" | "savings" | "spreadsheet" | "default";
}) {
  const path = usePathname();
  const [showLogin, setShowLogin] = useState(path === "/login");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handlePathChange = () => {
      const pathname = window.location.pathname;
      setShowLogin(pathname === "/login");
    };

    handlePathChange();

    window.addEventListener("popstate", handlePathChange);

    return () => {
      window.removeEventListener("popstate", handlePathChange);
    };
  }, []);

  useEffect(() => {
    if (showLogin) {
      window.history.pushState(null, "", "/login");
    }
  }, [showLogin]);

  const signOut = async () => {
    setShowLogin(false);
    await auth.signOut();
  };

  return (
    <I18nextProvider i18n={i18n}>
      <UserStateProvider>
        {!showLogin ? (
          <div className="transition-all duration-1000 ease-out opacity-100">
            <LandingPage
              type={type}
              showLogin={() => {
                setShowLogin(true);
              }}
            />
          </div>
        ) : (
          <div className="transition-all duration-1000 ease-out opacity-0"></div>
        )}
        {showLogin ? (
          <div className="transition-all duration-800 ease-in-out opacity-100 translate-y-0">
            <LoginPage />
          </div>
        ) : (
          <div className="transition-all duration-800 ease-in-out opacity-0 translate-y-20"></div>
        )}
        <HomePage signOut={signOut} />
      </UserStateProvider>
    </I18nextProvider>
  );
}

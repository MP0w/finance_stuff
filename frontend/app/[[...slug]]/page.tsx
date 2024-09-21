"use client";

export const runtime = "edge";

import { auth } from "../firebase";
import {
  ActionCodeSettings,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
} from "firebase/auth";
import LoginPage from "../Login/LoginPage";
import { UserStateProvider } from "../UserState";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import HomePage from "../Home/HomePage";
import LandingPage from "../LandingPage/LangingPage";
import { usePathname } from "next/navigation";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
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
    window.history.pushState(null, "", showLogin ? "/login" : "/");
  }, [showLogin]);

  const signInWithEmail = async (email: string) => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }

      window.localStorage.setItem("emailForSignIn", email);
      const url =
        process.env.NEXT_PUBLIC_REDIRECT_URL + "/redeem?code=" + uuidv4();
      await sendSignInLinkToEmail(auth, email, {
        url,
        handleCodeInApp: true,
      } as ActionCodeSettings);
    } catch {
      setError("something went wrong, retry");
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }

      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError("something went wrong, retry");
      console.error("Error signing in with Google:", error);
    }
  };

  const signOut = async () => {
    setShowLogin(false);
    await auth.signOut();
  };

  return (
    <UserStateProvider>
      {!showLogin ? (
        <div className="transition-all duration-1000 ease-out opacity-100">
          <LandingPage
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
          <LoginPage
            error={error}
            signInWithEmail={signInWithEmail}
            signInWithApple={() => {
              window.alert("soooon");
            }}
            signInWithGoogle={signInWithGoogle}
          />
        </div>
      ) : (
        <div className="transition-all duration-800 ease-in-out opacity-0 translate-y-20"></div>
      )}
      <HomePage signOut={signOut} />
    </UserStateProvider>
  );
}

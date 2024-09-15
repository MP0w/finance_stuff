"use client";

import { auth } from "./firebase";
import {
  ActionCodeSettings,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
} from "firebase/auth";
import LoginPage from "./Login/LoginPage";
import { UserStateProvider } from "./UserState";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export default function Home() {
  const [error, setError] = useState<string | null>(null);

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
    await auth.signOut();
  };

  return (
    <UserStateProvider>
      <LoginPage
        error={error}
        signInWithEmail={signInWithEmail}
        signInWithApple={() => {
          window.alert("soooon");
        }}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
      />
    </UserStateProvider>
  );
}

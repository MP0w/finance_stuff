"use client";

import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import LoginPage from "./Login/LoginPage";
import { UserStateProvider } from "./UserState";

export default function Home() {
  const signIn = async (email: string, password: string) => {
    if (auth.currentUser) {
      await auth.signOut();
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <UserStateProvider>
      <LoginPage signIn={signIn} signOut={signOut} />
    </UserStateProvider>
  );
}

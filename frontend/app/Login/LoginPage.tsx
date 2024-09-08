"use client";

import React from "react";
import { useUserState } from "../UserState";
import HomePage from "../Home/HomePage";

interface LoginPageProps {
  signIn: () => void;
  signOut: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ signIn, signOut }) => {
  const { userId } = useUserState();

  if (userId) {
    return <HomePage signOut={signOut} />;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <header className="text-center bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">SimpleFi</h1>
        <div className="mt-4">
          <p className="text-lg text-gray-500 mb-6">You are not logged in</p>
          <button
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
            onClick={signIn}
          >
            Sign In
          </button>
        </div>
      </header>
    </div>
  );
};

export default LoginPage;

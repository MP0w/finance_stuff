"use client";

import React, { useState } from "react";
import { useUserState } from "../UserState";
import HomePage from "../Home/HomePage";

interface LoginPageProps {
  signIn: (email: string, password: string) => void;
  signOut: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ signIn, signOut }) => {
  const { userId } = useUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (userId) {
    return <HomePage signOut={signOut} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the login logic
    signIn(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          SimpleFi
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-md transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

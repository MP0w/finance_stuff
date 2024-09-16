import React, { useState } from "react";
import { useUserState } from "../UserState";
import { FaApple, FaGoogle } from "react-icons/fa";

interface LoginPageProps {
  signInWithEmail: (email: string) => void;
  signInWithApple: () => void;
  signInWithGoogle: () => void;
  error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  error,
}) => {
  const { user, loaded } = useUserState();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  if (user?.id || !loaded) {
    return <></>;
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    signInWithEmail(email);
    setEmail("");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white m-4 p-4 rounded-lg shadow-lg">
        <h1 className="text-center text-4xl mb-6 text-gray-600">
          finance_stuff
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4 flex flex-col space-y-2">
          <form onSubmit={handleEmailSubmit} className="space-y-4 mb-4">
            {!emailSent && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600 placeholder-gray-400"
                required
              />
            )}
            {emailSent && (
              <div className="flex flex-col items-center">
                <p className="text-gray-600 mb-4">
                  Email sent, check your inbox and click on the link to sign in.
                </p>
                <button
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white pixel-corners-small transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setEmailSent(false)}
                >
                  Retry sending email
                </button>
              </div>
            )}
            {!emailSent && (
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white pixel-corners-small transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!email.length}
              >
                Sign In with Email Link
              </button>
            )}
          </form>
          <button
            onClick={signInWithGoogle}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white pixel-corners-small transition duration-200 flex items-center justify-center"
          >
            <FaGoogle className="mr-2" /> Sign In with Google
          </button>

          <button
            onClick={signInWithApple}
            className="w-full py-2 px-4 bg-black hover:bg-gray-900 text-white pixel-corners-small transition duration-200 flex items-center justify-center"
          >
            <FaApple className="mr-2" /> Sign In with Apple
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

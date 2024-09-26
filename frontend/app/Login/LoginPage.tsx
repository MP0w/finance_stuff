import React, { useState } from "react";
import { useUserState } from "../UserState";
import { FaChevronLeft, FaGoogle, FaKey, FaUserNinja } from "react-icons/fa";
import { AnonAuth, EmailPassowrdAuth } from "./passwordSignIn";
import { FiMail } from "react-icons/fi";
import { auth } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import {
  ActionCodeSettings,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
} from "firebase/auth";
import LogScreenView from "../components/LogScreenView";
import Loading from "../components/Loading";

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = ({}) => {
  const { user, loaded, signingIn } = useUserState();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [state, setState] = useState<"anon" | "pass" | "link" | undefined>();
  const [error, setError] = useState<string | undefined>();

  if (user?.id || !loaded) {
    return <></>;
  }

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

  const handleEmailLink = () => {
    if (state !== "link") {
      setState("link");
    }

    if (email.length === 0) {
      return;
    }

    setEmailSent(true);
    signInWithEmail(email);
    setEmail("");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <LogScreenView screenName="login_page" />
      {signingIn && <Loading />}
      {!signingIn && (
        <div className="w-full max-w-md bg-white m-4 p-4 rounded-lg shadow-lg">
          <div className="relative mb-6">
            {state !== undefined && (
              <button
                onClick={() => {
                  setState(undefined);
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 transition duration-200"
              >
                <FaChevronLeft />
              </button>
            )}
            <h1 className="text-center text-4xl">finance_stuff</h1>
          </div>
          {state === "anon" && <AnonAuth />}
          {state === "pass" && <EmailPassowrdAuth />}
          {(state === undefined || state === "link") && (
            <div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex flex-col space-y-4">
                {!emailSent && state === "link" && (
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-400"
                    required
                  />
                )}
                {emailSent && state === "link" && (
                  <div className="flex flex-col items-center">
                    <p className="mb-4">
                      Email sent, check your inbox and click on the link to sign
                      in.
                    </p>
                    <button
                      className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white pixel-corners-small transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEmailSent(false)}
                    >
                      Retry sending email
                    </button>
                  </div>
                )}
                {state === undefined && (
                  <button
                    onClick={signInWithGoogle}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white pixel-corners-small transition duration-200 flex items-center justify-center"
                  >
                    <FaGoogle className="mr-2" /> Sign In with Google
                  </button>
                )}
                {!emailSent && (
                  <button
                    onClick={handleEmailLink}
                    className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-700 text-white pixel-corners-small transition duration-200 flex items-center justify-center"
                  >
                    <FiMail className="mr-2" /> Sign In with Email Link
                  </button>
                )}
                {state === undefined && (
                  <button
                    onClick={() => setState("pass")}
                    className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-700 text-white pixel-corners-small transition duration-200 flex items-center justify-center"
                  >
                    <FaKey className="mr-2" /> Sign In with Password
                  </button>
                )}
                {state === undefined && (
                  <button
                    onClick={() => setState("anon")}
                    className="w-full py-2 px-4 bg-black hover:bg-gray-800 text-white pixel-corners-small transition duration-200 flex items-center justify-center"
                  >
                    <FaUserNinja className="mr-2" /> Sign In Anonymously
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginPage;

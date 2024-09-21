import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../app/firebase";

export default function RedeemPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redeemEmailLink = async () => {
      console.log("redeemEmailLink", window.location.href);
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          // If the email is not stored (user might have opened the link on a different device),
          // prompt the user for their email.
          email = window.prompt("Please provide your email for confirmation");
        }

        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            // Clear email from storage.
            window.localStorage.removeItem("emailForSignIn");
            // Redirect to home page or dashboard
            window.location.replace("/");
          } catch (err) {
            console.error(err);
            setError("Error signing in with email link. Please try again.");
          }
        } else {
          setError("No email provided. Unable to complete sign-in process.");
        }
      } else {
        setError("Invalid or expired sign-in link.");
      }
    };

    redeemEmailLink();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.replace("/login")}
          className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-600 text-white font-semibold pixel-corners-small transition duration-200"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return null;
}

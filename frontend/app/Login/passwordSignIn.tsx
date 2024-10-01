import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import { useTranslation } from "react-i18next";

interface PasswordAuthProps {
  usernameValidation: (value: string) => boolean;
  validationError: string;
  usernameTransform: (username: string) => string;
  usernameTitle: string;
  isRecoverable: boolean;
}

export const AnonAuth = () => {
  const { t } = useTranslation();
  return (
    <CommonPasswordAuth
      usernameValidation={(value) =>
        /^[a-zA-Z0-9_]+$/.test(value) && value.length >= 4
      }
      validationError={t("passwordSignIn.anonValidationError")}
      usernameTransform={(username) => `${username}-anon@stuff.finance`}
      usernameTitle={t("passwordSignIn.username")}
      isRecoverable={false}
    />
  );
};

export const EmailPassowrdAuth = () => {
  const { t } = useTranslation();
  return (
    <CommonPasswordAuth
      usernameValidation={(value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      }
      validationError={t("passwordSignIn.invalidEmail")}
      usernameTransform={(username) => username}
      usernameTitle={t("passwordSignIn.email")}
      isRecoverable={true}
    />
  );
};

const CommonPasswordAuth: React.FC<PasswordAuthProps> = ({
  usernameTitle,
  usernameValidation,
  validationError,
  usernameTransform,
  isRecoverable,
}) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const messageForError = (e: Error) => {
    console.log(e.message);
    if (e.message.includes("auth/weak-password")) {
      return t("passwordSignIn.weakPassword");
    }
    return t("passwordSignIn.genericError", { isSignUp });
  };

  const createUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }

      await createUserWithEmailAndPassword(
        auth,
        usernameTransform(username),
        password
      );
    } catch (e) {
      toast.error(messageForError(e as Error));
    }
  };
  const signIn = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }

      await signInWithEmailAndPassword(
        auth,
        usernameTransform(username),
        password
      );
    } catch (e) {
      toast.error(messageForError(e as Error));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      return;
    }

    if (!usernameError) {
      if (isSignUp) {
        createUser();
      } else {
        signIn();
      }
    }
  };

  const validateUsername = (value: string) => {
    const isValid = usernameValidation(value);

    if (!isValid) {
      setUsernameError(validationError);
    } else {
      setUsernameError("");
    }
    return isValid;
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <input
            type="text"
            placeholder={usernameTitle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-400"
            required
          />
          {usernameError && (
            <p className="text-red-500 text-sm mt-1">{usernameError}</p>
          )}
        </div>
        <input
          type="password"
          placeholder={t("passwordSignIn.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white pixel-corners-small transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!username.length || !password.length}
        >
          {isSignUp ? t("passwordSignIn.signUp") : t("passwordSignIn.signIn")}
        </button>
      </form>
      <button
        className="w-full py-2 px-4 bg-blue-600 hover:bg-gray-700 text-white pixel-corners-small transition duration-200"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? t("passwordSignIn.haveAccount")
          : t("passwordSignIn.needAccount")}
      </button>
      {!isRecoverable && (
        <p className="text-sm text-gray-600 text-center mt-4">
          {t("passwordSignIn.anonymousWarning")}
        </p>
      )}
    </div>
  );
};

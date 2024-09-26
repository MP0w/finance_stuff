import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "../firebase";

interface PasswordAuthProps {
  usernameValidation: (value: string) => boolean;
  validationError: string;
  usernameTransform: (username: string) => string;
  usernameTitle: string;
  isRecoverable: boolean;
}

export const AnonAuth = () => {
  return (
    <CommonPasswordAuth
      usernameValidation={(value) =>
        /^[a-zA-Z0-9_]+$/.test(value) && value.length >= 4
      }
      validationError="Username can only contain letters, numbers, and underscores. At least 4 characters."
      usernameTransform={(username) => `${username}-anon@stuff.finance`}
      usernameTitle="Username"
      isRecoverable={false}
    />
  );
};

export const EmailPassowrdAuth = () => {
  return (
    <CommonPasswordAuth
      usernameValidation={(value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      }
      validationError="Invalid email"
      usernameTransform={(username) => username}
      usernameTitle="Email"
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const messageForError = (e: Error) => {
    console.log(e.message);
    if (e.message.includes("auth/weak-password")) {
      return "Password is too weak";
    }
    return `Something went wrong, retry.${
      isSignUp
        ? " Make sure your credentials are correct"
        : " If you do not have an account sign up instead"
    }`;
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
      <Toaster position="bottom-right" />
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
          placeholder="Password"
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
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
      <button
        className="w-full py-2 px-4 bg-blue-600 hover:bg-gray-700 text-white pixel-corners-small transition duration-200"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? "Already have an account?" : "Need to create an account?"}
      </button>
      {!isRecoverable && (
        <p className="text-sm text-gray-600 text-center mt-4">
          This account is anonymous. You can&apos;t recover it if you forget the
          credentials, but you can link your email later if you change your
          mind.
        </p>
      )}
    </div>
  );
};

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { auth } from "./firebase";
import { clearAuthToken, setAuthToken } from "./apiClient";
import * as Sentry from "@sentry/nextjs";

export type UserStateContextType = {
  idToken?: string;
  userId?: string;
  email?: string;
};

export type User = {
  id: string | undefined;
  firebase_uid: string | undefined;
  email: string | undefined;
};

const UserStateContext = createContext<UserStateContextType | undefined>(
  undefined
);

function getCachedUser() {
  const cachedUser = localStorage.getItem("user");
  return cachedUser ? (JSON.parse(cachedUser) as User) : undefined;
}

const login = async (token: string, firebaseUid: string) => {
  const cachedUser = getCachedUser();

  if (cachedUser && cachedUser.firebase_uid === firebaseUid) {
    return cachedUser;
  }

  try {
    const response = await fetch("http://localhost:4000/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    localStorage.setItem("user", JSON.stringify(result));
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error:", error);
    return undefined;
  }
};

export const UserStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [idToken, setIdToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    setIdToken(localStorage.getItem("idToken") ?? undefined);
    setUser(getCachedUser());

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (!user) {
        localStorage.removeItem("idToken");
        localStorage.removeItem("user");
        setIdToken(undefined);
        setUser(undefined);
        clearAuthToken();
      } else {
        const token = await user.getIdToken();
        localStorage.setItem("idToken", token);

        const userResult = await login(token, user.uid);
        if (userResult) {
          setAuthToken(token);
          setIdToken(token);
          setUser(userResult);
          Sentry.setUser({
            fullName: user.displayName,
            email: user.email ?? undefined,
          });
        } else {
          setIdToken(undefined);
          setUser(undefined);
          clearAuthToken();
        }
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Dependency array is empty to run the effect only once on mount

  return (
    <UserStateContext.Provider
      value={
        idToken && user ? { idToken, userId: user?.id, email: user?.email } : {}
      }
    >
      {children}
    </UserStateContext.Provider>
  );
};

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserStateProvider");
  }
  return context;
};

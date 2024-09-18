import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { auth, logAnalyticsEvent } from "./firebase";
import { clearAuthToken, setAuthToken } from "./apiClient";
import * as Sentry from "@sentry/nextjs";

export type UserStateContextType = {
  user:
    | {
        idToken: string;
        id: string;
        email: string;
      }
    | undefined;
  loaded: boolean;
};

export type User = {
  id: string | undefined;
  firebase_uid: string | undefined;
  email: string | undefined;
  currency: string | undefined;
};

export function getCurrencySymbol() {
  return "€"; // TODO: get from user
}

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
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sign-in", {
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
    logAnalyticsEvent("sign-in");

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
  const [loaded, setLoaded] = useState<boolean>(false);

  const clearUser = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("user");
    setIdToken(undefined);
    setUser(undefined);
    clearAuthToken();
  };

  useEffect(() => {
    setLoaded(true);
    setIdToken(localStorage.getItem("idToken") ?? undefined);
    setUser(getCachedUser());

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (!user) {
        clearUser();
      } else {
        const token = await user.getIdToken();
        localStorage.setItem("idToken", token);

        const userResult = await login(token, user.uid);
        if (userResult) {
          setAuthToken(token);
          setIdToken(token);
          setUser(userResult);
          localStorage.setItem("user", JSON.stringify(userResult));
          Sentry.setUser({
            fullName: user.displayName,
            email: user.email ?? undefined,
          });
        } else {
          clearUser();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const value: UserStateContextType =
    idToken && user && user.id && user.email
      ? {
          user: {
            idToken,
            id: user.id,
            email: user.email,
          },
          loaded,
        }
      : { user: undefined, loaded };

  return (
    <UserStateContext.Provider value={value}>
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

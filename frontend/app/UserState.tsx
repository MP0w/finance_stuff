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
import { Accounts, Users } from "../../shared/types";

export type UserStateContextType = {
  user:
    | {
        idToken: () => Promise<string>;
        id: string;
        firebaseUid: string;
        email: string;
        currency: string;
        updateUser: (user: Users) => void;
      }
    | undefined;
  loaded: boolean;
};

export function getUserCurrencySymbol() {
  return getCurrencySymbol(getCachedUser()?.currency ?? "USD");
}

export function getCurrencySymbol(currency: string) {
  return currency === "EUR" ? "€" : "$";
}

export function getAccountCurrencySymbol(account: Accounts) {
  return getCurrencySymbol(account.currency);
}

const UserStateContext = createContext<UserStateContextType | undefined>(
  undefined
);

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(atob(payload));
    const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assume expired if there's an error
  }
}

function getCachedUser() {
  const cachedUser = localStorage.getItem("user");
  return cachedUser ? (JSON.parse(cachedUser) as Users) : undefined;
}

export const updateUser = async (
  token: string,
  args: { currency?: string; onboarding_step?: string }
) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }

    const result: Users = await response.json();
    localStorage.setItem("user", JSON.stringify(result));
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error:", error);
    return undefined;
  }
};

const login = async (token: string, firebaseUid: string) => {
  const cachedUser = getCachedUser();

  if (cachedUser && cachedUser.firebase_uid === firebaseUid) {
    return cachedUser;
  }
  const user = await updateUser(token, {});
  if (user) {
    logAnalyticsEvent("sign-in");
  }

  return user;
};

export const UserStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [idToken, setIdToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<Users | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);

  const clearUser = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("user");
    setIdToken(undefined);
    setUser(undefined);
    clearAuthToken();
  };

  const updateUser = (user: Users) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
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

          updateUser(userResult);
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
            idToken: () => {
              const isValid = !isTokenExpired(idToken);
              if (!isValid && auth.currentUser) {
                return auth.currentUser.getIdToken(true);
              }
              return Promise.resolve(idToken);
            },
            id: user.id,
            email: user.email,
            currency: user.currency,
            firebaseUid: user.firebase_uid,
            updateUser,
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

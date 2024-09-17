import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG ?? ""
);

const firebase = initializeApp(firebaseConfig);

export const auth = getAuth(firebase);

const analytics = getAnalytics(firebase);

export function logAnalyticsEvent(
  event: string,
  params: Record<string, unknown> = { value: 1 }
) {
  logEvent(analytics, event, params);
}
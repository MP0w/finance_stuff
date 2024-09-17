import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  isSupported,
  getAnalytics,
  logEvent,
  Analytics,
} from "firebase/analytics";

const firebaseConfig = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG ?? ""
);

const firebase = initializeApp(firebaseConfig);

export const auth = getAuth(firebase);

let firebaseAnalytics: Analytics | null = null;

export async function logAnalyticsEvent(
  event: string,
  params: Record<string, unknown> = { value: 1 }
) {
  const analytics =
    firebaseAnalytics ?? (await isSupported()) ? getAnalytics(firebase) : null;

  if (analytics) {
    firebaseAnalytics = analytics;
    logEvent(analytics, event, params);
  }
}
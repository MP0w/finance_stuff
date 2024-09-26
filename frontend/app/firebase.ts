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
  if (process.env.NEXT_PUBLIC_SKIP_ANALYTICS) {
    console.info("Skipping analytics event", event, params);
    return;
  }

  const analytics =
    firebaseAnalytics ?? (await isSupported()) ? getAnalytics(firebase) : null;

  if (analytics) {
    firebaseAnalytics = analytics;
    logEvent(analytics, event, params);
  }
}

export async function logPageView(screenName: string) {
  logAnalyticsEvent("screen_view", {
    firebase_screen: screenName,
  });
}
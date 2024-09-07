import firebase from "firebase-admin";

export async function verifyToken(token: string) {
  return await firebase.auth().verifyIdToken(token);
}

// src/lib/firebaseClient.ts
// Complete Firebase client for Auth (with providers), Firestore and Storage.
// Uses lazy initialization, strong typing and env validation.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  GithubAuthProvider,
  type AuthProvider,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const requiredEnvVars: Record<keyof FirebaseConfig, string | undefined> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const assertConfig = (): FirebaseConfig => {
  const missing = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing Firebase environment variables: ${missing.join(", ")}`);
  }

  return requiredEnvVars as FirebaseConfig;
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

/**
 * getFirebaseApp - initialize and return FirebaseApp singleton
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (firebaseApp) return firebaseApp;
  const config = assertConfig();
  firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
  return firebaseApp;
};

/**
 * getFirebaseAuth - initialize and return Auth singleton
 * also sets browserLocalPersistence for a stable login experience
 */
export const getFirebaseAuth = (): Auth => {
  if (firebaseAuth) return firebaseAuth;
  const app = getFirebaseApp();
  const authInstance = getAuth(app);
  // best-effort: set persistence, ignore failure
  void setPersistence(authInstance, browserLocalPersistence).catch(() => undefined);
  firebaseAuth = authInstance;
  return firebaseAuth;
};

/**
 * getFirestoreClient - initialize and return Firestore singleton
 */
export const getFirestoreClient = (): Firestore => {
  if (firebaseFirestore) return firebaseFirestore;
  firebaseFirestore = getFirestore(getFirebaseApp());
  return firebaseFirestore;
};

/**
 * getStorageClient - initialize and return Storage singleton
 */
export const getStorageClient = (): FirebaseStorage => {
  if (firebaseStorage) return firebaseStorage;
  firebaseStorage = getStorage(getFirebaseApp());
  return firebaseStorage;
};

/**
 * Convenience exports for direct imports across the app:
 * - auth, firestore, storage singletons (callers can import these directly)
 */
export const auth = getFirebaseAuth();
export const firestore = getFirestoreClient();
export const storage = getStorageClient();

/**
 * createOAuthProvider - helper to get provider instances for social login
 * use: const provider = createOAuthProvider('google'); signInWithPopup(auth, provider)
 */
export const createOAuthProvider = (providerName: "google" | "github"): AuthProvider => {
  switch (providerName) {
    case "google":
      return new GoogleAuthProvider();
    case "github":
      return new GithubAuthProvider();
    default:
      // fallback: Google provider
      return new GoogleAuthProvider();
  }
};

/**
 * Helpful type re-exports (optional)
 */
export type { FirebaseApp, Auth, Firestore, FirebaseStorage };

import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseApp } from "./firebaseClient";

let firestoreInstance: Firestore | null = null;

/**
 * Get Firestore database instance
 * @returns Firestore instance
 */
export const getFirestoreDB = (): Firestore => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = getFirebaseApp();
  firestoreInstance = getFirestore(app);
  return firestoreInstance;
};

/**
 * Firestore Collections
 */
export const COLLECTIONS = {
  USERS: "users",
  LEADERBOARD: "leaderboard",
  ACHIEVEMENTS: "achievements",
  DAILY_CHALLENGES: "dailyChallenges",
} as const;

/**
 * Firestore Subcollections
 */
export const SUBCOLLECTIONS = {
  STATS: "stats",
  ACHIEVEMENTS: "achievements",
  COURSE_PROGRESS: "courseProgress",
  DAILY_CHALLENGES: "dailyChallenges",
} as const;

/**
 * Firestore Security Rules Documentation
 * 
 * Add these rules to your Firestore security rules in Firebase Console:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Users collection
 *     match /users/{userId} {
 *       // Allow users to read their own data
 *       allow read: if request.auth != null && request.auth.uid == userId;
 *       // Allow users to write their own data
 *       allow write: if request.auth != null && request.auth.uid == userId;
 *       
 *       // Stats subcollection
 *       match /stats/{statsId} {
 *         allow read: if request.auth != null && request.auth.uid == userId;
 *         allow write: if request.auth != null && request.auth.uid == userId;
 *       }
 *       
 *       // Achievements subcollection
 *       match /achievements/{achievementId} {
 *         allow read: if request.auth != null && request.auth.uid == userId;
 *         allow write: if request.auth != null && request.auth.uid == userId;
 *       }
 *       
 *       // Course progress subcollection
 *       match /courseProgress/{courseId} {
 *         allow read: if request.auth != null && request.auth.uid == userId;
 *         allow write: if request.auth != null && request.auth.uid == userId;
 *       }
 *       
 *       // Daily challenges subcollection
 *       match /dailyChallenges/{challengeId} {
 *         allow read: if request.auth != null && request.auth.uid == userId;
 *         allow write: if request.auth != null && request.auth.uid == userId;
 *       }
 *     }
 *     
 *     // Leaderboard collection (read-only for all authenticated users)
 *     match /leaderboard/{document=**} {
 *       allow read: if request.auth != null;
 *       allow write: if false; // Only server-side writes allowed
 *     }
 *     
 *     // Achievements collection (read-only for all authenticated users)
 *     match /achievements/{achievementId} {
 *       allow read: if request.auth != null;
 *       allow write: if false; // Only admin writes allowed
 *     }
 *   }
 * }
 */


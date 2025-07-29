import { collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Parses a Firebase Timestamp object into an ISO string.
 * @param {object} timestamp - The Firebase Timestamp object.
 * @returns {string|null} - The date in ISO string format or null.
 */
export const parseFirebaseDate = (timestamp) => {
  if (!timestamp) return null;
  // Firebase Timestamps have a toDate() method
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  // If it's already a string or another format, return as is
  return timestamp;
};

/**
 * Gets a reference to a collection within a specific user's document.
 * @param {object} user - The user object from Firebase Auth.
 * @param {string} collectionName - The name of the collection.
 * @returns {object|null} - A Firestore collection reference or null.
 */
export const getUserCollection = (user, collectionName) => {
  if (!user?.uid) {
    console.error('User UID is not available for getUserCollection');
    return null;
  }
  try {
    return collection(db, 'users', user.uid, collectionName);
  } catch (error) {
    console.error('Error creating collection reference:', error);
    return null;
  }
};
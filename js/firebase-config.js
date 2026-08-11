// Firebase Configuration Setup
// Replace the placeholder values with your Firebase project credentials to enable cross-device cloud sync.
export const firebaseConfig = {
  apiKey: "AIzaSyB5A-lGNb7hL8YN2nFTQvuV4sX81bZ_2Co",
  authDomain: "job-triangle-tracker.firebaseapp.com",
  projectId: "job-triangle-tracker",
  storageBucket: "job-triangle-tracker.firebasestorage.app",
  messagingSenderId: "848562324918",
  appId: "1:848562324918:web:09a59bbb9cf0a3952e2d17",
  measurementId: "G-KHP0ZGRYY1"
};

let db = null;
let isFirebaseEnabled = false;

export function initFirebase() {
  const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

  if (isConfigured && typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      isFirebaseEnabled = true;
      console.log("Firebase Firestore initialized successfully.");
    } catch (err) {
      console.warn("Firebase initialization failed, falling back to LocalStorage:", err);
      isFirebaseEnabled = false;
    }
  } else {
    console.log("Firebase credentials not configured. Operating in LocalStorage mode.");
    isFirebaseEnabled = false;
  }

  return { db, isFirebaseEnabled };
}

export { db, isFirebaseEnabled };

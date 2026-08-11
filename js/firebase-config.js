// Firebase Configuration Setup
// Replace the placeholder values with your Firebase project credentials to enable cross-device cloud sync.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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

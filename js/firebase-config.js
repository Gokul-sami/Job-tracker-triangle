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

export function initFirebase() {
  let db = null;
  let isFirebaseEnabled = false;

  const hasValidKeys = firebaseConfig.apiKey && 
                       firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                       !firebaseConfig.apiKey.includes("PASTE_YOUR");

  if (hasValidKeys && typeof window.firebase !== 'undefined') {
    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      db = window.firebase.firestore();
      isFirebaseEnabled = true;
      console.log("Firebase Firestore successfully connected.");
    } catch (err) {
      console.error("Firebase init error:", err);
    }
  }

  return { db, isFirebaseEnabled };
}

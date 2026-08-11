export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export let db = null;
export let isFirebaseEnabled = false;

function hasConfiguredKeys() {
  return Object.values(firebaseConfig).every(
    (value) => value && !String(value).startsWith("YOUR_")
  );
}

export function initFirebase() {
  if (!hasConfiguredKeys() || !window.firebase) {
    window.useLocalStorage = true;
    isFirebaseEnabled = false;
    return null;
  }

  try {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
    db = window.firebase.firestore();
    isFirebaseEnabled = true;
    window.useLocalStorage = false;
    return db;
  } catch (error) {
    console.error("Firebase initialization failed, using localStorage", error);
    window.useLocalStorage = true;
    isFirebaseEnabled = false;
    db = null;
    return null;
  }
}

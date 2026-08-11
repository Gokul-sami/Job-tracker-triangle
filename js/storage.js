import { initFirebase } from './firebase-config.js';

const LOCAL_STORAGE_KEY = 'job_triangle_apps';

const { db, isFirebaseEnabled } = initFirebase();

export function getStorageMode() {
  return isFirebaseEnabled ? 'Firebase' : 'Local';
}

// Fetch all applications
export async function fetchApplications() {
  if (isFirebaseEnabled && db) {
    try {
      const snapshot = await db.collection('applications').get();
      const apps = [];
      snapshot.forEach(doc => {
        apps.push({ id: doc.id, ...doc.data() });
      });
      return apps;
    } catch (err) {
      console.error("Error fetching from Firestore, falling back to LocalStorage:", err);
      return getLocalApps();
    }
  } else {
    return getLocalApps();
  }
}

// Save or Update an Application
export async function saveApplication(appData) {
  const now = new Date().toISOString();
  
  if (appData.id) {
    // Update existing
    const payload = { ...appData, updatedAt: now };
    if (isFirebaseEnabled && db) {
      await db.collection('applications').doc(appData.id).update(payload);
      return payload;
    } else {
      const apps = getLocalApps();
      const index = apps.findIndex(a => a.id === appData.id);
      if (index !== -1) {
        apps[index] = payload;
        saveLocalApps(apps);
      }
      return payload;
    }
  } else {
    // Create new
    const id = 'app_' + Date.now();
    const newApp = { 
      id, 
      company: appData.company || '',
      role: appData.role || '',
      dateApplied: appData.dateApplied || now.split('T')[0],
      source: appData.source || 'Other',
      status: appData.status || 'Applied',
      nextAction: appData.nextAction || '',
      dueDate: appData.dueDate || '',
      notes: appData.notes || '',
      statusUpdatedAt: appData.statusUpdatedAt || now,
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseEnabled && db) {
      const docRef = await db.collection('applications').add(newApp);
      newApp.id = docRef.id;
      return newApp;
    } else {
      const apps = getLocalApps();
      apps.push(newApp);
      saveLocalApps(apps);
      return newApp;
    }
  }
}

// Delete an application
export async function deleteApplication(id) {
  if (isFirebaseEnabled && db) {
    await db.collection('applications').doc(id).delete();
  } else {
    const apps = getLocalApps();
    const filtered = apps.filter(a => a.id !== id);
    saveLocalApps(filtered);
  }
}

// LocalStorage Helpers
function getLocalApps() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalApps(apps) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
}

import { db, isFirebaseEnabled } from "./firebase-config.js";

const STORAGE_KEY = "jobTriangleApplications";

function normalizeApplication(data, id = data.id) {
  return {
    id: id || crypto.randomUUID(),
    company: data.company || "",
    role: data.role || "",
    dateApplied: data.dateApplied || "",
    source: data.source || "",
    status: data.status || "Applied",
    nextAction: data.nextAction || "",
    dueDate: data.dueDate || "",
    updatedAt: data.updatedAt || new Date().toISOString(),
    notes: data.notes || ""
  };
}

function readLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map((entry) => normalizeApplication(entry, entry.id));
}

function writeLocal(applications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

export async function getApplications() {
  if (isFirebaseEnabled && db) {
    const snapshot = await db.collection("applications").get();
    return snapshot.docs.map((doc) => normalizeApplication(doc.data(), doc.id));
  }
  return readLocal();
}

export async function addApplication(appData) {
  const payload = normalizeApplication({ ...appData, updatedAt: new Date().toISOString() });

  if (isFirebaseEnabled && db) {
    await db.collection("applications").doc(payload.id).set(payload);
    return payload;
  }

  const applications = readLocal();
  applications.push(payload);
  writeLocal(applications);
  return payload;
}

export async function updateApplication(id, updatedFields) {
  if (isFirebaseEnabled && db) {
    const ref = db.collection("applications").doc(id);
    const existing = await ref.get();
    const current = existing.exists ? existing.data() : {};
    const payload = normalizeApplication({ ...current, ...updatedFields, updatedAt: new Date().toISOString() }, id);
    await ref.set(payload, { merge: true });
    return payload;
  }

  const applications = readLocal();
  const current = applications.find((entry) => entry.id === id) || {};
  const merged = normalizeApplication({ ...current, ...updatedFields, updatedAt: new Date().toISOString() }, id);
  const next = applications.map((entry) => (entry.id === id ? merged : entry));
  writeLocal(next);
  return merged;
}

export async function deleteApplication(id) {
  if (isFirebaseEnabled && db) {
    await db.collection("applications").doc(id).delete();
    return;
  }

  const applications = readLocal().filter((entry) => entry.id !== id);
  writeLocal(applications);
}

import { initFirebase, isFirebaseEnabled } from "./firebase-config.js";
import { getApplications } from "./storage.js";
import { renderAppTable, renderAlerts, handleFormSubmit, bindTableActions } from "./ui.js";
import { updateTriangleVisualization } from "./triangle.js";
import { calculateAnalytics, renderAnalyticsPanel } from "./analytics.js";

let cachedApplications = [];

function updateConnectionStatus() {
  const statusEl = document.getElementById("connection-status");
  if (!statusEl) return;

  statusEl.textContent = isFirebaseEnabled ? "Firebase Mode Active" : "Local Mode Active";
  statusEl.style.color = isFirebaseEnabled ? "#14b8a6" : "#f59e0b";
}

function applyFilterAndSort() {
  const filter = document.getElementById("status-filter")?.value || "All";
  const sortBy = document.getElementById("sort-by")?.value || "updatedAt";

  let data = [...cachedApplications];
  if (filter !== "All") {
    data = data.filter((app) => app.status === filter);
  }

  data.sort((a, b) => {
    if (sortBy === "company") return a.company.localeCompare(b.company);
    return new Date(b[sortBy] || 0).getTime() - new Date(a[sortBy] || 0).getTime();
  });

  return data;
}

async function refreshUI() {
  cachedApplications = await getApplications();
  const displayData = applyFilterAndSort();

  renderAppTable(displayData);
  renderAlerts(cachedApplications);
  updateTriangleVisualization(cachedApplications);
  renderAnalyticsPanel(calculateAnalytics(cachedApplications));
}

function populateFormForEdit(id) {
  const app = cachedApplications.find((item) => item.id === id);
  if (!app) return;

  const fields = ["company", "role", "dateApplied", "source", "status", "nextAction", "dueDate", "notes"];
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element) element.value = app[field] || "";
  });

  const idField = document.getElementById("application-id");
  if (idField) idField.value = app.id;

  document.getElementById("application-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindEvents() {
  const form = document.getElementById("application-form");
  const refreshButton = document.getElementById("refresh-btn");
  const toggleButton = document.getElementById("toggle-form-btn");
  const formSection = document.getElementById("application-form-section");

  form?.addEventListener("submit", async (event) => {
    const didSave = await handleFormSubmit(event);
    if (didSave) await refreshUI();
  });

  refreshButton?.addEventListener("click", refreshUI);

  ["status-filter", "sort-by"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      renderAppTable(applyFilterAndSort());
    });
  });

  toggleButton?.addEventListener("click", () => {
    if (!formSection) return;
    formSection.hidden = !formSection.hidden;
  });

  bindTableActions({ onRefresh: refreshUI, onEdit: populateFormForEdit });
}

function initializeApp() {
  initFirebase();
  updateConnectionStatus();
  bindEvents();
  refreshUI();
}

document.addEventListener("DOMContentLoaded", initializeApp);

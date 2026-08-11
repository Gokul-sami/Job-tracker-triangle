import { addApplication, updateApplication, deleteApplication } from "./storage.js";

const STAGES = ["Applied", "Screening", "Interview", "Offer", "Closed"];
const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");

export function formatDate(dateString) {
  if (!dateString) return "-";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function renderAppTable(applications) {
  const tbody = document.getElementById("applications-table-body");
  if (!tbody) return;

  tbody.innerHTML = applications
    .map(
      (app) => `
      <tr data-id="${escapeHtml(app.id)}">
        <td>${escapeHtml(app.company)}</td>
        <td>${escapeHtml(app.role)}</td>
        <td>${formatDate(app.dateApplied)}</td>
        <td>${escapeHtml(app.source)}</td>
        <td>
          <span class="status-pill status-${escapeHtml(app.status)}">${escapeHtml(app.status)}</span>
          <select class="quick-stage" data-id="${escapeHtml(app.id)}">
            ${STAGES.map((stage) => `<option value="${stage}" ${stage === app.status ? "selected" : ""}>${stage}</option>`).join("")}
          </select>
        </td>
        <td>${escapeHtml(app.nextAction || "-")}</td>
        <td>${formatDate(app.dueDate)}</td>
        <td class="inline-actions">
          <button type="button" data-edit="${escapeHtml(app.id)}">Edit</button>
          <button type="button" data-delete="${escapeHtml(app.id)}">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");
}

export function renderAlerts(applications) {
  const container = document.getElementById("alerts-banner");
  if (!container) return;

  const now = new Date();
  const alerts = [];

  applications.forEach((app) => {
    const dueDate = app.dueDate ? new Date(app.dueDate) : null;
    const updatedAt = app.updatedAt ? new Date(app.updatedAt) : null;

    if (dueDate && dueDate < now) {
      alerts.push(`<div class="alert-item overdue">⚠️ ${escapeHtml(app.company)} - ${escapeHtml(app.nextAction || "Follow up")} overdue <span class="pulse">●</span></div>`);
    }

    if (updatedAt) {
      const daysInStage = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
      if (daysInStage > 10 && app.status !== "Closed") {
        alerts.push(`<div class="alert-item">⏳ ${escapeHtml(app.company)} has been in ${escapeHtml(app.status)} for ${daysInStage} days</div>`);
      }
    }
  });

  container.innerHTML = alerts.join("");
}

export async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  const payload = {
    company: (formData.get("company") || "").toString().trim(),
    role: (formData.get("role") || "").toString().trim(),
    dateApplied: formData.get("dateApplied"),
    source: formData.get("source"),
    status: formData.get("status"),
    nextAction: (formData.get("nextAction") || "").toString().trim(),
    dueDate: formData.get("dueDate"),
    notes: (formData.get("notes") || "").toString().trim()
  };

  if (!payload.company || !payload.role || !payload.dateApplied || !payload.status) {
    alert("Company, role, date applied, and status are required.");
    return false;
  }

  const id = document.getElementById("application-id")?.value;
  if (id) {
    await updateApplication(id, payload);
  } else {
    await addApplication(payload);
  }

  form.reset();
  const hiddenId = document.getElementById("application-id");
  if (hiddenId) hiddenId.value = "";
  return true;
}

export function bindTableActions({ onRefresh, onEdit }) {
  const tbody = document.getElementById("applications-table-body");
  if (!tbody) return;

  tbody.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const deleteId = target.dataset.delete;
    if (deleteId) {
      await deleteApplication(deleteId);
      await onRefresh();
      return;
    }

    const editId = target.dataset.edit;
    if (editId) {
      onEdit(editId);
    }
  });

  tbody.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || !target.classList.contains("quick-stage")) return;

    await updateApplication(target.dataset.id, { status: target.value });
    await onRefresh();
  });
}

import { fetchApplications, saveApplication, getStorageMode } from './storage.js';
import { updateTriangleVisualization } from './triangle.js';
import { calculateAnalytics, renderAnalyticsPanel } from './analytics.js';
import { renderTable, renderAlerts, openForm, closeForm } from './ui.js';

let cachedApps = [];

async function refreshApp() {
  try {
    cachedApps = await fetchApplications();
    updateTriangleVisualization(cachedApps);
    const analytics = calculateAnalytics(cachedApps);
    renderAnalyticsPanel(analytics);
    renderAlerts(cachedApps);
    renderTable(cachedApps, refreshApp);
  } catch (err) {
    console.error("Error refreshing app data:", err);
  }
}

// Ensure event listeners bind immediately regardless of DOM timing
function bindEvents() {
  const btnToggleForm = document.getElementById('btn-toggle-form');
  const btnCloseForm = document.getElementById('btn-close-form');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const jobForm = document.getElementById('job-form');
  const filterStatus = document.getElementById('filter-status');

  if (btnToggleForm) {
    btnToggleForm.onclick = (e) => {
      e.preventDefault();
      openForm();
    };
  }

  if (btnCloseForm) btnCloseForm.onclick = () => closeForm();
  if (btnCancelForm) btnCancelForm.onclick = () => closeForm();

  if (filterStatus) {
    filterStatus.onchange = () => renderTable(cachedApps, refreshApp);
  }

  if (jobForm) {
    jobForm.onsubmit = async (e) => {
      e.preventDefault();
      const formData = {
        id: document.getElementById('app-id').value || null,
        company: document.getElementById('company').value.trim(),
        role: document.getElementById('role').value.trim(),
        dateApplied: document.getElementById('dateApplied').value,
        source: document.getElementById('source').value,
        status: document.getElementById('status').value,
        nextAction: document.getElementById('nextAction').value.trim(),
        dueDate: document.getElementById('dueDate').value,
        notes: document.getElementById('notes').value.trim()
      };

      await saveApplication(formData);
      closeForm();
      await refreshApp();
    };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const dateInput = document.getElementById('dateApplied');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  bindEvents();

  const storageBadge = document.getElementById('storage-badge');
  const mode = getStorageMode();
  if (storageBadge) {
    storageBadge.textContent = `${mode} Mode`;
    storageBadge.className = mode === 'Firebase' ? 'badge mode-firebase' : 'badge mode-local';
  }

  await refreshApp();
});

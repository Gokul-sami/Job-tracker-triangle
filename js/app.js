import { fetchApplications, saveApplication, getStorageMode } from './storage.js';
import { updateTriangleVisualization } from './triangle.js';
import { calculateAnalytics, renderAnalyticsPanel } from './analytics.js';
import { renderTable, renderAlerts, openForm, closeForm } from './ui.js';

let cachedApps = [];

async function refreshApp() {
  cachedApps = await fetchApplications();
  
  // 1. Update Water Triangle Visuals
  updateTriangleVisualization(cachedApps);

  // 2. Compute and Render Analytics Panel
  const analytics = calculateAnalytics(cachedApps);
  renderAnalyticsPanel(analytics);

  // 3. Render Alerts & Reminders Banner
  renderAlerts(cachedApps);

  // 4. Render Table
  renderTable(cachedApps, refreshApp);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Set default date applied to today
  const dateInput = document.getElementById('dateApplied');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Set Storage Mode Badge
  const storageBadge = document.getElementById('storage-badge');
  const mode = getStorageMode();
  if (storageBadge) {
    storageBadge.textContent = `${mode} Mode`;
    if (mode === 'Firebase') {
      storageBadge.className = 'badge mode-firebase';
    } else {
      storageBadge.className = 'badge mode-local';
    }
  }

  // Event Listeners for Form
  const btnToggleForm = document.getElementById('btn-toggle-form');
  const btnCloseForm = document.getElementById('btn-close-form');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const jobForm = document.getElementById('job-form');
  const filterStatus = document.getElementById('filter-status');

  if (btnToggleForm) btnToggleForm.addEventListener('click', openForm);
  if (btnCloseForm) btnCloseForm.addEventListener('click', closeForm);
  if (btnCancelForm) btnCancelForm.addEventListener('click', closeForm);

  if (filterStatus) {
    filterStatus.addEventListener('change', () => renderTable(cachedApps, refreshApp));
  }

  if (jobForm) {
    jobForm.addEventListener('submit', async (e) => {
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
    });
  }

  // Initial Load
  await refreshApp();
});

import { saveApplication, deleteApplication } from './storage.js';

// XSS Sanitization Helper
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderTable(applications, onDataChange) {
  const tbody = document.getElementById('app-table-body');
  const filterValue = document.getElementById('filter-status')?.value || 'ALL';
  tbody.innerHTML = '';

  const filteredApps = applications.filter(app => {
    if (filterValue === 'ALL') return true;
    return app.status === filterValue;
  });

  if (filteredApps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">No applications found. Add one above!</td></tr>`;
    return;
  }

  filteredApps.forEach(app => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${escapeHTML(app.company)}</strong><br>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHTML(app.role)}</span>
      </td>
      <td>${escapeHTML(app.dateApplied)}</td>
      <td>${escapeHTML(app.source)}</td>
      <td>
        <select class="status-select status-badge status-${escapeHTML(app.status)}" data-id="${app.id}">
          <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
          <option value="Screening" ${app.status === 'Screening' ? 'selected' : ''}>Screening</option>
          <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>Interview</option>
          <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>Offer</option>
          <option value="Closed" ${app.status === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td>
        <div>${escapeHTML(app.nextAction) || '<span style="color:var(--text-secondary);">-</span>'}</div>
        ${app.dueDate ? `<span style="font-size:0.75rem; color:var(--gold-light);">Due: ${escapeHTML(app.dueDate)}</span>` : ''}
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn-action-icon btn-edit" data-id="${app.id}" title="Edit">✏️</button>
          <button class="btn-action-icon btn-delete" data-id="${app.id}" title="Delete">🗑️</button>
        </div>
      </td>
    `;

    // Inline Status Change Event
    const selectElem = tr.querySelector('.status-select');
    selectElem.addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      await saveApplication({ ...app, status: newStatus, statusUpdatedAt: new Date().toISOString() });
      if (onDataChange) onDataChange();
    });

    // Edit Button Click Event
    tr.querySelector('.btn-edit').addEventListener('click', () => {
      populateForm(app);
      openForm();
    });

    // Delete Button Click Event
    tr.querySelector('.btn-delete').addEventListener('click', async () => {
      if (confirm(`Delete application for ${app.company}?`)) {
        await deleteApplication(app.id);
        if (onDataChange) onDataChange();
      }
    });

    tbody.appendChild(tr);
  });
}

export function renderAlerts(applications) {
  const alertBanner = document.getElementById('alerts-banner');
  const alertList = document.getElementById('alerts-list');
  alertList.innerHTML = '';

  const now = new Date();
  const alerts = [];

  applications.forEach(app => {
    // 1. Check Due Date
    if (app.dueDate) {
      const due = new Date(app.dueDate);
      if (due <= now && app.status !== 'Closed') {
        alerts.push({
          type: 'due',
          msg: `<strong>${escapeHTML(app.company)}</strong> (${escapeHTML(app.role)}): Next action "<em>${escapeHTML(app.nextAction)}</em>" is due!`
        });
      }
    }

    // 2. Check Stale Stage (>10 days)
    const lastUpdate = app.statusUpdatedAt ? new Date(app.statusUpdatedAt) : new Date(app.dateApplied);
    const diffDays = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    if (diffDays >= 10 && app.status !== 'Closed' && app.status !== 'Offer') {[cite: 1]
      alerts.push({
        type: 'stale',
        msg: `<span class="stale-tag">STALE (${diffDays}d)</span> <strong>${escapeHTML(app.company)}</strong> has been in ${escapeHTML(app.status)} for ${diffDays} days without updates. Follow up!`
      });
    }
  });

  if (alerts.length > 0) {
    alertBanner.classList.remove('hidden');
    alerts.forEach(item => {
      const li = document.createElement('li');
      li.className = 'alert-item';
      li.innerHTML = item.msg;
      alertList.appendChild(li);
    });
  } else {
    alertBanner.classList.add('hidden');
  }
}

export function openForm() {
  document.getElementById('form-section').classList.remove('hidden');
}

export function closeForm() {
  document.getElementById('form-section').classList.add('hidden');
  document.getElementById('job-form').reset();
  document.getElementById('app-id').value = '';
  document.getElementById('form-title').textContent = 'Add Job Application';
}

function populateForm(app) {
  document.getElementById('form-title').textContent = 'Edit Job Application';
  document.getElementById('app-id').value = app.id;
  document.getElementById('company').value = app.company;
  document.getElementById('role').value = app.role;
  document.getElementById('dateApplied').value = app.dateApplied;
  document.getElementById('source').value = app.source;
  document.getElementById('status').value = app.status;
  document.getElementById('nextAction').value = app.nextAction || '';
  document.getElementById('dueDate').value = app.dueDate || '';
  document.getElementById('notes').value = app.notes || '';
}

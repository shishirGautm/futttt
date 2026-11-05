window.FNAdminComponents = window.FNAdminComponents || {};

window.FNAdminComponents.getTimeGreeting = function() {
  const hour = new Date().getHours();
  return hour >= 0 && hour < 12 ? 'Good morning' : 'Good evening';
};

window.FNAdminComponents.showToast = function(message, type) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'success');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
};

window.FNAdminComponents.openModal = function(contentHtml) {
  const modal = document.getElementById('genericModal');
  const body = document.getElementById('genericModalBody');
  if (!modal || !body) return;
  body.innerHTML = contentHtml;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
};

window.FNAdminComponents.closeModal = function() {
  const modal = document.getElementById('genericModal');
  if (!modal) return;
  if (document.activeElement && modal.contains(document.activeElement)) document.activeElement.blur();
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
};

window.FNAdminComponents.renderTable = function(options) {
  const { headers = [], rows = [], targetId, emptyMessage = 'No records available.' } = options;
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!rows.length) {
    target.innerHTML = '<div class="empty-state"><i class="fa-solid fa-table-list"></i><h3>No data</h3><p>' + emptyMessage + '</p></div>';
    return;
  }

  const tableHeaders = headers.map((header) => '<th>' + header + '</th>').join('');
  const tableRows = rows.map((row) => '<tr>' + row.map((cell) => '<td>' + cell + '</td>').join('') + '</tr>').join('');

  target.innerHTML = '<div class="table-wrap"><table><thead><tr>' + tableHeaders + '</tr></thead><tbody>' + tableRows + '</tbody></table></div>';
};

window.FNAdminComponents.getStatusBadge = function(status) {
  const normalized = String(status || '').toLowerCase();
  const label = status || 'Unknown';
  return '<span class="status-badge ' + normalized + '">' + label + '</span>';
};

window.FNAdminComponents.renderEmptyState = function(targetId, title, message) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-info"></i><h3>' + title + '</h3><p>' + message + '</p></div>';
};

window.FNAdminComponents.renderLoadingState = function(targetId, message) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '<div class="empty-state loading-state"><i class="fa-solid fa-spinner fa-spin"></i><h3>Loading</h3><p>' + (message || 'Fetching the latest data.') + '</p></div>';
};

window.FNAdminComponents.renderErrorState = function(targetId, message, retryAction) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '<div class="empty-state error-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Something went wrong</h3><p>' + (message || 'The data could not be loaded.') + '</p>' + (retryAction ? '<button class="btn btn-secondary" type="button" data-retry-state="true">Try again</button>' : '') + '</div>';
  if (retryAction) target.querySelector('[data-retry-state="true"]').addEventListener('click', retryAction);
};

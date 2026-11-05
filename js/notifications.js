window.FNAdminNotifications = window.FNAdminNotifications || {};

window.FNAdminNotifications.getVisibleNotifications = function() {
  const expiryLimit = Date.now() - (3 * 24 * 60 * 60 * 1000);
  return window.FNAdmin.getNotificationsForRole('Admin').filter((item) => new Date(item.date || item.createdAt || 0).getTime() >= expiryLimit);
};

window.FNAdminNotifications.getRows = function() {
  return this.getVisibleNotifications().map((item) => [
    item.title,
    item.message,
    item.target,
    item.date,
    window.FNAdminComponents.getStatusBadge(item.isRead === true ? 'Read' : 'Unread'),
    '<div class="action-group">' + (item.isRead === true ? '' : '<button class="icon-button" data-notification-action="read" data-notification-id="' + item.id + '" title="Mark as read"><i class="fa-solid fa-check"></i></button>') + '<button class="icon-button danger" data-notification-action="delete" data-notification-id="' + item.id + '" title="Delete"><i class="fa-solid fa-trash"></i></button></div>'
  ]);
};

window.FNAdminNotifications.render = function() {
  const headers = ['Title', 'Message', 'Target', 'Date', 'Read state', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'notificationsTableContainer', emptyMessage: 'No notifications scheduled.' });
  const target = document.getElementById('notificationsTableContainer');
  if (target) {
    target.querySelectorAll('[data-notification-action="delete"]').forEach((button) => button.addEventListener('click', () => this.delete(button.dataset.notificationId)));
    target.querySelectorAll('[data-notification-action="read"]').forEach((button) => button.addEventListener('click', () => this.markRead(button.dataset.notificationId)));
  }
  this.renderBell();
};

window.FNAdminNotifications.renderBell = function() {
  const badge = document.getElementById('adminNotificationBadge');
  const count = document.getElementById('adminNotificationCount');
  const preview = document.getElementById('adminNotificationPreview');
  if (!badge || !count || !preview) return;
  const notifications = this.getVisibleNotifications().slice().sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')));
  const unreadCount = notifications.filter((item) => item.isRead !== true).length;
  badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
  count.textContent = unreadCount + ' unread';
  preview.innerHTML = notifications.length ? notifications.slice(0, 5).map((item) => '<article class="notification-preview-item' + (item.isRead === true ? '' : ' notification-unread') + '"><strong>' + item.title + '</strong><p>' + item.message + '</p><small>' + new Date(item.date || item.createdAt).toLocaleString() + '</small></article>').join('') : '<p class="notification-empty">No notifications yet.</p>';
};

window.FNAdminNotifications.initBell = function() {
  const bell = document.getElementById('adminNotificationBell');
  const dropdown = document.getElementById('adminNotificationDropdown');
  const viewAll = document.getElementById('viewAllNotificationsBtn');
  if (!bell || !dropdown || bell.dataset.fnInitialized === 'true') return;
  bell.addEventListener('click', () => {
    const isOpen = !dropdown.classList.contains('is-hidden');
    dropdown.classList.toggle('is-hidden', isOpen);
    bell.setAttribute('aria-expanded', String(!isOpen));
  });
  if (viewAll) viewAll.addEventListener('click', () => {
    dropdown.classList.add('is-hidden');
    const link = document.querySelector('.nav-link[data-view="notifications"]');
    if (link) link.click();
  });
  const markAllRead = document.getElementById('markAdminNotificationsReadBtn');
  if (markAllRead) markAllRead.addEventListener('click', () => this.markAllRead());
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.notification-menu')) {
      dropdown.classList.add('is-hidden');
      bell.setAttribute('aria-expanded', 'false');
    }
  });
  bell.dataset.fnInitialized = 'true';
};

window.FNAdminNotifications.markRead = function(notificationId) {
  const notification = this.getVisibleNotifications().find((item) => item.id === notificationId);
  return window.FNAdmin.markNotificationRead(notification).then(() => this.render()).catch((error) => window.FNAdminComponents.showToast('Notification could not be updated: ' + error.message, 'error'));
};

window.FNAdminNotifications.markAllRead = function() {
  return window.FNAdmin.markAllNotificationsRead(this.getVisibleNotifications()).then(() => this.render()).catch((error) => window.FNAdminComponents.showToast('Notifications could not be updated: ' + error.message, 'error'));
};

window.FNAdminNotifications.delete = function(notificationId) {
  if (!window.confirm('Delete this notification permanently?')) return;
  const index = window.FNAdmin.state.notifications.findIndex((item) => item.id === notificationId);
  const remove = window.FNAdminData.isLive() ? window.FNAdminData.remove('notifications', notificationId) : Promise.resolve();
  remove.then(() => {
    if (index >= 0) window.FNAdmin.state.notifications.splice(index, 1);
    this.render();
    window.FNAdminComponents.showToast('Notification deleted.', 'success');
  }).catch((error) => window.FNAdminComponents.showToast('Notification could not be deleted: ' + error.message, 'error'));
};

window.FNAdminNotifications.openForm = function() {
  window.FNAdminComponents.openModal('<div class="panel__header"><div><p class="eyebrow">Admin</p><h3>Send notification</h3></div><button class="icon-button" data-close-modal="true"><i class="fa-solid fa-xmark"></i></button></div><form id="notificationForm"><label>Title<input name="title" required /></label><label>Message<textarea name="message" rows="4" required></textarea></label><label>Audience<select name="target"><option value="All">Everyone</option><option value="Users">Users</option><option value="Owners">Court owners</option></select></label><div class="form-actions"><button type="button" class="btn btn-secondary" data-close-modal="true">Cancel</button><button type="submit" class="btn btn-primary">Send notification</button></div></form>');
  document.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
  const form = document.getElementById('notificationForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const target = data.get('target');
    const selectedUsers = (window.FNAdmin.state.users || []).filter((user) => {
      const role = String(user.role || 'User').toLowerCase();
      return target === 'All' ? ['user', 'owner'].includes(role) : target === 'Owners' ? role === 'owner' : role === 'user';
    });
    const timestamp = Date.now();
    const notifications = selectedUsers.map((user) => ({
      id: 'notification-' + timestamp + '-' + user.id,
      userId: user.id,
      targetUserId: user.id,
      targetRole: String(user.role || 'User').toLowerCase() === 'owner' ? 'Owner' : 'User',
      title: data.get('title'),
      message: data.get('message'),
      target,
      date: new Date(timestamp).toISOString(),
      createdAt: timestamp,
      isRead: false,
      status: 'Sent',
      type: 'system_notice'
    }));
    const save = window.FNAdminData.isLive()
      ? Promise.all(notifications.map((notification) => window.FNAdminData.save('notifications', notification.id, notification)))
      : Promise.resolve();
    save.then(() => {
      window.FNAdmin.state.notifications = [...(window.FNAdmin.state.notifications || []), ...notifications];
      window.FNAdminComponents.closeModal();
      this.render();
      window.FNAdminComponents.showToast(notifications.length ? 'Notification sent to ' + notifications.length + ' account' + (notifications.length === 1 ? '' : 's') + '.' : 'There are no accounts in this audience yet.', notifications.length ? 'success' : 'info');
    }).catch((error) => window.FNAdminComponents.showToast('Notification could not be sent: ' + error.message, 'error'));
  });
};

window.FNAdminNotifications.init = function() {
  const button = document.getElementById('addNotificationBtn');
  if (button) button.addEventListener('click', () => this.openForm());
  this.initBell();
  window.FNAdmin.cleanupExpiredNotifications().catch((error) => console.error('Unable to remove expired notifications:', error));
  this.render();
};

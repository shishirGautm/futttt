window.FNAdminUsers = window.FNAdminUsers || {};

window.FNAdminUsers.getRows = function() {
  return window.FNAdmin.state.users.map((user) => [
    '<div class="table-user"><div class="table-avatar">' + (user.avatar || user.name.substring(0, 2).toUpperCase()) + '</div><div><strong>' + user.name + '</strong><small>' + user.email + '</small></div></div>',
    user.email,
    user.phone,
    user.location,
    user.bookings,
    user.joined,
    window.FNAdminComponents.getStatusBadge(user.status),
    '<div class="action-group"><button class="icon-button" data-user-action="view" data-user-id="' + user.id + '" title="View"><i class="fa-solid fa-eye"></i></button><button class="icon-button" data-user-action="toggle-status" data-user-id="' + user.id + '" title="Toggle status"><i class="fa-solid fa-user-lock"></i></button><button class="btn btn-danger user-delete-button" data-user-action="delete" data-user-id="' + user.id + '" title="Delete user"><i class="fa-solid fa-trash"></i> Delete</button></div>'
  ]);
};

window.FNAdminUsers.render = function() {
  const headers = ['User', 'Email', 'Phone', 'Location', 'Bookings', 'Joined', 'Status', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'usersTableContainer', emptyMessage: 'No users available.' });
  const target = document.getElementById('usersTableContainer');
  if (target) target.querySelectorAll('[data-user-action]').forEach((button) => button.addEventListener('click', () => this.handleAction(button.dataset.userAction, button.dataset.userId)));
};

window.FNAdminUsers.handleAction = function(action, userId) {
  const user = window.FNAdmin.state.users.find((item) => item.id === userId);
  if (!user) return;
  if (action === 'delete') {
    if (!window.confirm('Delete user profile "' + user.name + '" permanently?')) return;
    const index = window.FNAdmin.state.users.findIndex((item) => item.id === userId);
    const remove = window.FNAdminData.isLive() ? window.FNAdminData.remove('users', userId) : Promise.resolve();
    remove.then(() => {
      if (index >= 0) window.FNAdmin.state.users.splice(index, 1);
      this.render();
      window.FNAdminComponents.showToast('User profile deleted successfully.', 'success');
    }).catch((error) => {
      console.error('Unable to delete user profile:', error);
      window.FNAdminComponents.showToast('User could not be deleted: ' + (error.message || 'permission denied.'), 'error');
    });
    return;
  }
  if (action === 'view') {
    window.FNAdminComponents.openModal('<div class="panel__header"><div><p class="eyebrow">User profile</p><h3>' + user.name + '</h3></div><button class="icon-button" data-close-modal="true"><i class="fa-solid fa-xmark"></i></button></div><div class="detail-list"><div><span>Email</span><strong>' + user.email + '</strong></div><div><span>Phone</span><strong>' + user.phone + '</strong></div><div><span>Location</span><strong>' + user.location + '</strong></div><div><span>Bookings</span><strong>' + user.bookings + '</strong></div></div>');
    document.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
    return;
  }
  user.status = user.status === 'active' ? 'disabled' : 'active';
  const save = window.FNAdminData.isLive() ? window.FNAdminData.save('users', user.id, user) : Promise.resolve();
  save.then(() => {
    this.render();
    window.FNAdminComponents.showToast('User status updated.', 'success');
  }).catch(() => window.FNAdminComponents.showToast('User updated locally, but live sync failed.', 'error'));
};

window.FNAdminUsers.init = function() {
  this.render();
};

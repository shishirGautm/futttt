window.FNAdminAdmins = window.FNAdminAdmins || {};

window.FNAdminAdmins.getRows = function() {
  return window.FNAdmin.state.admins.map((admin) => [
    admin.name,
    admin.email,
    admin.role,
    Array.isArray(admin.permissions) ? admin.permissions.join(', ') : 'No permissions assigned',
    window.FNAdminComponents.getStatusBadge(admin.status),
    '<div class="action-group"><button class="icon-button" title="Edit"><i class="fa-solid fa-pen"></i></button><button class="icon-button danger" title="Disable"><i class="fa-solid fa-ban"></i></button></div>'
  ]);
};

window.FNAdminAdmins.render = function() {
  const headers = ['Name', 'Email', 'Role', 'Permissions', 'Status', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'adminsTableContainer', emptyMessage: 'No admins available.' });
};

window.FNAdminAdmins.init = function() {
  this.render();
};

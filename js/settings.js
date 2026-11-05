window.FNAdminSettings = window.FNAdminSettings || {};

window.FNAdminSettings.init = function() {
  const btn = document.getElementById('seedDemoDataBtn');
  if (btn) {
    btn.addEventListener('click', function() {
      window.FNAdminComponents.showToast('Demo data is loaded in memory. This is safe for development only.', 'success');
    });
  }
};

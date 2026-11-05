window.FNAdmin = window.FNAdmin || {};
window.FNAdmin.state = window.FNAdmin.state || {};

window.FNAdminApp = {
  renderAll: function() {
    if (!window.FNAdminAuth.isAuthenticated()) {
      window.FNAdminAuth.showLandingPage();
      return;
    }

    const role = window.FNAdminAuth.getRole();
    if (role === 'User') {
      window.FNAdminAuth.toggleAuthScreens(false);
      window.FNUserPortal.init();
      window.FNUserPortal.updateDashboard();
      window.FNUserPortal.renderBookings();
      return;
    }
    if (role === 'Owner') {
      window.FNAdminAuth.toggleAuthScreens(false);
      window.FNOwnerPortal.init();
      window.FNOwnerPortal.render();
      return;
    }

    window.FNAdminAuth.toggleAuthScreens(false);
    window.FNAdminDashboard.renderStats();
    window.FNAdminDashboard.setupCharts();
    window.FNAdminCourts.render();
    window.FNAdminBookings.render();
    window.FNAdminUsers.render();
    window.FNAdminTeams.render();
    window.FNAdminMatches.render();
    window.FNAdminTournaments.render();
    window.FNAdminPayments.render();
    window.FNAdminReviews.render();
    window.FNAdminNotifications.render();
    window.FNAdminReports.render();
    window.FNAdminAdmins.render();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  window.FNAdmin.ensureFirebase();
  window.FNAdminAuth.init();
  window.FNUserPortal.init();
  window.FNOwnerPortal.init();
  window.FNAdminDashboard.init();
  window.FNAdminCourts.init();
  window.FNAdminBookings.init();
  window.FNAdminUsers.init();
  window.FNAdminTeams.init();
  window.FNAdminMatches.init();
  window.FNAdminTournaments.init();
  window.FNAdminPayments.init();
  window.FNAdminReviews.init();
  window.FNAdminNotifications.init();
  window.FNAdminReports.init();
  window.FNAdminAdmins.init();
  window.FNAdminSettings.init();
  window.addEventListener('fn:bookings-changed', function() {
    if (window.FNAdminAuth.isAuthenticated() && window.FNAdminAuth.getRole() === 'Admin') {
      window.FNAdminBookings.render();
      window.FNAdminDashboard.renderStats();
      window.FNAdminDashboard.setupCharts();
      window.FNAdminReports.render();
    }
    if (window.FNAdminAuth.getRole() === 'User' && window.FNUserPortal) {
      window.FNUserPortal.renderBookings();
      window.FNUserPortal.renderNotifications();
      window.FNUserPortal.renderCourtDirectory();
      window.FNUserPortal.updateTimeSlots();
      window.FNUserPortal.updateAmount();
    }
    if (window.FNAdminAuth.getRole() === 'Owner' && window.FNOwnerPortal) window.FNOwnerPortal.render();
  });
  window.addEventListener('fn:bookings-error', () => {
    window.FNAdminComponents.showToast('Live booking updates are temporarily unavailable.', 'error');
    if (window.FNAdminAuth.getRole() === 'User' && window.FNUserPortal) window.FNUserPortal.renderCourtDirectory();
  });
  window.addEventListener('fn:collection-error', function(event) {
    if (event.detail && event.detail.collection === 'courts' && window.FNAdminAuth.isAuthenticated()) {
      window.FNAdminComponents.showToast('Live court data could not be loaded. Check Firebase access and connection.', 'error');
      if (window.FNAdminAuth.getRole() === 'Admin') window.FNAdminCourts.render();
      if (window.FNAdminAuth.getRole() === 'User') window.FNUserPortal.renderCourtDirectory();
    }
  });
  window.addEventListener('fn:booking-slots-changed', function() {
    if (window.FNAdminAuth.getRole() !== 'User' || !window.FNUserPortal) return;
    window.FNUserPortal.updateTimeSlots();
    window.FNUserPortal.updateAmount();
    window.FNUserPortal.renderCourtDirectory();
  });
  window.addEventListener('fn:collection-changed', function(event) {
    const collection = event.detail && event.detail.collection;
    if (window.FNAdminAuth.getRole() === 'Admin') window.FNAdminApp.renderAll();
    if (window.FNAdminAuth.getRole() === 'User' && ['courts', 'reviews', 'notifications', 'teams', 'tournaments'].includes(collection) && window.FNUserPortal) window.FNUserPortal.init();
    if (window.FNAdminAuth.getRole() === 'Owner' && ['courts', 'bookings', 'notifications'].includes(collection) && window.FNOwnerPortal) window.FNOwnerPortal.render();
  });
  window.addEventListener('fn:courts-changed', function() {
    if (window.FNAdminAuth.getRole() === 'Owner') window.FNOwnerPortal.render();
    if (window.FNAdminAuth.getRole() === 'User' && window.FNUserPortal) window.FNUserPortal.init();
  });
  document.getElementById('pageTitle').textContent = 'Dashboard';
  window.FNAdminApp.renderAll();
});

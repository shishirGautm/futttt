window.FNAdminPayments = window.FNAdminPayments || {};

window.FNAdminPayments.getRows = function() {
  return window.FNAdmin.state.payments.map((payment) => [
    payment.id,
    payment.bookingId,
    payment.user,
    'NPR ' + Number(payment.amount).toLocaleString(),
    payment.method,
    payment.paymentDate,
    window.FNAdminComponents.getStatusBadge(payment.status),
    '<div class="action-group">' +
      '<button class="icon-button" data-payment-action="verify" data-payment-id="' + payment.id + '" title="Verify payment"><i class="fa-solid fa-shield-check"></i></button>' +
      '<button class="icon-button danger" data-payment-action="delete" data-payment-id="' + payment.id + '" title="Delete payment"><i class="fa-solid fa-trash"></i></button>' +
    '</div>'
  ]);
};

window.FNAdminPayments.render = function() {
  const headers = ['Transaction ID', 'Booking ID', 'User', 'Amount', 'Payment Method', 'Payment Date', 'Status', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'paymentsTableContainer', emptyMessage: 'No payment records available.' });
  const target = document.getElementById('paymentsTableContainer');
  if (target) {
    target.querySelectorAll('[data-payment-action]').forEach((button) => {
      button.addEventListener('click', () => this.handleAction(button.dataset.paymentAction, button.dataset.paymentId));
    });
  }
};

window.FNAdminPayments.handleAction = function(action, paymentId) {
  const payment = window.FNAdmin.state.payments.find((item) => item.id === paymentId);
  if (!payment) return;

  if (action === 'delete') {
    if (!window.confirm('Delete payment record "' + payment.id + '" permanently?')) return;
    const deletePromise = window.FNAdminData.isLive() ? window.FNAdminData.remove('payments', payment.id) : Promise.resolve();
    deletePromise.then(() => {
      window.FNAdmin.state.payments = window.FNAdmin.state.payments.filter((item) => item.id !== payment.id);
      this.render();
      window.FNAdminComponents.showToast('Payment record deleted successfully.', 'success');
    }).catch((error) => {
      console.error('Unable to delete payment:', error);
      window.FNAdminComponents.showToast('Payment could not be deleted: ' + (error.message || 'permission denied.'), 'error');
    });
    return;
  }

  if (action === 'verify') {
    this.verify(paymentId);
  }
};

window.FNAdminPayments.verify = function(paymentId) {
  const payment = window.FNAdmin.state.payments.find((item) => item.id === paymentId);
  if (!payment) return;
  payment.status = 'Paid';
  const save = window.FNAdminData.isLive() ? window.FNAdminData.save('payments', payment.id, payment) : Promise.resolve();
  save.then(() => {
    this.render();
    window.FNAdminComponents.showToast(payment.method + ' payment verified.', 'success');
  }).catch(() => window.FNAdminComponents.showToast('Payment updated locally, but live sync failed.', 'error'));
};

window.FNAdminPayments.init = function() {
  this.render();
};

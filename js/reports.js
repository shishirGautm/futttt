window.FNAdminReports = window.FNAdminReports || {};

window.FNAdminReports.getAnalytics = function() {
  const state = window.FNAdmin.state || {};
  const bookings = Array.isArray(state.bookings) ? state.bookings : [];
  const payments = Array.isArray(state.payments) ? state.payments : [];
  const users = Array.isArray(state.users) ? state.users : [];
  const courts = Array.isArray(state.courts) ? state.courts : [];
  const today = window.FNAdmin.getNepalDateTime().date;
  const sevenDaysAgo = new Date(window.FNAdmin.getNepalTimestamp(today, '00:00') - (6 * 86400000));
  const weekStart = window.FNAdmin.getNepalDateTime(sevenDaysAgo).date;
  const statusOf = (item) => String(item.bookingStatus || item.status || '').toLowerCase();
  const activeBookings = bookings.filter((booking) => !['cancelled', 'canceled', 'rejected'].includes(statusOf(booking)));
  const paidPayments = payments.filter((payment) => String(payment.status || payment.paymentStatus || '').toLowerCase() === 'paid');
  const paidBookingFallback = bookings.filter((booking) => String(booking.paymentStatus || '').toLowerCase() === 'paid');
  const revenue = paidPayments.length
    ? paidPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
    : paidBookingFallback.reduce((total, booking) => total + Number(booking.amount || 0), 0);
  const pendingPayments = payments.filter((payment) => String(payment.status || payment.paymentStatus || '').toLowerCase() === 'pending');
  const pendingRevenue = pendingPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const recentBookings = bookings.filter((booking) => {
    const createdAt = booking.createdAt || booking.date || '';
    const bookingDay = typeof createdAt === 'number'
      ? window.FNAdmin.getNepalDateTime(new Date(createdAt)).date
      : String(createdAt).slice(0, 10);
    return bookingDay >= weekStart;
  });
  const todayBookings = bookings.filter((booking) => booking.date === today);
  const bookingsByCourt = activeBookings.reduce((totals, booking) => {
    const court = courts.find((item) => item.id === booking.courtId || item.name === booking.court);
    const name = court ? court.name : (booking.court || booking.courtName || 'Unknown ground');
    totals[name] = (totals[name] || 0) + 1;
    return totals;
  }, {});
  const popularGround = Object.entries(bookingsByCourt).sort((first, second) => second[1] - first[1])[0];
  const requiredLiveCollections = ['bookings', 'payments', 'users', 'courts', 'reviews'];
  const liveCollections = state.liveCollections || {};
  const hasCompleteLiveData = window.FNAdminData && window.FNAdminData.isLive() && requiredLiveCollections.every((name) => liveCollections[name] === true);
  const hasPartialLiveData = requiredLiveCollections.some((name) => liveCollections[name] === true);
  const source = hasCompleteLiveData ? 'Live Firebase data' : hasPartialLiveData ? 'Partial Firebase data' : window.FNAdmin.demoMode ? 'Local/demo data' : 'Waiting for Firebase data';

  return [
    { name: 'Booking activity', value: bookings.length.toLocaleString(), details: source + ' · ' + todayBookings.length + ' today, ' + recentBookings.length + ' in the last 7 days' },
    { name: 'Booking status', value: activeBookings.length.toLocaleString() + ' active', details: bookings.filter((booking) => statusOf(booking) === 'confirmed').length + ' confirmed · ' + bookings.filter((booking) => statusOf(booking) === 'pending').length + ' pending · ' + bookings.filter((booking) => ['cancelled', 'canceled'].includes(statusOf(booking))).length + ' cancelled' },
    { name: 'Collected revenue', value: 'NPR ' + revenue.toLocaleString(), details: paidPayments.length ? paidPayments.length + ' paid payment records' : paidBookingFallback.length + ' paid bookings' },
    { name: 'Pending payments', value: pendingPayments.length.toLocaleString(), details: 'NPR ' + pendingRevenue.toLocaleString() + ' awaiting payment' },
    { name: 'User accounts', value: users.length.toLocaleString(), details: users.filter((user) => String(user.status || '').toLowerCase() === 'active').length + ' active · ' + users.filter((user) => String(user.status || '').toLowerCase() === 'disabled').length + ' disabled' },
    { name: 'Futsal grounds', value: courts.length.toLocaleString(), details: courts.filter((court) => String(court.status || '').toLowerCase() === 'active').length + ' active grounds' },
    { name: 'Most booked ground', value: popularGround ? popularGround[0] : 'No bookings yet', details: popularGround ? popularGround[1] + ' active bookings' : 'Ground rankings appear when bookings arrive' },
    { name: 'Reviews', value: (state.reviews || []).length.toLocaleString(), details: (state.reviews || []).filter((review) => String(review.status || '').toLowerCase() === 'pending').length + ' pending approval' }
  ];
};

window.FNAdminReports.getRows = function() {
  return this.getAnalytics().map((report) => [report.name, report.value, report.details]);
};

window.FNAdminReports.renderCharts = function() {
  const chartElements = {
    bookings: document.getElementById('reportsBookingsChart'),
    status: document.getElementById('reportsStatusChart'),
    revenue: document.getElementById('reportsRevenueChart')
  };
  const ChartConstructor = window.Chart;
  if (!ChartConstructor || !chartElements.bookings || !chartElements.status || !chartElements.revenue) return;

  window.FNAdmin.reportsCharts = window.FNAdmin.reportsCharts || {};
  Object.values(window.FNAdmin.reportsCharts).forEach((chart) => chart.destroy());
  if (typeof ChartConstructor.getChart === 'function') {
    Object.values(chartElements).forEach((canvas) => {
      const existingChart = ChartConstructor.getChart(canvas);
      if (existingChart) existingChart.destroy();
    });
  }

  const state = window.FNAdmin.state || {};
  const bookings = Array.isArray(state.bookings) ? state.bookings : [];
  const payments = Array.isArray(state.payments) ? state.payments : [];
  const courts = Array.isArray(state.courts) ? state.courts : [];
  const courtName = (booking) => {
    const court = courts.find((item) => item.id === booking.courtId || item.name === booking.court);
    return court ? court.name : (booking.court || booking.courtName || 'Unknown ground');
  };
  const normalizedStatus = (booking) => {
    const status = String(booking.bookingStatus || booking.status || '').trim().toLowerCase();
    if (status === 'canceled' || status === 'cancelled') return 'Cancelled';
    if (status === 'complete') return 'Completed';
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Other';
  };
  const activeBookings = bookings.filter((booking) => !['cancelled', 'canceled', 'rejected'].includes(normalizedStatus(booking).toLowerCase()));
  const bookingsByGround = activeBookings.reduce((totals, booking) => {
    const name = courtName(booking);
    totals[name] = (totals[name] || 0) + 1;
    return totals;
  }, {});
  const bookingStatusCounts = bookings.reduce((totals, booking) => {
    const status = normalizedStatus(booking);
    totals[status] = (totals[status] || 0) + 1;
    return totals;
  }, {});

  const paidPayments = payments.filter((payment) => String(payment.status || payment.paymentStatus || '').toLowerCase() === 'paid');
  const paidBookingFallback = bookings.filter((booking) => String(booking.paymentStatus || '').toLowerCase() === 'paid');
  const revenueByGround = {};
  if (paidPayments.length) {
    paidPayments.forEach((payment) => {
      const booking = bookings.find((item) => item.id === payment.bookingId);
      const name = booking ? courtName(booking) : (payment.court || payment.courtName || 'Unknown ground');
      revenueByGround[name] = (revenueByGround[name] || 0) + Number(payment.amount || 0);
    });
  } else {
    paidBookingFallback.forEach((booking) => {
      const name = courtName(booking);
      revenueByGround[name] = (revenueByGround[name] || 0) + Number(booking.amount || 0);
    });
  }

  const colors = ['#00B95A', '#2196F3', '#FF9800', '#E53935', '#7E57C2', '#00ACC1', '#8BC34A', '#EC407A'];
  const bookingGrounds = Object.entries(bookingsByGround).sort((first, second) => second[1] - first[1]);
  const revenueGrounds = Object.entries(revenueByGround).sort((first, second) => second[1] - first[1]);
  const statuses = Object.entries(bookingStatusCounts).sort((first, second) => second[1] - first[1]);
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  };

  window.FNAdmin.reportsCharts = {
    bookings: new ChartConstructor(chartElements.bookings, {
      type: 'bar',
      data: {
        labels: bookingGrounds.map(([name]) => name),
        datasets: [{
          label: 'Active bookings',
          data: bookingGrounds.map(([, count]) => count),
          backgroundColor: bookingGrounds.map((_, index) => colors[index % colors.length]),
          borderRadius: 8
        }]
      },
      options: barOptions
    }),
    status: new ChartConstructor(chartElements.status, {
      type: 'pie',
      data: {
        labels: statuses.map(([name]) => name),
        datasets: [{
          data: statuses.map(([, count]) => count),
          backgroundColor: statuses.map((_, index) => colors[index % colors.length]),
          borderWidth: 1,
          borderColor: '#ffffff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    }),
    revenue: new ChartConstructor(chartElements.revenue, {
      type: 'bar',
      data: {
        labels: revenueGrounds.map(([name]) => name),
        datasets: [{
          label: 'Paid revenue (NPR)',
          data: revenueGrounds.map(([, amount]) => amount),
          backgroundColor: revenueGrounds.map((_, index) => colors[index % colors.length]),
          borderRadius: 8
        }]
      },
      options: {
        ...barOptions,
        scales: { y: { beginAtZero: true, ticks: { callback: (value) => 'NPR ' + Number(value).toLocaleString() } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => 'NPR ' + Number(context.raw).toLocaleString() } } }
      }
    })
  };
};

window.FNAdminReports.render = function() {
  this.renderCharts();
  window.FNAdminComponents.renderTable({
    headers: ['Report', 'Current result', 'Analysis'],
    rows: this.getRows(),
    targetId: 'reportsTableContainer',
    emptyMessage: 'Live report data is loading.'
  });
  const source = document.getElementById('reportsDataSource');
  if (source) {
    const liveCollections = (window.FNAdmin.state && window.FNAdmin.state.liveCollections) || {};
    const requiredCollections = ['bookings', 'payments', 'courts'];
    const hasLiveData = requiredCollections.some((name) => liveCollections[name] === true);
    source.textContent = hasLiveData ? 'Charts use the latest available Firebase data.' : 'Charts use the currently available local/demo data.';
  }
};

window.FNAdminReports.exportCsv = function() {
  const rows = [['Report', 'Current result', 'Analysis'], ...this.getRows()];
  const csv = rows.map((row) => row.map((value) => '"' + String(value).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = 'futsal-live-report-' + window.FNAdmin.getNepalDateTime().date + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

window.FNAdminReports.init = function() {
  const exportButton = document.getElementById('exportReportsBtn');
  const printButton = document.getElementById('printReportsBtn');
  if (exportButton && exportButton.dataset.fnInitialized !== 'true') {
    exportButton.addEventListener('click', () => this.exportCsv());
    exportButton.dataset.fnInitialized = 'true';
  }
  if (printButton && printButton.dataset.fnInitialized !== 'true') {
    printButton.addEventListener('click', () => window.print());
    printButton.dataset.fnInitialized = 'true';
  }
  this.render();
};

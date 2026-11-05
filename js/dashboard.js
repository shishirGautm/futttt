window.FNAdminDashboard = window.FNAdminDashboard || {};

window.FNAdminDashboard.getStats = function() {
  const courts = window.FNAdmin.state.courts || [];
  const bookings = window.FNAdmin.state.bookings || [];
  const users = window.FNAdmin.state.users || [];
  const matches = window.FNAdmin.state.matches || [];
  const today = new Date().toISOString().slice(0, 10);
  const todaysBookings = bookings.filter((booking) => booking.date === today);
  const activeMatches = matches.filter((match) => ['active', 'live', 'ongoing'].includes(String(match.status || '').toLowerCase()));
  const pendingBookings = bookings.filter((booking) => String(booking.bookingStatus || booking.status || '').toLowerCase() === 'pending');
  const totalRevenue = bookings
    .filter((booking) => !['cancelled', 'canceled'].includes(String(booking.bookingStatus || booking.status || '').toLowerCase()))
    .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);

  return [
    { label: 'Total Users', value: users.length.toLocaleString(), change: 'Live', comparison: 'from Firebase', icon: 'fa-solid fa-users', trend: 'up' },
    { label: 'Total Courts', value: courts.length.toLocaleString(), change: 'Live', comparison: 'from Firebase', icon: 'fa-solid fa-futbol', trend: 'up' },
    { label: 'Total Bookings', value: bookings.length.toLocaleString(), change: 'Live', comparison: 'from Firebase', icon: 'fa-regular fa-calendar-check', trend: 'up' },
    { label: "Today's Bookings", value: todaysBookings.length.toLocaleString(), change: today, comparison: 'booking date', icon: 'fa-regular fa-clock', trend: 'up' },
    { label: 'Total Revenue', value: 'NPR ' + totalRevenue.toLocaleString(), change: 'Live', comparison: 'non-cancelled bookings', icon: 'fa-solid fa-wallet', trend: 'up' },
    { label: 'Active Matches', value: activeMatches.length.toLocaleString(), change: 'Live', comparison: 'active or live status', icon: 'fa-solid fa-trophy', trend: 'up' },
    { label: 'Pending Bookings', value: pendingBookings.length.toLocaleString(), change: 'Live', comparison: 'pending status', icon: 'fa-solid fa-hourglass-half', trend: 'down' },
    { label: 'Registered Teams', value: (window.FNAdmin.state.teams || []).length.toLocaleString(), change: 'Live', comparison: 'from Firebase', icon: 'fa-solid fa-people-group', trend: 'up' }
  ];
};

window.FNAdminDashboard.renderStats = function() {
  const stats = this.getStats();
  const holder = document.getElementById('statsGrid');
  if (!holder) return;

  holder.innerHTML = stats.map((stat) => `
    <article class="stat-card">
      <div class="stat-card__top">
        <div class="stat-icon"><i class="${stat.icon}"></i></div>
        <span class="change-pill ${stat.trend === 'down' ? 'negative' : ''}">${stat.change}</span>
      </div>
      <h3>${stat.label}</h3>
      <strong>${stat.value}</strong>
      <div class="stat-meta">
        <span>${stat.comparison}</span>
      </div>
    </article>
  `).join('');
};

window.FNAdminDashboard.updateGreeting = function() {
  const greeting = document.getElementById('adminGreeting');
  if (greeting) greeting.textContent = window.FNAdminComponents.getTimeGreeting();
};

window.FNAdminDashboard.setupCharts = function() {
  const bookingCtx = document.getElementById('bookingChart');
  const revenueCtx = document.getElementById('revenueChart');
  const userGrowthCtx = document.getElementById('userGrowthChart');
  const bookingStatusCtx = document.getElementById('bookingStatusChart');

  if (!bookingCtx || !revenueCtx || !userGrowthCtx || !bookingStatusCtx) return;

  const chartCanvases = [bookingCtx, revenueCtx, userGrowthCtx, bookingStatusCtx];
  if (window.FNAdmin.dashboardCharts) {
    Object.values(window.FNAdmin.dashboardCharts).forEach((chart) => chart.destroy());
  }
  if (typeof Chart.getChart === 'function') {
    chartCanvases.forEach((canvas) => {
      const existingChart = Chart.getChart(canvas);
      if (existingChart) existingChart.destroy();
    });
  }

  const bookings = window.FNAdmin.state.bookings || [];
  const users = window.FNAdmin.state.users || [];
  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  const shortLabels = labels.map((date) => new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }));
  const bookingData = labels.map((date) => bookings.filter((booking) => booking.date === date).length);
  const revenueData = labels.map((date) => bookings.filter((booking) => booking.date === date && !['cancelled', 'canceled'].includes(String(booking.bookingStatus || '').toLowerCase())).reduce((sum, booking) => sum + Number(booking.amount || 0), 0));
  const bookingChart = new Chart(bookingCtx, {
    type: 'line',
    data: {
      labels: shortLabels,
      datasets: [{
        label: 'Bookings',
        data: bookingData,
        borderColor: '#00B95A',
        backgroundColor: 'rgba(0, 185, 90, 0.12)',
        fill: true,
        tension: 0.3,
        borderWidth: 3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  const revenueChart = new Chart(revenueCtx, {
    type: 'bar',
    data: {
      labels: shortLabels,
      datasets: [{
        label: 'Revenue',
        data: revenueData,
        backgroundColor: ['#00B95A', '#00C853', '#34d399', '#00B95A', '#00C853', '#0ea5e9', '#34d399'],
        borderRadius: 10
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  const userGrowthChart = new Chart(userGrowthCtx, {
    type: 'doughnut',
    data: {
      labels: ['Active users', 'Disabled users', 'Other users'],
      datasets: [{
        data: [users.filter((user) => String(user.status).toLowerCase() === 'active').length, users.filter((user) => String(user.status).toLowerCase() === 'disabled').length, users.filter((user) => !['active', 'disabled'].includes(String(user.status).toLowerCase())).length],
        backgroundColor: ['#00B95A', '#004D35', '#00C853']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const bookingStatusChart = new Chart(bookingStatusCtx, {
    type: 'polarArea',
    data: {
      labels: ['Confirmed', 'Pending', 'Rejected', 'Cancelled', 'Completed'],
      datasets: [{
        data: ['Confirmed', 'Pending', 'Rejected', 'Cancelled', 'Completed'].map((status) => bookings.filter((booking) => String(booking.bookingStatus || '').toLowerCase() === status.toLowerCase()).length),
        backgroundColor: ['#00B95A', '#FF9800', '#E53935', '#B71C1C', '#2196F3']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const popularCourtsList = document.getElementById('popularCourtsList');
  if (popularCourtsList) {
    const courtLookup = new Map((window.FNAdmin.state.courts || []).map((court) => [String(court.id || court.name), court.name]));
    const courtTotals = bookings.reduce((totals, booking) => {
      const courtId = booking.courtId || booking.court || 'unknown';
      const resolvedName = courtLookup.get(String(courtId)) || booking.court || booking.courtName || 'Unknown court';
      const key = resolvedName.trim() || 'Unknown court';
      if (!totals[key]) totals[key] = { name: key, bookings: 0, revenue: 0 };
      totals[key].bookings += 1;
      totals[key].revenue += Number(booking.amount || 0);
      return totals;
    }, {});

    const items = Object.values(courtTotals).sort((first, second) => second.bookings - first.bookings).slice(0, 5);

    if (!items.length) {
      popularCourtsList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-futbol"></i><h3>No bookings yet</h3><p>Popular courts will appear here once bookings are created.</p></div>';
    } else {
      popularCourtsList.innerHTML = items.map((court, index) => `
        <div class="rank-item">
          <span class="rank-number">${index + 1}</span>
          <div>
            <strong>${court.name}</strong>
            <small>${court.bookings} bookings</small>
          </div>
          <strong>NPR ${court.revenue.toLocaleString()}</strong>
        </div>
      `).join('');
    }
  }

  window.FNAdmin.dashboardCharts = { bookingChart, revenueChart, userGrowthChart, bookingStatusChart };
};

window.FNAdminDashboard.init = function() {
  this.updateGreeting();
  this.renderStats();
  this.setupCharts();
};

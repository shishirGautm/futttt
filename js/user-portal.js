window.FNUserPortal = window.FNUserPortal || {};

window.FNUserPortal.getUserBookings = function() {
  const user = window.FNAdminAuth.user;
  if (!user) return [];

  const uid = String(user.uid || '').trim();
  const email = String(user.email || '').trim().toLowerCase();
  const name = String(user.name || '').trim().toLowerCase();

  const matchesUser = (booking) => {
    const bookingUserId = String(booking.userId || '').trim();
    const bookingEmail = String(booking.userEmail || '').trim().toLowerCase();
    const bookingName = String(booking.user || '').trim().toLowerCase();

    if (uid && bookingUserId && bookingUserId === uid) return true;
    if (email && bookingEmail && bookingEmail === email) return true;
    if (name && bookingName && bookingName === name) return true;
    return false;
  };

  const bookings = (window.FNAdmin.state.bookings || []);
  const matchedBookings = bookings.filter(matchesUser);
  if (matchedBookings.length || !window.FNAdmin.demoMode) return matchedBookings;

  return bookings;
};

window.FNUserPortal.deleteNotification = function(notificationId) {
  if (!notificationId) return Promise.resolve(false);
  const index = (window.FNAdmin.state.notifications || []).findIndex((item) => item.id === notificationId);
  if (index < 0) return Promise.resolve(false);
  if (!window.confirm('Delete this notification permanently?')) return Promise.resolve(false);
  const remove = window.FNAdminData.isLive() ? window.FNAdminData.remove('notifications', notificationId) : Promise.resolve();
  return remove.then(() => {
    window.FNAdmin.state.notifications.splice(index, 1);
    this.renderNotifications();
    window.FNAdminComponents.showToast('Notification deleted.', 'success');
    return true;
  }).catch((error) => {
    window.FNAdminComponents.showToast('Notification could not be deleted: ' + (error.message || 'permission denied.'), 'error');
    return false;
  });
};

window.FNUserPortal.renderNotifications = function() {
  const list = document.getElementById('userNotificationsList');
  if (!list) return;
  const user = window.FNAdminAuth.user;
  const expiryLimit = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const notifications = window.FNAdmin.getNotificationsForRole('User').filter((item) => new Date(item.date || 0).getTime() >= expiryLimit);
  const unreadCount = notifications.filter((item) => item.isRead !== true).length;
  const badge = document.getElementById('userNotificationsCount');
  const summary = document.getElementById('userNotificationSummary');
  const preview = document.getElementById('userNotificationPreview');
  if (badge) badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
  if (summary) summary.textContent = unreadCount + ' unread';
  if (preview) preview.innerHTML = notifications.length ? notifications.slice().sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 5).map((item) => '<article class="owner-notification-preview-item' + (item.isRead === true ? '' : ' notification-unread') + '"><strong>' + this.escapeHtml(item.title) + '</strong><p>' + this.escapeHtml(item.message) + '</p><small>' + new Date(item.date || item.createdAt).toLocaleString() + '</small></article>').join('') : '<p class="owner-notification-empty">No notifications yet.</p>';
  list.innerHTML = notifications.length ? notifications.map((item) => {
    const canDelete = user && (item.userId === user.uid || item.targetUserId === user.uid || item.targetUserEmail === user.email);
    return '<article class="user-notification' + (item.isRead === true ? '' : ' notification-unread') + '"><div class="notification-item-heading"><strong>' + this.escapeHtml(item.title) + '</strong><span>' + (item.isRead === true ? '' : '<button class="notification-read-button" type="button" data-read-user-notification="' + item.id + '" title="Mark as read">Mark read</button>') + (canDelete ? '<button class="notification-delete-button" type="button" data-user-notification-delete="' + item.id + '" title="Delete notification" aria-label="Delete notification"><i class="fa-solid fa-trash"></i></button>' : '') + '</span></div><p>' + this.escapeHtml(item.message) + '</p><small>' + new Date(item.date || item.createdAt).toLocaleString() + '</small></article>';
  }).join('') : '<p class="muted">No new notifications.</p>';
  list.querySelectorAll('[data-user-notification-delete]').forEach((button) => button.addEventListener('click', () => this.deleteNotification(button.dataset.userNotificationDelete)));
  list.querySelectorAll('[data-read-user-notification]').forEach((button) => button.addEventListener('click', () => this.markNotificationRead(button.dataset.readUserNotification)));
  this.renderNotificationBell();
  window.FNAdmin.cleanupExpiredNotifications().catch((error) => console.error('Unable to remove expired notifications:', error));
};

window.FNUserPortal.markNotificationRead = function(notificationId) {
  const notification = (window.FNAdmin.state.notifications || []).find((item) => item.id === notificationId);
  return window.FNAdmin.markNotificationRead(notification).then(() => this.renderNotifications()).catch((error) => window.FNAdminComponents.showToast('Notification could not be updated: ' + error.message, 'error'));
};

window.FNUserPortal.markAllNotificationsRead = function() {
  return window.FNAdmin.markAllNotificationsRead(window.FNAdmin.getNotificationsForRole('User')).then(() => this.renderNotifications()).catch((error) => window.FNAdminComponents.showToast('Notifications could not be updated: ' + error.message, 'error'));
};

window.FNUserPortal.renderNotificationBell = function() {
  const button = document.getElementById('userNotificationsBtn');
  const dropdown = document.getElementById('userNotificationDropdown');
  if (!button || !dropdown || button.dataset.fnInitialized === 'true') return;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const isHidden = dropdown.classList.toggle('is-hidden');
    button.setAttribute('aria-expanded', String(!isHidden));
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.user-notification-menu')) {
      dropdown.classList.add('is-hidden');
      button.setAttribute('aria-expanded', 'false');
    }
  });
  const viewAll = document.getElementById('viewUserNotificationsBtn');
  if (viewAll) viewAll.addEventListener('click', () => {
    dropdown.classList.add('is-hidden');
    document.getElementById('userNotificationsPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const markDropdown = document.getElementById('markUserNotificationsReadBtn');
  const markPanel = document.getElementById('markUserAllReadBtn');
  if (markDropdown) markDropdown.addEventListener('click', () => this.markAllNotificationsRead());
  if (markPanel) markPanel.addEventListener('click', () => this.markAllNotificationsRead());
  button.dataset.fnInitialized = 'true';
};

window.FNUserPortal.renderProfile = function() {
  const identity = document.getElementById('userProfileIdentity');
  const details = document.getElementById('userProfileDetails');
  const heroProfile = document.getElementById('userHeroProfile');
  const user = window.FNAdminAuth.user || {};
  if (!identity && !details && !heroProfile) return;
  const profile = (window.FNAdmin.state.users || []).find((item) => item.id === user.uid || item.email === user.email) || user;
  const fallbackName = user.email ? user.email.split('@')[0].replace(/[._-]+/g, ' ') : 'player';
  const name = profile.name && profile.name !== profile.email ? profile.name : (user.name && user.name !== user.email ? user.name : fallbackName);
  if (identity) identity.innerHTML = '<strong>' + this.escapeHtml(name) + '</strong>';
  if (details) details.innerHTML = '<div><span>Name</span><strong>' + this.escapeHtml(name) + '</strong></div>';
  const heroName = document.getElementById('userHeroName');
  if (heroName) heroName.textContent = name;
  if (heroProfile) heroProfile.innerHTML = '<div class="portal-hero__profile-details"><strong>' + this.escapeHtml(name) + '</strong></div>';
  const profileForm = document.getElementById('userProfileForm');
  if (profileForm && (profileForm.dataset.profilePopulated !== 'true' || profileForm.classList.contains('hidden'))) {
    profileForm.elements.name.value = name;
    profileForm.dataset.profilePopulated = 'true';
  }
};

window.FNUserPortal.getPublicTeams = function() {
  return (window.FNAdmin.state.teams || []).filter((team) => {
    const status = String(team.status || '').toLowerCase();
    return status === 'approved' || status === 'active';
  });
};

window.FNUserPortal.updateDashboard = function() {
  const userName = document.getElementById('userDisplayName');
  const greeting = document.getElementById('userGreetingText');
  const venueCount = document.getElementById('userVenueCount');
  const teamCount = document.getElementById('userTeamCount');
  const currentDate = document.getElementById('userCurrentDate');
  const user = window.FNAdminAuth.user;
  this.renderProfile();
  if (greeting) greeting.textContent = window.FNAdminComponents.getTimeGreeting();
  if (currentDate) currentDate.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  if (userName && user) {
    const fallbackName = user.email ? user.email.split('@')[0].replace(/[._-]+/g, ' ') : 'player';
    userName.textContent = user.name && user.name !== user.email ? user.name : fallbackName;
  }
  if (venueCount) venueCount.textContent = window.FNAdmin.state.courts.filter((court) => court.status === 'active').length + ' venues';
  if (teamCount) teamCount.textContent = this.getPublicTeams().length + ' teams';
};

window.FNUserPortal.renderTeams = function() {
  const list = document.getElementById('userTeamsList');
  if (!list) return;

  const teams = this.getPublicTeams();
  if (!teams.length) {
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-people-group"></i><h3>No teams available</h3><p>Approved community teams will appear here.</p></div>';
    return;
  }

  list.innerHTML = teams.map((team) => {
    const memberCount = Array.isArray(team.members) ? team.members.length : Number(team.members || 0);
    const record = Number(team.wins || 0) + ' wins · ' + Number(team.losses || 0) + ' losses';
    return '<article class="user-team-card">' +
      '<div class="user-team-card__header"><div><p class="eyebrow text-green">Community team</p><h4>' + this.escapeHtml(team.name || 'Untitled team') + '</h4></div><span class="status-badge ' + this.escapeHtml(String(team.status || 'approved').toLowerCase()) + '">' + this.escapeHtml(team.status || 'Approved') + '</span></div>' +
      '<div class="user-team-card__details">' +
      '<span><i class="fa-solid fa-user"></i><strong>Captain</strong> ' + this.escapeHtml(team.captain || 'Not listed') + '</span>' +
      '<span><i class="fa-solid fa-people-group"></i><strong>Members</strong> ' + (Number.isFinite(memberCount) ? memberCount : 0) + '</span>' +
      '<span><i class="fa-solid fa-location-dot"></i><strong>Location</strong> ' + this.escapeHtml(team.location || 'Not listed') + '</span>' +
      '<span><i class="fa-solid fa-trophy"></i><strong>Record</strong> ' + this.escapeHtml(record) + '</span>' +
      '<span><i class="fa-regular fa-calendar-check"></i><strong>Matches played</strong> ' + Number(team.matchesPlayed || 0) + '</span>' +
      '</div></article>';
  }).join('');
};

window.FNUserPortal.formatDate = function(date) {
  return new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

window.FNUserPortal.updateTimeSlots = function() {
  const courtSelect = document.getElementById('userBookingCourt');
  const timeSelect = document.getElementById('userBookingTime');
  if (!courtSelect || !timeSelect) return;

  const selectedCourt = (window.FNAdmin.state.courts || []).find((court) => court.id === courtSelect.value);
  const openingMinutes = this.toMinutes(selectedCourt?.openingTime || '06:00');
  const closingMinutes = this.toMinutes(selectedCourt?.closingTime || '22:00');
  const slotDuration = Number(selectedCourt?.slotDuration || 60);
  const date = document.getElementById('userBookingDate') ? document.getElementById('userBookingDate').value : '';
  const nepalNow = window.FNAdmin.getNepalDateTime();
  const blockedSlots = selectedCourt && Array.isArray(selectedCourt.blockedSlots) ? selectedCourt.blockedSlots : [];
  timeSelect.innerHTML = '';
  for (let start = openingMinutes; start + slotDuration <= closingMinutes; start += slotDuration) {
    const end = start + slotDuration;
    const startTime = this.toTime(start);
    const endTime = this.toTime(end);
    const expired = date < nepalNow.date || (date === nepalNow.date && start <= nepalNow.minutes);
    const option = document.createElement('option');
    const slotKey = date + ' | ' + startTime + ' - ' + endTime;
    const matchingBooking = [...(window.FNAdmin.state.bookings || []), ...(window.FNAdmin.state.bookingSlots || [])].find((item) => window.FNAdmin.isBookingActive(item)
      && item.date === date
      && ((item.courtId && item.courtId === (selectedCourt && selectedCourt.id)) || item.court === (selectedCourt && selectedCourt.name))
      && this.toMinutes(startTime) < this.toMinutes(item.endTime)
      && this.toMinutes(item.startTime) < this.toMinutes(endTime));
    const booked = !!matchingBooking;
    const blocked = blockedSlots.includes(slotKey);
    option.value = startTime + '|' + endTime;
    const bookingStatus = matchingBooking ? String(matchingBooking.bookingStatus || '').toLowerCase() : '';
    const slotLabel = expired ? 'Expired' : blocked ? 'Unavailable' : bookingStatus === 'confirmed' ? 'Booked' : bookingStatus === 'pending' ? 'Pending' : 'Available';
    option.textContent = this.toTimeLabel(startTime) + ' - ' + this.toTimeLabel(endTime) + ' - ' + slotLabel;
    option.dataset.availability = expired ? 'expired' : blocked ? 'unavailable' : bookingStatus === 'confirmed' ? 'booked' : bookingStatus || 'available';
    option.disabled = expired || booked || blocked;
    timeSelect.appendChild(option);
  }
  const firstAvailable = Array.from(timeSelect.options).find((option) => !option.disabled);
  if (firstAvailable) timeSelect.value = firstAvailable.value;
};

window.FNUserPortal.subscribeToSelectedSlot = function() {
  const courtSelect = document.getElementById('userBookingCourt');
  const dateInput = document.getElementById('userBookingDate');
  if (window.FNAdmin && typeof window.FNAdmin.subscribeToBookingSlots === 'function') {
    window.FNAdmin.subscribeToBookingSlots(courtSelect && courtSelect.value, dateInput && dateInput.value);
  }
};

window.FNUserPortal.toMinutes = function(time) {
  const parts = String(time || '08:00').split(':').map(Number);
  return (parts[0] * 60) + parts[1];
};

window.FNUserPortal.toTime = function(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
};

window.FNUserPortal.toTimeLabel = function(time) {
  const parts = time.split(':').map(Number);
  const hour = parts[0] % 12 || 12;
  const period = parts[0] < 12 ? 'AM' : 'PM';
  return String(hour).padStart(2, '0') + ':' + String(parts[1]).padStart(2, '0') + ' ' + period;
};

window.FNUserPortal.getCourtReviews = function(courtName) {
  const currentUserId = window.FNAdminAuth.user?.uid || '';
  return (window.FNAdmin.state.reviews || []).filter((review) => review.court === courtName && (review.status === 'Approved' || (review.status === 'Pending' && currentUserId && review.userId === currentUserId)));
};

window.FNUserPortal.escapeHtml = function(value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
};

window.FNUserPortal.formatCourtFieldValue = function(value) {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.error('Unable to format court field:', error);
    return String(value);
  }
};

window.FNUserPortal.renderCourtFields = function(court) {
  return '<details class="court-firebase-details"><summary>More venue details</summary><dl>' +
    Object.entries(court).map(([key, value]) => '<div><dt>' + this.escapeHtml(key) + '</dt><dd>' +
      this.escapeHtml(this.formatCourtFieldValue(value)) + '</dd></div>').join('') +
    '</dl></details>';
};

window.FNUserPortal.openCourtReviews = function(court) {
  const reviews = this.getCourtReviews(court.name);
  const content = reviews.length
    ? reviews.map((review) => '<article class="court-review-item"><div class="court-review-heading"><strong>' + this.escapeHtml(review.user) + '</strong><span>' + Number(review.rating || 0) + '/5 <i class="fa-solid fa-star"></i></span></div><p>' + this.escapeHtml(review.review) + '</p><small>' + this.escapeHtml(this.formatDate(review.date)) + (review.status === 'Pending' ? ' · Awaiting approval' : '') + '</small></article>').join('')
    : '<div class="empty-state"><i class="fa-regular fa-star"></i><h3>No reviews yet</h3><p>Reviews will appear after players complete a booking.</p></div>';
  window.FNAdminComponents.openModal('<div class="panel__header"><div><p class="eyebrow text-green">Player feedback</p><h3>' + this.escapeHtml(court.name) + '</h3></div><button class="icon-button" data-close-modal="true" aria-label="Close reviews"><i class="fa-solid fa-xmark"></i></button></div><div class="court-review-list">' + content + '</div>');
  document.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
};

window.FNUserPortal.updateAmount = function() {
  const courtSelect = document.getElementById('userBookingCourt');
  const amount = document.getElementById('userBookingAmount');
  const location = document.getElementById('userCourtLocation');
  const address = document.getElementById('userCourtAddress');
  const availability = document.getElementById('userCourtAvailability');
  const mapLink = document.getElementById('userCourtMapLink');
  const dateInput = document.getElementById('userBookingDate');
  const timeSelect = document.getElementById('userBookingTime');
  if (!courtSelect || !amount) return;
  const court = window.FNAdmin.state.courts.find((item) => item.id === courtSelect.value);
  amount.textContent = court ? 'NPR ' + Number(court.pricePerHour || 0).toLocaleString() : 'NPR 0';
  if (location && mapLink) {
    address.textContent = court ? court.address + ', ' + court.city : 'Select a futsal to see its location.';
    mapLink.href = court ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(court.address + ', ' + court.city + ', Nepal') : '#';
    mapLink.classList.toggle('hidden', !court);
    if (availability) {
      const date = dateInput ? dateInput.value : '';
      const timeSlot = timeSelect && timeSelect.value ? timeSelect.value.split('|') : [];
      const startTime = timeSlot[0] || '';
      const endTime = timeSlot[1] || '';
      const conflict = court && startTime && endTime && window.FNAdmin.hasBookingConflict({ courtId: court.id, court: court.name, date, startTime, endTime });
      const expired = court && date && startTime && endTime && window.FNAdmin.isBookingTimeExpired({ date, startTime, endTime });
      availability.textContent = court ? (expired ? 'This time slot has expired (Nepal time)' : conflict ? 'Not available for this time' : startTime && endTime ? 'Available for this time' : 'Select a time slot') : '';
      availability.classList.toggle('unavailable', !!(conflict || expired));
    }
  }
};

window.FNUserPortal.renderBookings = function() {
  const list = document.getElementById('userBookingsList');
  const count = document.getElementById('userBookingCount');
  const next = document.getElementById('userNextBooking');
  if (!list || !count || !next) return;

  const allBookings = this.getUserBookings();
  const legacyRejectedBookings = allBookings.filter((booking) => booking.bookingStatus === 'Rejected');
  this.rejectedBookingCleanupIds = this.rejectedBookingCleanupIds || new Set();
  legacyRejectedBookings.forEach((booking) => {
    if (this.rejectedBookingCleanupIds.has(booking.id)) return;
    this.rejectedBookingCleanupIds.add(booking.id);
    window.FNAdmin.deleteUserBooking(booking).catch((error) => {
      console.warn('Unable to clean up an older rejected booking:', error.message);
    });
  });
  const bookings = allBookings.filter((booking) => booking.bookingStatus !== 'Rejected').sort((first, second) => (first.date + first.startTime).localeCompare(second.date + second.startTime));
  const today = window.FNAdmin.getNepalDateTime().date;
  const upcoming = bookings.filter((booking) => booking.date >= today && ['Pending', 'Confirmed'].includes(booking.bookingStatus));
  const completed = bookings.filter((booking) => booking.bookingStatus === 'Completed' || (booking.date < today && !['Cancelled', 'Rejected'].includes(booking.bookingStatus)));
  const groupedBookings = [
    { label: 'Upcoming', items: upcoming },
    { label: 'Completed', items: completed },
    { label: 'Cancelled', items: bookings.filter((booking) => booking.bookingStatus === 'Cancelled') }
  ];
  this.updateDashboard();
  count.textContent = String(upcoming.length);
  next.textContent = upcoming[0] ? upcoming[0].court + ' • ' + this.formatDate(upcoming[0].date) + ' at ' + upcoming[0].startTime : 'Book a court to see your next match here.';
  const totalBookings = document.getElementById('userTotalBookingStat');
  const completedBookings = document.getElementById('userCompletedBookingStat');
  if (totalBookings) totalBookings.textContent = String(allBookings.length);
  if (completedBookings) completedBookings.textContent = String(completed.length);
  this.renderUpcomingMatch(upcoming[0] || null);

  const renderBooking = (booking) => {
    const existingReview = (window.FNAdmin.state.reviews || []).find((review) => review.bookingId === booking.id || (review.user === booking.user && review.court === booking.court));
    const canReview = ['Confirmed', 'Completed'].includes(booking.bookingStatus) || booking.paymentStatus === 'Paid';
    const bookingStart = window.FNAdmin.getNepalTimestamp(booking.date, booking.startTime);
    const canCancel = ['Pending', 'Confirmed'].includes(booking.bookingStatus) && Number.isFinite(bookingStart) && bookingStart - Date.now() > 60 * 60 * 1000;
    const rescheduleAction = canCancel ? '<button class="booking-reschedule" type="button" data-reschedule-booking-id="' + booking.id + '">Change time</button>' : '';
    const reviewAction = canReview && !existingReview
      ? '<button class="booking-review" type="button" data-review-booking-id="' + booking.id + '">Rate & review</button>'
      : (existingReview ? '<span class="review-status">Reviewed</span>' : '');
    return '<div class="user-booking-item"><div><strong>' + this.escapeHtml(booking.court) + '</strong><small>' + this.formatDate(booking.date) + ' • ' + this.toTimeLabel(booking.startTime) + ' - ' + this.toTimeLabel(booking.endTime) + '</small><small>Booking ID: ' + this.escapeHtml(booking.id) + ' • ' + booking.bookingStatus + ' • Payment: ' + this.escapeHtml(booking.paymentStatus) + '</small></div><div><span class="booking-price">NPR ' + Number(booking.amount || 0).toLocaleString() + '</span>' + rescheduleAction + (canCancel ? '<button class="booking-cancel" type="button" data-booking-id="' + booking.id + '">Cancel</button>' : '') + reviewAction + '<button class="icon-button danger booking-delete" type="button" data-delete-user-booking="' + booking.id + '" title="Delete booking" aria-label="Delete booking at ' + this.escapeHtml(booking.court) + '"><i class="fa-solid fa-trash"></i></button></div></div>';
  };
  list.innerHTML = bookings.length ? groupedBookings.filter((group) => group.items.length).map((group) => '<section class="booking-history-group"><h4>' + group.label + '</h4>' + group.items.map(renderBooking).join('') + '</section>').join('') : '<p class="muted">You have no bookings yet.</p>';

  list.querySelectorAll('[data-booking-id]').forEach((button) => button.addEventListener('click', () => {
    const booking = window.FNAdmin.state.bookings.find((item) => item.id === button.dataset.bookingId);
    if (!booking) return;
    const bookingStart = window.FNAdmin.getNepalTimestamp(booking.date, booking.startTime);
    if (!['Pending', 'Confirmed'].includes(booking.bookingStatus) || !Number.isFinite(bookingStart) || bookingStart - Date.now() <= 60 * 60 * 1000) {
      this.renderBookings();
      return;
    }
    const proceed = window.confirm('Cancel booking for ' + booking.court + ' on ' + booking.date + '?');
    if (!proceed) return;
    window.FNAdmin.setBookingStatus(booking, 'Cancelled');
    window.FNAdmin.syncBookings(booking)
      .then(() => {
        window.FNAdminComponents.showToast('Booking cancelled.', 'success');
        this.renderBookings();
      })
      .catch(() => window.FNAdminComponents.showToast('Unable to sync the cancellation.', 'error'));
  }));

  list.querySelectorAll('[data-delete-user-booking]').forEach((button) => button.addEventListener('click', () => {
    const booking = this.getUserBookings().find((item) => item.id === button.dataset.deleteUserBooking);
    if (!booking) return;
    const confirmed = window.confirm('Permanently delete this booking for ' + booking.court + '? Active bookings will be cancelled first and the slot will be released.');
    if (!confirmed) return;
    button.disabled = true;
    window.FNAdmin.deleteUserBooking(booking).then(() => {
      window.FNAdminComponents.showToast('Booking deleted.', 'success');
      this.renderBookings();
    }).catch((error) => {
      window.FNAdminComponents.showToast(error.message || 'Booking could not be deleted.', 'error');
    }).finally(() => {
      if (button.isConnected) button.disabled = false;
    });
  }));

  list.querySelectorAll('[data-review-booking-id]').forEach((button) => button.addEventListener('click', () => {
    const booking = window.FNAdmin.state.bookings.find((item) => item.id === button.dataset.reviewBookingId);
    if (!booking) return;
    window.FNAdminReviews.openReviewModal(booking);
  }));
  list.querySelectorAll('[data-reschedule-booking-id]').forEach((button) => button.addEventListener('click', () => {
    const booking = window.FNAdmin.state.bookings.find((item) => item.id === button.dataset.rescheduleBookingId);
    const bookingPanel = document.getElementById('userBookingPanel');
    const courtSelect = document.getElementById('userBookingCourt');
    const dateInput = document.getElementById('userBookingDate');
    const bookingForm = document.getElementById('userBookingForm');
    if (!booking || !bookingPanel || !courtSelect || !dateInput || !bookingForm) return;
    bookingPanel.classList.remove('hidden');
    courtSelect.value = booking.courtId;
    dateInput.value = booking.date;
    this.updateTimeSlots();
    const timeSelect = document.getElementById('userBookingTime');
    timeSelect.value = booking.startTime + '|' + booking.endTime;
    bookingForm.dataset.rescheduleBookingId = booking.id;
    bookingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
};

window.FNUserPortal.renderUpcomingMatch = function(booking) {
  const content = document.getElementById('userUpcomingMatchContent');
  if (!content) return;
  if (!booking) {
    content.innerHTML = '<div class="user-upcoming-empty"><span class="user-upcoming-empty__icon"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i></span><div><strong>No match on the calendar yet</strong><p>Find an available court and book a time that works for your team.</p></div><button class="btn btn-primary" type="button" data-user-scroll="userCourtsPanel">Explore courts <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></div>';
    return;
  }
  const court = (window.FNAdmin.state.courts || []).find((item) => item.id === booking.courtId || item.name === booking.court);
  const location = court ? [court.city, court.district, court.province].filter(Boolean).join(', ') : '';
  const image = court && Array.isArray(court.images) && court.images[0]
    ? court.images[0]
    : 'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=800&q=80';
  const status = String(booking.bookingStatus || 'Pending');
  const paymentStatus = String(booking.paymentStatus || 'Pending');
  const courtType = court && court.type ? String(court.type) : 'Futsal court';
  content.innerHTML = '<article class="user-upcoming-card">' +
    '<img src="' + this.escapeHtml(image) + '" alt="' + this.escapeHtml(booking.court || 'Futsal court') + '" loading="lazy" decoding="async" />' +
    '<div class="user-upcoming-card__main"><div class="user-upcoming-card__title"><div><span class="user-upcoming-card__eyebrow"><i class="fa-solid fa-futbol" aria-hidden="true"></i> Next on the pitch</span><h4>' + this.escapeHtml(booking.court || 'Futsal court') + '</h4></div><span class="user-booking-status ' + this.escapeHtml(status.toLowerCase()) + '">' + this.escapeHtml(status) + '</span></div>' +
    '<p class="user-upcoming-card__location"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + this.escapeHtml(location || 'Location details unavailable') + '</p>' +
    '<div class="user-upcoming-card__details"><span><i class="fa-regular fa-calendar" aria-hidden="true"></i><strong>' + this.escapeHtml(this.formatDate(booking.date)) + '</strong></span><span><i class="fa-regular fa-clock" aria-hidden="true"></i><strong>' + this.escapeHtml(this.toTimeLabel(booking.startTime) + ' - ' + this.toTimeLabel(booking.endTime)) + '</strong></span><span><i class="fa-solid fa-layer-group" aria-hidden="true"></i><strong>' + this.escapeHtml(courtType) + '</strong></span></div>' +
    '<div class="user-upcoming-card__footer"><span class="user-upcoming-card__payment">Payment <strong>' + this.escapeHtml(paymentStatus) + '</strong></span><button class="btn btn-secondary" type="button" data-user-scroll="userBookingsPanel">View booking details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></div></div></article>';
};

window.FNUserPortal.getTournamentCourt = function(tournament) {
  const courts = window.FNAdmin.state.courts || [];
  return courts.find((court) => String(court.id) === String(tournament.courtId)) || null;
};

window.FNUserPortal.renderTournaments = function() {
  const list = document.getElementById('userTournamentsList');
  if (!list) return;

  const user = window.FNAdminAuth.user || {};
  const userId = user.uid || (user.email ? 'email:' + user.email : 'guest');
  const tournaments = (window.FNAdmin.state.tournaments || []).filter((tournament) => tournament.courtId && (!tournament.status || tournament.status !== 'Draft'));

  if (!tournaments.length) {
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-trophy"></i><h3>No tournaments</h3><p>There are no active tournaments available right now.</p></div>';
    return;
  }

  list.innerHTML = tournaments.map((tournament) => {
    const selectedCourt = this.getTournamentCourt(tournament);
    const courtName = selectedCourt ? selectedCourt.name : (tournament.courtName || 'Selected ground unavailable');
    const courtLocation = selectedCourt
      ? [selectedCourt.address, selectedCourt.city, selectedCourt.district, selectedCourt.province].filter(Boolean).join(', ')
      : (tournament.location || 'Location unavailable');
    const participants = (Array.isArray(tournament.participants) ? tournament.participants : []).filter((participant) => !['Cancelled', 'Rejected'].includes(participant.registrationStatus));
    const joinedParticipant = participants.find((participant) => (participant.userId && participant.userId === userId) || (participant.email && participant.email === user.email));
    const isJoined = !!joinedParticipant;
    const remainingSlots = Math.max((Number(tournament.maxTeams || 0) || 0) - participants.length, 0);
    const joinLabel = isJoined ? ((joinedParticipant.registrationStatus || 'Confirmed') === 'Confirmed' ? 'Confirmed' : 'Pending approval') : remainingSlots > 0 ? 'Join tournament' : 'Waitlist full';
    const joinDisabled = isJoined || remainingSlots <= 0 ? 'disabled' : '';
    return '<article class="user-tournament-card">' +
      '<div class="user-tournament-header">' +
      '<div><p class="eyebrow text-green">Tournament</p><h4>' + this.escapeHtml(tournament.name || 'Untitled tournament') + '</h4></div>' +
      '<span class="status-badge ' + String(tournament.status || 'Open').toLowerCase() + '">' + (tournament.status || 'Open') + '</span>' +
      '</div>' +
      '<p class="user-tournament-description">' + this.escapeHtml(tournament.description || 'A competitive futsal tournament for local players and community teams.') + '</p>' +
      '<div class="user-tournament-meta"><span><i class="fa-solid fa-futbol"></i> ' + this.escapeHtml(courtName) + '</span><span><i class="fa-solid fa-location-dot"></i> ' + this.escapeHtml(courtLocation) + '</span><span><i class="fa-regular fa-calendar"></i> ' + this.escapeHtml(tournament.startDate || 'TBA') + ' - ' + this.escapeHtml(tournament.endDate || 'TBA') + '</span></div>' +
      '<div class="user-tournament-stats"><div><small>Fee</small><strong>NPR ' + Number(tournament.fee || 0).toLocaleString() + '</strong></div><div><small>Prize</small><strong>NPR ' + Number(tournament.prize || 0).toLocaleString() + '</strong></div><div><small>Slots</small><strong>' + remainingSlots + ' left</strong></div></div>' +
      '<div class="user-tournament-footer"><small>' + participants.length + ' players joined</small><button class="btn btn-primary user-tournament-join" type="button" data-tournament-id="' + tournament.id + '" ' + joinDisabled + '>' + joinLabel + '</button></div>' +
      '</article>';
  }).join('');

  list.querySelectorAll('.user-tournament-join').forEach((button) => {
    button.addEventListener('click', () => {
      const tournament = (window.FNAdmin.state.tournaments || []).find((item) => item.id === button.dataset.tournamentId);
      if (!tournament) return;
      this.joinTournament(tournament);
    });
  });
};

window.FNUserPortal.renderMyTournaments = function() {
  const list = document.getElementById('userMyTournamentsList');
  if (!list) return;

  const user = window.FNAdminAuth.user || {};
  const userId = user.uid || (user.email ? 'email:' + user.email : 'guest');
  const joinedTournaments = (window.FNAdmin.state.tournaments || []).filter((tournament) => {
    if (!tournament.courtId) return false;
    const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
    return participants.some((participant) => ['Confirmed', 'Pending', undefined].includes(participant.registrationStatus) && ((participant.userId && participant.userId === userId) || (participant.email && participant.email === user.email)));
  });

  if (!joinedTournaments.length) {
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-list-check"></i><h3>No joined tournaments</h3><p>You have not registered for any tournament yet.</p></div>';
    return;
  }

  list.innerHTML = joinedTournaments.map((tournament) => {
    const selectedCourt = this.getTournamentCourt(tournament);
    const courtName = selectedCourt ? selectedCourt.name : (tournament.courtName || 'Selected ground unavailable');
    const courtLocation = selectedCourt
      ? [selectedCourt.address, selectedCourt.city, selectedCourt.district, selectedCourt.province].filter(Boolean).join(', ')
      : (tournament.location || 'Location unavailable');
    const participants = (Array.isArray(tournament.participants) ? tournament.participants : []).filter((participant) => !['Cancelled', 'Rejected'].includes(participant.registrationStatus));
    const currentParticipant = participants.find((participant) => (participant.userId && participant.userId === userId) || (participant.email && participant.email === user.email)) || {};
    const registrationStatus = currentParticipant.registrationStatus || 'Confirmed';
    const participantCount = participants.length;
    return '<article class="user-my-tournament-card">' +
      '<div class="user-my-tournament-header"><div><p class="eyebrow text-green">' + this.escapeHtml(registrationStatus) + '</p><h4>' + this.escapeHtml(tournament.name || 'Untitled tournament') + '</h4></div><span class="status-badge ' + String(tournament.status || 'Open').toLowerCase() + '">' + (tournament.status || 'Open') + '</span></div>' +
      '<div class="user-my-tournament-info"><span><i class="fa-solid fa-futbol"></i> ' + this.escapeHtml(courtName) + '</span><span><i class="fa-solid fa-location-dot"></i> ' + this.escapeHtml(courtLocation) + '</span><span><i class="fa-regular fa-calendar"></i> ' + this.escapeHtml(tournament.startDate || 'TBA') + ' - ' + this.escapeHtml(tournament.endDate || 'TBA') + '</span></div>' +
      '<div class="user-my-tournament-stats"><div><small>Entry</small><strong>NPR ' + Number(tournament.fee || 0).toLocaleString() + '</strong></div><div><small>Prize</small><strong>NPR ' + Number(tournament.prize || 0).toLocaleString() + '</strong></div><div><small>Players</small><strong>' + participantCount + '</strong></div></div>' +
      '<p class="user-my-tournament-description">' + this.escapeHtml(tournament.description || 'You are registered for this tournament.') + '</p>' +
      (registrationStatus === 'Pending' ? '<div class="user-my-tournament-actions"><button class="btn btn-secondary user-tournament-cancel" type="button" data-tournament-id="' + tournament.id + '"><i class="fa-solid fa-xmark"></i> Cancel registration</button></div>' : '') +
      '</article>';
  }).join('');

  list.querySelectorAll('.user-tournament-cancel').forEach((button) => {
    button.addEventListener('click', () => {
      const tournament = (window.FNAdmin.state.tournaments || []).find((item) => item.id === button.dataset.tournamentId);
      if (tournament) this.cancelTournament(tournament);
    });
  });
};

window.FNUserPortal.cancelTournament = function(tournament) {
  const user = window.FNAdminAuth.user || {};
  const userId = user.uid || (user.email ? 'email:' + user.email : 'guest');
  const participants = (Array.isArray(tournament.participants) ? tournament.participants : []).filter((participant) => !['Cancelled', 'Rejected'].includes(participant.registrationStatus));
  const participantIndex = participants.findIndex((participant) => (participant.userId && participant.userId === userId) || (participant.email && participant.email === user.email));
  if (participantIndex < 0) return;
  if (!window.confirm('Cancel your registration for "' + (tournament.name || 'this tournament') + '"?')) return;

  const updatedTournament = {
    ...tournament,
    participants: participants.filter((_, index) => index !== participantIndex)
  };
  const savePromise = window.FNAdminData.isLive() ? window.FNAdminData.save('tournaments', tournament.id, updatedTournament) : Promise.resolve(updatedTournament);
  savePromise.then(() => {
    const index = (window.FNAdmin.state.tournaments || []).findIndex((item) => item.id === tournament.id);
    if (index >= 0) window.FNAdmin.state.tournaments[index] = updatedTournament;
    this.renderTournaments();
    this.renderMyTournaments();
    window.FNAdminComponents.showToast('Tournament registration cancelled.', 'success');
  }).catch((error) => {
    console.error('Unable to cancel tournament registration:', error);
    window.FNAdminComponents.showToast('Unable to cancel this registration right now.', 'error');
  });
};

window.FNUserPortal.joinTournament = function(tournament) {
  const user = window.FNAdminAuth.user || {};
  if (!user.email) {
    window.FNAdminComponents.showToast('Please sign in to participate in a tournament.', 'error');
    return;
  }

  const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
  const userId = user.uid || ('email:' + user.email);
  const alreadyJoined = participants.some((participant) => ((participant.userId && participant.userId === userId) || (participant.email && participant.email === user.email)));
  if (alreadyJoined) {
    window.FNAdminComponents.showToast('You are already registered for this tournament.', 'success');
    return;
  }

  const remainingSlots = Math.max((Number(tournament.maxTeams || 0) || 0) - participants.length, 0);
  if (remainingSlots <= 0) {
    window.FNAdminComponents.showToast('This tournament is already full.', 'error');
    return;
  }

  const formHtml = '<div class="panel__header"><div><p class="eyebrow text-green">Tournament registration</p><h3>Join ' + this.escapeHtml(tournament.name || 'Tournament') + '</h3></div><button class="icon-button" type="button" data-close-modal="true" aria-label="Close registration"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<form id="tournamentJoinForm"><p class="muted">Enter your team information to register for this tournament.</p><div class="field-grid">' +
    '<label>Team name<input name="teamName" type="text" required placeholder="e.g. Brothers FC" /></label>' +
    '<label>Captain name<input name="captainName" type="text" required value="' + this.escapeHtml(user.name || user.email.split('@')[0]) + '" /></label>' +
    '<label>Contact number<input name="contactNumber" type="tel" required placeholder="+977-98XXXXXXXX" /></label>' +
    '<label>Squad size<input name="squadSize" type="number" min="1" max="30" required value="5" /></label>' +
    '<label style="grid-column: 1 / -1;">Team notes<textarea name="teamNotes" placeholder="Add jersey color, player names, or other details..."></textarea></label>' +
    '</div><div class="form-actions"><button type="button" class="btn btn-secondary" data-close-modal="true">Cancel</button><button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Confirm registration</button></div></form>';

  window.FNAdminComponents.openModal(formHtml);
  document.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
  const joinForm = document.getElementById('tournamentJoinForm');
  if (!joinForm) return;

  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(joinForm);
    const teamName = String(formData.get('teamName') || '').trim();
    const captainName = String(formData.get('captainName') || '').trim();
    const contactNumber = String(formData.get('contactNumber') || '').trim();
    const squadSize = Number(formData.get('squadSize') || 0);
    if (!teamName || !captainName || !contactNumber || squadSize < 1) {
      window.FNAdminComponents.showToast('Please complete your team information.', 'error');
      return;
    }

    const updatedTournament = {
      ...tournament,
      participants: [
        ...participants.filter((participant) => !((participant.userId && participant.userId === userId) || (participant.email && participant.email === user.email))),
        {
          userId,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          teamName,
          captainName,
          contactNumber,
          squadSize,
          teamNotes: String(formData.get('teamNotes') || '').trim(),
          registrationStatus: 'Pending',
          joinedAt: new Date().toISOString()
        }
      ]
    };

    const savePromise = window.FNAdminData.isLive() ? window.FNAdminData.save('tournaments', tournament.id, updatedTournament) : Promise.resolve(updatedTournament);

    savePromise.then(() => {
      const index = (window.FNAdmin.state.tournaments || []).findIndex((item) => item.id === tournament.id);
      if (index >= 0) window.FNAdmin.state.tournaments[index] = updatedTournament;
      window.FNAdminComponents.closeModal();
      this.renderTournaments();
      this.renderMyTournaments();
      window.FNAdminComponents.showToast('You joined the tournament successfully.', 'success');
    }).catch((error) => {
      console.error('Unable to join tournament:', error);
      window.FNAdminComponents.showToast('Unable to join this tournament right now.', 'error');
    });
  });
};

window.FNUserPortal.renderCourtDirectory = function(searchTerm) {
  const directory = document.getElementById('userCourtDirectory');
  const count = document.getElementById('userCourtDirectoryCount');
  if (!directory || !count) return;
  directory.dataset.view = this.courtView || 'grid';
  document.querySelectorAll('[data-court-view]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.courtView === directory.dataset.view));
  });

  const searchInput = document.getElementById('userVenueSearch');
  const query = String(searchTerm === undefined && searchInput ? searchInput.value : searchTerm || '').trim().toLowerCase();
  const locationFilter = document.getElementById('userVenueLocationFilter');
  const maxPriceFilter = document.getElementById('userVenueMaxPrice');
  const minRatingFilter = document.getElementById('userVenueMinRating');
  const typeFilter = document.getElementById('userVenueTypeFilter');
  const sortFilter = document.getElementById('userVenueSort');
  const availabilityDate = document.getElementById('userVenueAvailabilityDate');
  const availableOnly = document.getElementById('userVenueAvailableOnly');
  const state = window.FNAdmin.state || {};
  const allCourts = Array.isArray(state.courts) ? state.courts : [];
  const liveStatus = state.liveCollections && state.liveCollections.courts;
  if (!allCourts.length) {
    const message = liveStatus === false
      ? ['Court data unavailable', 'Firebase could not load the courts collection. Check this account’s Firestore read permissions and connection.']
      : liveStatus === true || window.FNAdmin.demoMode
        ? ['No court records yet', 'Court documents from Firebase will appear here when they are added.']
        : window.FNAdminData && window.FNAdminData.isLive()
          ? ['Loading live courts', 'Fetching current court listings from Firebase.']
          : ['Live courts unavailable', 'Sign in to load court documents from Firebase. Demo listings are only shown in demo mode.'];
    count.textContent = liveStatus === false ? 'Unavailable' : liveStatus === true || window.FNAdmin.demoMode ? '0 venues' : 'Loading…';
    directory.innerHTML = '<div class="empty-state user-venue-empty"><i class="fa-solid fa-futbol"></i><h3>' + this.escapeHtml(message[0]) + '</h3><p>' + this.escapeHtml(message[1]) + '</p></div>';
    return;
  }
  if (locationFilter) {
    const selectedLocation = locationFilter.value;
    const locations = Array.from(new Set(allCourts.filter((court) => court.status === 'active').map((court) => court.city).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    locationFilter.innerHTML = '<option value="">All locations</option>' + locations.map((location) => '<option value="' + this.escapeHtml(location) + '">' + this.escapeHtml(location) + '</option>').join('');
    locationFilter.value = locations.includes(selectedLocation) ? selectedLocation : '';
  }
  const location = locationFilter ? locationFilter.value.toLowerCase() : '';
  const maxPrice = maxPriceFilter ? Number(maxPriceFilter.value) : 0;
  const minRating = minRatingFilter ? Number(minRatingFilter.value) : 0;
  const type = typeFilter ? typeFilter.value.toLowerCase() : '';
  const checkAvailability = !!(availableOnly && availableOnly.checked);
  const date = availabilityDate ? availabilityDate.value : '';
  if (checkAvailability && !window.FNAdmin.demoMode && window.FNAdminData && window.FNAdminData.isLive() && state.bookingSlotsLoadedDate !== date) {
    const failed = state.bookingSlotsErrorDate === date;
    count.textContent = failed ? 'Unavailable' : 'Checking availability…';
    directory.innerHTML = '<div class="empty-state user-venue-empty" role="status"><i class="fa-solid fa-' + (failed ? 'triangle-exclamation' : 'spinner fa-spin') + '"></i><h3>' + (failed ? 'Live availability unavailable' : 'Checking live availability') + '</h3><p>' + (failed ? 'Current slot availability could not be loaded. Try changing the date or reload the page.' : 'Checking current reservations for this date…') + '</p></div>';
    return;
  }
  let courts = allCourts.filter((court) => {
    if (court.status !== 'active') return false;
    const searchableText = [court.name, court.address, court.city, court.district, court.province].filter(Boolean).join(' ').toLowerCase();
    if (query && !searchableText.includes(query)) return false;
    if (location && String(court.city || '').toLowerCase() !== location) return false;
    if (maxPrice && Number(court.pricePerHour || 0) > maxPrice) return false;
    const rating = this.getCourtAverageRating(court);
    if (minRating && rating < minRating) return false;
    if (type && String(court.type || 'Indoor').toLowerCase() !== type) return false;
    return !checkAvailability || (date && this.hasCourtAvailability(court, date));
  });
  if (sortFilter && sortFilter.value === 'price-asc') courts.sort((a, b) => Number(a.pricePerHour || 0) - Number(b.pricePerHour || 0));
  else if (sortFilter && sortFilter.value === 'price-desc') courts.sort((a, b) => Number(b.pricePerHour || 0) - Number(a.pricePerHour || 0));
  else courts.sort((a, b) => this.getCourtAverageRating(b) - this.getCourtAverageRating(a) || Number(b.bookings || 0) - Number(a.bookings || 0));
  count.textContent = courts.length + ' of ' + allCourts.filter((court) => court.status === 'active').length + ' grounds';
  directory.innerHTML = courts.length ? courts.map((court) => {
    const location = [court.address, court.city, court.district, court.province, 'Nepal'].filter(Boolean).join(', ');
    const mapLocation = [court.name, location].filter(Boolean).join(', ');
    const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapLocation);
    const mapEmbedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(mapLocation) + '&output=embed';
    const imageUrl = (court.images && court.images[0]) || 'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=640&q=80';
    const reviews = this.getCourtReviews(court.name);
    const averageRating = this.getCourtAverageRating(court);
    const ratingDisplay = averageRating ? '<span class="court-rating"><i class="fa-solid fa-star"></i> ' + averageRating.toFixed(1) + '</span><span class="court-review-count">' + reviews.length + ' review' + (reviews.length === 1 ? '' : 's') + '</span>' : '<span class="court-review-count">No reviews yet</span>';
    const courtId = this.escapeHtml(court.id);
    const courtName = this.escapeHtml(court.name || 'Futsal court');
    const bookingAction = '<button class="btn btn-primary user-court-book" data-court-id="' + courtId + '" type="button">Book now</button>';
    const amenities = [['parking', 'Parking'], ['washroom', 'Washroom'], ['changingRoom', 'Changing room'], ['shower', 'Shower'], ['lighting', 'Lights']].filter(([key]) => court[key]).map(([, label]) => '<span>' + label + '</span>').join('');
    const contact = court.contactNumber ? '<a href="tel:' + this.escapeHtml(court.contactNumber) + '"><i class="fa-solid fa-phone"></i> ' + this.escapeHtml(court.contactNumber) + '</a>' : '<span>Contact not available</span>';
    return '<article class="user-court-card"><img class="court-card-image" src="' + this.escapeHtml(imageUrl) + '" alt="' + courtName + '" loading="lazy" decoding="async" /><div class="court-card-title"><h4>' + courtName + '</h4><div class="court-rating-summary">' + ratingDisplay + '</div></div><p class="user-court-address"><i class="fa-solid fa-location-dot"></i> ' + this.escapeHtml(location) + '</p><div class="court-meta"><span class="court-price">NPR ' + Number(court.pricePerHour || 0).toLocaleString() + '/hr</span><span>' + this.escapeHtml((court.openingTime || '08:00') + ' - ' + (court.closingTime || '22:00')) + '</span></div><div class="user-court-specs"><span><strong>Type</strong>' + this.escapeHtml(court.type || 'Indoor') + '</span><span><strong>Turf</strong>' + this.escapeHtml(court.turfType || 'Artificial') + '</span></div><details class="user-court-map"><summary class="user-court-map-heading"><strong>View map</strong><span>Directions</span></summary><iframe src="' + this.escapeHtml(mapEmbedUrl) + '" title="Live map for ' + courtName + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></details><div class="user-court-contact">' + contact + '</div>' + (amenities ? '<div class="user-court-amenities">' + amenities + '</div>' : '') + (court.description ? '<p class="user-court-description">' + this.escapeHtml(court.description) + '</p>' : '') + this.renderCourtFields(court) + '<div class="court-actions">' + bookingAction + '<button class="court-reviews-link" type="button" data-court-reviews="' + courtId + '"><i class="fa-regular fa-star"></i> View reviews</button><a class="court-map-link" href="' + this.escapeHtml(mapUrl) + '" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Open ' + courtName + ' map</a></div></article>';
  }).join('') : '<div class="empty-state user-venue-empty"><i class="fa-solid fa-magnifying-glass"></i><h3>No grounds match these filters</h3><p>Try a different location, price range, rating, ground type, or date.</p><button class="btn btn-secondary user-venue-reset" type="button">Clear filters</button></div>';

  const resetButton = directory.querySelector('.user-venue-reset');
  if (resetButton) resetButton.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    [locationFilter, maxPriceFilter, minRatingFilter, typeFilter].forEach((filter) => { if (filter) filter.value = ''; });
    if (availableOnly) availableOnly.checked = false;
    this.renderCourtDirectory();
  });

  directory.querySelectorAll('.user-court-book').forEach((button) => {
    button.addEventListener('click', () => {
      this.openBookingForm(button.dataset.courtId);
    });
  });
  directory.querySelectorAll('[data-court-reviews]').forEach((button) => {
    button.addEventListener('click', () => {
      const court = window.FNAdmin.state.courts.find((item) => item.id === button.dataset.courtReviews);
      if (court) this.openCourtReviews(court);
    });
  });
};

window.FNUserPortal.getCourtAverageRating = function(court) {
  const reviews = this.getCourtReviews(court.name);
  const ratings = reviews.map((review) => Number(review.rating)).filter(Number.isFinite);
  if (ratings.length) return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  const courtRating = Number(court.rating || 0);
  return Number.isFinite(courtRating) ? courtRating : 0;
};

window.FNUserPortal.hasCourtAvailability = function(court, date) {
  const openingMinutes = this.toMinutes(court.openingTime || '06:00');
  const closingMinutes = this.toMinutes(court.closingTime || '22:00');
  const slotDuration = Number(court.slotDuration || 60);
  if (!Number.isFinite(openingMinutes) || !Number.isFinite(closingMinutes) || !Number.isFinite(slotDuration) || slotDuration <= 0 || closingMinutes <= openingMinutes) return false;
  const blockedSlots = Array.isArray(court.blockedSlots) ? court.blockedSlots : [];
  const reservations = [...(window.FNAdmin.state.bookings || []), ...(window.FNAdmin.state.bookingSlots || [])];

  for (let start = openingMinutes; start + slotDuration <= closingMinutes; start += slotDuration) {
    const startTime = this.toTime(start);
    const endTime = this.toTime(start + slotDuration);
    if (blockedSlots.includes(date + ' | ' + startTime + ' - ' + endTime)) continue;
    if (window.FNAdmin.isBookingTimeExpired({ date, startTime, endTime })) continue;
    const occupied = reservations.some((booking) => window.FNAdmin.isBookingActive(booking)
      && booking.date === date
      && ((booking.courtId && booking.courtId === court.id) || booking.court === court.name)
      && start < this.toMinutes(booking.endTime)
      && this.toMinutes(booking.startTime) < start + slotDuration);
    if (!occupied) return true;
  }
  return false;
};

window.FNUserPortal.init = function() {
  const courtSelect = document.getElementById('userBookingCourt');
  const form = document.getElementById('userBookingForm');
  const courtSearch = document.getElementById('userCourtSearch');
  const venueSearch = document.getElementById('userVenueSearch');
  const dateInput = document.getElementById('userBookingDate');
  const timeSelect = document.getElementById('userBookingTime');
  if (!courtSelect || !form || !dateInput || !timeSelect) return;

  const userMain = document.getElementById('userDashboardTop');
  const userSidebar = document.querySelector('.user-sidebar');
  const userMobileMenu = document.getElementById('userMobileMenuBtn');
  const userSidebarBackdrop = document.querySelector('.user-sidebar-backdrop');
  const setUserNavigationOpen = (isOpen) => {
    if (userSidebar) userSidebar.classList.toggle('open', isOpen);
    if (userMain) userMain.closest('.user-dashboard-shell')?.classList.toggle('user-nav-open', isOpen);
    if (userSidebarBackdrop) userSidebarBackdrop.hidden = !isOpen;
    if (userMobileMenu) {
      userMobileMenu.setAttribute('aria-expanded', String(isOpen));
      userMobileMenu.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      userMobileMenu.innerHTML = '<i class="fa-solid fa-' + (isOpen ? 'xmark' : 'bars') + '"></i>';
    }
  };
  const backToTopButton = document.getElementById('userBackToTop');
  if (backToTopButton && backToTopButton.dataset.fnInitialized !== 'true') {
    const updateBackToTopVisibility = () => backToTopButton.classList.toggle('is-visible', window.scrollY > 360);
    backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    updateBackToTopVisibility();
    backToTopButton.dataset.fnInitialized = 'true';
  }
  if (userMobileMenu && userSidebar && userMobileMenu.dataset.fnInitialized !== 'true') {
    userMobileMenu.addEventListener('click', () => {
      setUserNavigationOpen(!userSidebar.classList.contains('open'));
    });
    userMobileMenu.dataset.fnInitialized = 'true';
  }
  if (userSidebarBackdrop && userSidebarBackdrop.dataset.fnInitialized !== 'true') {
    userSidebarBackdrop.addEventListener('click', () => setUserNavigationOpen(false));
    userSidebarBackdrop.dataset.fnInitialized = 'true';
  }
  if (userSidebar && userSidebar.dataset.fnEscapeInitialized !== 'true') {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && userSidebar.classList.contains('open')) setUserNavigationOpen(false);
    });
    userSidebar.dataset.fnEscapeInitialized = 'true';
  }
  const userNotificationsPanel = document.getElementById('userNotificationsPanel');
  const userHero = userMain && userMain.querySelector('.portal-hero');
  if (userMain && userNotificationsPanel && userHero) userMain.insertBefore(userNotificationsPanel, userHero.nextSibling);

  if (venueSearch && venueSearch.dataset.fnInitialized !== 'true') {
    venueSearch.addEventListener('input', () => this.renderCourtDirectory(venueSearch.value));
    venueSearch.dataset.fnInitialized = 'true';
  }
  document.querySelectorAll('[data-court-view]').forEach((button) => {
    if (button.dataset.fnInitialized === 'true') return;
    button.addEventListener('click', () => {
      this.courtView = button.dataset.courtView === 'list' ? 'list' : 'grid';
      this.renderCourtDirectory();
    });
    button.dataset.fnInitialized = 'true';
  });

  const profileForm = document.getElementById('userProfileForm');
  const profileEditButton = document.getElementById('userProfileEditBtn');
  if (profileEditButton && profileForm && profileEditButton.dataset.fnInitialized !== 'true') {
    profileEditButton.addEventListener('click', () => {
      const isEditing = profileForm.classList.toggle('hidden');
      profileEditButton.setAttribute('aria-label', isEditing ? 'Edit profile' : 'Close profile editor');
      profileEditButton.setAttribute('title', isEditing ? 'Edit profile' : 'Close profile editor');
      profileEditButton.innerHTML = '<i class="fa-solid fa-' + (isEditing ? 'pen' : 'xmark') + '"></i>';
    });
    profileEditButton.dataset.fnInitialized = 'true';
  }
  if (profileForm && profileForm.dataset.fnInitialized !== 'true') {
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const user = window.FNAdminAuth.user;
      if (!user || !user.uid) {
        window.FNAdminComponents.showToast('Please sign in again to update your profile.', 'error');
        return;
      }
      const data = new FormData(profileForm);
      const existingProfile = (window.FNAdmin.state.users || []).find((item) => item.id === user.uid || item.email === user.email) || user;
      const profile = { id: user.uid, name: data.get('name').trim(), email: user.email || '', role: user.role || 'User', updatedAt: new Date().toISOString() };
      const save = window.FNAdminData.isLive()
        ? window.FNAdminData.save('users', user.uid, profile)
        : Promise.resolve();
      save.then(() => {
        window.FNAdminAuth.user.name = profile.name;
        window.FNAdmin.state.users = [
          ...(window.FNAdmin.state.users || []).filter((item) => item.id !== user.uid),
          { ...existingProfile, ...profile }
        ];
        profileForm.dataset.profilePopulated = 'true';
        profileForm.classList.add('hidden');
        if (profileEditButton) {
          profileEditButton.setAttribute('aria-label', 'Edit profile');
          profileEditButton.setAttribute('title', 'Edit profile');
          profileEditButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
        }
        this.updateDashboard();
        window.FNAdminComponents.showToast('Profile updated successfully.', 'success');
      }).catch((error) => {
        console.error('Unable to update profile:', error);
        window.FNAdminComponents.showToast('Profile could not be updated: ' + (error.message || 'permission denied.'), 'error');
      });
    });
    profileForm.dataset.fnInitialized = 'true';
  }

  const findCourtButton = document.getElementById('findCourtBtn');
  const userViews = {
    dashboard: { title: 'Dashboard', sections: ['userProfilePanel', 'userDashboardBanner', 'user-grid', 'userUpcomingMatchPanel'] },
    profile: { title: 'Profile', sections: ['userProfilePanel'] },
    bookings: { title: 'My bookings', sections: ['user-booking-layout', 'userBookingsPanel'] },
    bookingForm: { title: 'Book a futsal', sections: ['user-booking-layout'] },
    courts: { title: 'Find a futsal', sections: ['userCourtsPanel'] },
    teams: { title: 'Teams', sections: ['userTeamsPanel'] },
    notifications: { title: 'Notifications', sections: ['userNotificationsPanel'] },
    tournaments: { title: 'Tournaments', sections: ['userTournamentsPanel'] },
    myTournaments: { title: 'My tournaments', sections: ['userMyTournamentsPanel'] }
  };
  const viewByTarget = {
    userDashboardBanner: 'dashboard',
    'user-grid': 'dashboard',
    userUpcomingMatchPanel: 'dashboard',
    userProfilePanel: 'profile',
    userBookingPanel: 'bookings',
    userBookingsPanel: 'bookings',
    userCourtsPanel: 'courts',
    userTeamsPanel: 'teams',
    userNotificationsPanel: 'notifications',
    userTournamentsPanel: 'tournaments',
    userMyTournamentsPanel: 'myTournaments'
  };
  const setUserView = function(viewName) {
    viewName = userViews[viewName] ? viewName : 'dashboard';
    const view = userViews[viewName];
    this.currentView = viewName;
    const sectionIds = ['userProfilePanel', 'userDashboardBanner', 'user-grid', 'userUpcomingMatchPanel', 'user-booking-layout', 'userBookingsPanel', 'userCourtsPanel', 'userTeamsPanel', 'userNotificationsPanel', 'userTournamentsPanel', 'userMyTournamentsPanel'];
    sectionIds.forEach((sectionId) => {
      const section = sectionId === 'user-grid' || sectionId === 'user-booking-layout'
        ? document.querySelector('#userSection .' + sectionId)
        : document.getElementById(sectionId);
      if (section) section.classList.toggle('hidden', !view.sections.includes(sectionId));
    });
    const bookingPanel = document.getElementById('userBookingPanel');
    const bookingsPanel = document.getElementById('userBookingsPanel');
    if (bookingPanel) bookingPanel.classList.toggle('hidden', viewName !== 'bookingForm');
    if (bookingsPanel) bookingsPanel.classList.toggle('hidden', viewName !== 'bookings');
    const pageTitle = document.getElementById('userCurrentPageTitle');
    if (pageTitle) pageTitle.textContent = view.title;
    document.querySelectorAll('[data-user-scroll]').forEach((item) => {
      item.classList.toggle('active', viewByTarget[item.dataset.userScroll] === viewName);
    });
    setUserNavigationOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  this.setView = setUserView;
  this.openBookingForm = (courtId) => {
    setUserView('bookingForm');
    const courtSelect = document.getElementById('userBookingCourt');
    if (courtSelect && courtId) courtSelect.value = courtId;
    this.updateTimeSlots();
    this.updateAmount();
    const bookingForm = document.getElementById('userBookingForm');
    if (bookingForm) bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if (findCourtButton && findCourtButton.dataset.fnInitialized !== 'true') {
    findCourtButton.addEventListener('click', () => setUserView('courts'));
    findCourtButton.dataset.fnInitialized = 'true';
  }
  const viewBookingsButton = document.getElementById('viewBookingsBtn');
  if (viewBookingsButton && viewBookingsButton.dataset.fnInitialized !== 'true') {
    viewBookingsButton.addEventListener('click', () => setUserView('bookings'));
    viewBookingsButton.dataset.fnInitialized = 'true';
  }
  const userSection = document.getElementById('userSection');
  if (userSection && userSection.dataset.navigationInitialized !== 'true') {
    userSection.addEventListener('click', (event) => {
      const button = event.target.closest('[data-user-scroll]');
      if (button) setUserView(viewByTarget[button.dataset.userScroll] || 'dashboard');
    });
    userSection.dataset.navigationInitialized = 'true';
  }
  const initialView = this.pendingBooking
    ? 'bookingForm'
    : (courtSelect.dataset.fnInitialized === 'true' ? this.currentView || 'dashboard' : 'dashboard');
  this.pendingBooking = false;
  setUserView(initialView);
  document.querySelectorAll('[data-user-action="close-nav"]').forEach((button) => {
    if (button.dataset.fnInitialized === 'true') return;
    button.addEventListener('click', () => {
      setUserNavigationOpen(false);
    });
    button.dataset.fnInitialized = 'true';
  });
  const userNavSelect = document.getElementById('userNavSelect');
  if (userNavSelect && userNavSelect.dataset.fnInitialized !== 'true') {
    userNavSelect.addEventListener('change', () => {
      setUserView(viewByTarget[userNavSelect.value] || 'dashboard');
    });
    userNavSelect.dataset.fnInitialized = 'true';
  }

  courtSelect.innerHTML = '';
  window.FNAdmin.state.courts.filter((court) => court.status === 'active').forEach((court) => {
    const option = document.createElement('option');
    option.value = court.id;
    option.textContent = court.name + ' - NPR ' + Number(court.pricePerHour).toLocaleString() + '/hour';
    courtSelect.appendChild(option);
  });

  const today = window.FNAdmin.getNepalDateTime().date;
  dateInput.min = today;
  if (!dateInput.value || dateInput.value < today) dateInput.value = today;
  const venueAvailabilityDate = document.getElementById('userVenueAvailabilityDate');
  const availabilityCheckbox = document.getElementById('userVenueAvailableOnly');
  if (venueAvailabilityDate) {
    venueAvailabilityDate.min = today;
    if (!venueAvailabilityDate.value || venueAvailabilityDate.value < today) venueAvailabilityDate.value = today;
  }
  const pendingFilters = this.pendingSearchFilters;
  if (pendingFilters) {
    if (venueSearch) venueSearch.value = pendingFilters.search || '';
    const pendingBudget = document.getElementById('userVenueMaxPrice');
    const pendingType = document.getElementById('userVenueTypeFilter');
    if (pendingBudget) pendingBudget.value = pendingFilters.maxPrice || '';
    if (pendingType) pendingType.value = pendingFilters.type || '';
    this.pendingSearchFilters = null;
  }

  if (courtSelect.dataset.fnInitialized === 'true') {
    this.subscribeToSelectedSlot();
    this.updateTimeSlots();
    this.updateAmount();
    this.updateDashboard();
    this.renderNotifications();
    this.renderCourtDirectory();
    this.renderTeams();
    this.renderTournaments();
    this.renderMyTournaments();
    return;
  }

  this.subscribeToSelectedSlot();
  this.updateTimeSlots();
  courtSelect.addEventListener('change', () => {
    this.subscribeToSelectedSlot();
    this.updateTimeSlots();
    this.updateAmount();
  });
  dateInput.addEventListener('change', () => {
    this.subscribeToSelectedSlot();
    this.updateTimeSlots();
    this.updateAmount();
  });
  if (!this.bookingExpiryTimer) {
    this.bookingExpiryTimer = window.setInterval(() => {
      if (window.FNAdminAuth.getRole() !== 'User') return;
      const nepalToday = window.FNAdmin.getNepalDateTime().date;
      dateInput.min = nepalToday;
      if (dateInput.value < nepalToday) {
        dateInput.value = nepalToday;
        this.subscribeToSelectedSlot();
      }
      this.updateTimeSlots();
      this.updateAmount();
    }, 30000);
  }
  timeSelect.addEventListener('change', () => this.updateAmount());
  courtSearch.addEventListener('input', () => {
    const query = courtSearch.value.trim().toLowerCase();
    const currentCourt = courtSelect.value;
    courtSelect.innerHTML = '';
    window.FNAdmin.state.courts.filter((court) => court.status === 'active' && court.name.toLowerCase().includes(query)).forEach((court) => {
      const option = document.createElement('option');
      option.value = court.id;
      option.textContent = court.name + ' - NPR ' + Number(court.pricePerHour).toLocaleString() + '/hour';
      option.selected = court.id === currentCourt;
      courtSelect.appendChild(option);
    });
    if (!courtSelect.value && courtSelect.options.length) courtSelect.selectedIndex = 0;
    this.subscribeToSelectedSlot();
    this.updateTimeSlots();
    this.updateAmount();
  });
  [
    'userVenueLocationFilter',
    'userVenueMaxPrice',
    'userVenueMinRating',
    'userVenueTypeFilter',
    'userVenueSort'
  ].forEach((id) => {
    const filter = document.getElementById(id);
    if (filter) filter.addEventListener('change', () => this.renderCourtDirectory());
  });
  if (venueAvailabilityDate) {
    venueAvailabilityDate.addEventListener('change', () => {
      const date = venueAvailabilityDate.value;
      if (availabilityCheckbox && availabilityCheckbox.checked && date) window.FNAdmin.subscribeToBookingSlots('', date);
      this.renderCourtDirectory();
    });
  }
  if (availabilityCheckbox) availabilityCheckbox.addEventListener('change', () => {
    if (availabilityCheckbox.checked && venueAvailabilityDate && venueAvailabilityDate.value) {
      window.FNAdmin.subscribeToBookingSlots('', venueAvailabilityDate.value);
    }
    this.renderCourtDirectory();
  });
  this.updateAmount();
  this.renderCourtDirectory();
  this.renderTeams();
  this.renderTournaments();
  this.renderMyTournaments();
  this.renderNotifications();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const user = window.FNAdminAuth.user;
    const court = window.FNAdmin.state.courts.find((item) => item.id === courtSelect.value);
    const submitButton = form.querySelector('button[type="submit"]');
    if (!user || !court || !timeSelect.value) {
      window.FNAdminComponents.showToast('Select a court and time slot before confirming.', 'error');
      return;
    }

    const date = dateInput.value;
    const timeSlot = timeSelect.value.split('|');
    const startTime = timeSlot[0];
    const endTime = timeSlot[1];
    const firebaseUser = !window.FNAdmin.demoMode && window.firebase && firebase.apps && firebase.apps.length && firebase.auth ? firebase.auth().currentUser : null;
    const userId = (firebaseUser && firebaseUser.uid) || user.uid;
    if (!userId) {
      window.FNAdminComponents.showToast('Your Firebase login session has expired. Please log in again.', 'error');
      return;
    }
    const rescheduleId = form.dataset.rescheduleBookingId;
    const bookingId = 'BK-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const newBooking = {
      id: bookingId,
      courtId: court.id,
      userId,
      user: user.name,
      userEmail: user.email,
      phone: document.getElementById('userBookingPhone').value.trim(),
      court: court.name,
      date,
      startTime,
      endTime,
      duration: this.toMinutes(endTime) - this.toMinutes(startTime),
      amount: Math.round(Number(court.pricePerHour || 0) * (this.toMinutes(endTime) - this.toMinutes(startTime)) / 60),
      paymentMethod: document.getElementById('userBookingPayment').value,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending',
      expiresAt: Date.now() + (10 * 60 * 1000),
      createdAt: window.FNAdmin.getNepalDateTime().date
    };
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving booking...';
    }
    if (rescheduleId && window.FNAdmin.hasBookingConflict(newBooking, rescheduleId)) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Confirm booking';
      }
      window.FNAdminComponents.showToast('That new time is already pending or booked. Choose another slot.', 'error');
      return;
    }
    Promise.resolve().then(() => {
      if (!rescheduleId) return;
      const previousBooking = window.FNAdmin.state.bookings.find((item) => item.id === rescheduleId);
      if (!previousBooking) return;
      window.FNAdmin.setBookingStatus(previousBooking, 'Cancelled');
      return window.FNAdmin.syncBookings(previousBooking);
    }).then(() => window.FNAdmin.createBooking(newBooking)).then(() => {
      delete form.dataset.rescheduleBookingId;
      this.renderBookings();
      if (rescheduleId) window.FNAdmin.createBookingNotification(newBooking, 'Booking rescheduled', 'Booking ID ' + newBooking.id + ' is pending for ' + newBooking.court + ' on ' + this.formatDate(newBooking.date) + ', ' + this.toTimeLabel(newBooking.startTime) + ' - ' + this.toTimeLabel(newBooking.endTime) + '.');
      window.FNAdminComponents.showToast(rescheduleId ? 'Booking rescheduled successfully.' : 'Booking request submitted. The venue will confirm it shortly.', 'success');
      form.reset();
      dateInput.min = window.FNAdmin.getNepalDateTime().date;
      dateInput.value = dateInput.min;
      courtSelect.value = court.id;
      this.updateTimeSlots();
      this.updateAmount();
    }).catch((error) => {
      console.error('Unable to create booking:', error);
      const message = error && error.code === 'already-booked'
        ? 'This time slot is ' + (error.slotStatus === 'Pending' ? 'temporarily held' : 'already booked') + '. Please choose another time.'
        : error && error.code === 'permission-denied'
        ? 'Permission denied. Deploy firebase/firestore.rules and make sure the signed-in user is authenticated.'
        : error && error.code === 'resource-exhausted'
        ? 'Booking could not be saved because the Firebase Firestore quota is exhausted. Check Firebase usage/billing and try again after the quota resets.'
        : error && error.code
          ? '(' + error.code + ') ' + (error.message || 'Booking could not be saved.')
          : (error.message || 'Booking could not be saved.');
      window.FNAdminComponents.showToast(message, 'error');
    }).finally(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Confirm booking';
      }
    });
  });

  courtSelect.dataset.fnInitialized = 'true';
  this.renderBookings();
};

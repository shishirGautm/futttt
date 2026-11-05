window.FNOwnerPortal = window.FNOwnerPortal || {};

window.FNOwnerPortal.getCourts = function() {
  const owner = window.FNAdminAuth.user;
  return owner ? window.FNAdmin.state.courts.filter((court) => court.ownerId === owner.uid || court.owner === owner.name) : [];
};

window.FNOwnerPortal.renderNotifications = function() {
  const list = document.getElementById('ownerNotificationsList');
  if (!list) return;
  const expiryLimit = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const notifications = window.FNAdmin.getNotificationsForRole('Owner').filter((item) => new Date(item.date || item.createdAt || 0).getTime() >= expiryLimit);
  const unreadCount = notifications.filter((item) => item.isRead !== true).length;
  const notificationMarkup = notifications.length ? notifications.map((item) => '<article class="user-notification' + (item.isRead === true ? '' : ' notification-unread') + '"><div class="notification-item-heading"><strong>' + window.FNUserPortal.escapeHtml(item.title) + '</strong><span>' + (item.isRead === true ? '' : '<button class="notification-read-button" type="button" data-read-owner-notification="' + item.id + '" title="Mark as read">Mark read</button>') + '<button class="notification-delete-button" type="button" data-owner-notification-delete="' + item.id + '" title="Delete notification" aria-label="Delete notification"><i class="fa-solid fa-trash"></i></button></span></div><p>' + window.FNUserPortal.escapeHtml(item.message) + '</p><small>' + new Date(item.date || item.createdAt).toLocaleString() + '</small></article>').join('') : '<p class="muted">No new notifications.</p>';
  list.innerHTML = notificationMarkup;
  list.querySelectorAll('[data-owner-notification-delete]').forEach((button) => button.addEventListener('click', () => window.FNAdmin.deleteNotification(button.dataset.ownerNotificationDelete, () => this.renderNotifications())));
  list.querySelectorAll('[data-read-owner-notification]').forEach((button) => button.addEventListener('click', () => this.markNotificationRead(button.dataset.readOwnerNotification)));
  const preview = document.getElementById('ownerNotificationPreview');
  const summary = document.getElementById('ownerNotificationSummary');
  if (preview) preview.innerHTML = notifications.length ? notifications.slice().sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 5).map((item) => '<article class="owner-notification-preview-item' + (item.isRead === true ? '' : ' notification-unread') + '"><strong>' + window.FNUserPortal.escapeHtml(item.title) + '</strong><p>' + window.FNUserPortal.escapeHtml(item.message) + '</p><small>' + new Date(item.date || item.createdAt).toLocaleString() + '</small></article>').join('') : '<p class="owner-notification-empty">No notifications yet.</p>';
  if (summary) summary.textContent = unreadCount + ' unread';
  const badge = document.getElementById('ownerNotificationsCount');
  if (badge) badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
  this.bindNotificationReadButtons();
  window.FNAdmin.cleanupExpiredNotifications().catch((error) => console.error('Unable to remove expired notifications:', error));
};

window.FNOwnerPortal.markNotificationRead = function(notificationId) {
  const notification = (window.FNAdmin.state.notifications || []).find((item) => item.id === notificationId);
  return window.FNAdmin.markNotificationRead(notification).then(() => this.renderNotifications()).catch((error) => window.FNAdminComponents.showToast('Notification could not be updated: ' + error.message, 'error'));
};

window.FNOwnerPortal.markAllNotificationsRead = function() {
  return window.FNAdmin.markAllNotificationsRead(window.FNAdmin.getNotificationsForRole('Owner')).then(() => this.renderNotifications()).catch((error) => window.FNAdminComponents.showToast('Notifications could not be updated: ' + error.message, 'error'));
};

window.FNOwnerPortal.bindNotificationReadButtons = function() {
  const markAll = (id) => {
    const button = document.getElementById(id);
    if (button && button.dataset.readBound !== 'true') {
      button.dataset.readBound = 'true';
      button.addEventListener('click', () => this.markAllNotificationsRead());
    }
  };
  markAll('markOwnerNotificationsReadBtn');
  markAll('markOwnerAllReadBtn');
};

window.FNOwnerPortal.renderProfile = function(courts) {
  const identity = document.getElementById('ownerProfileIdentity');
  const details = document.getElementById('ownerProfileDetails');
  const heroProfile = document.getElementById('ownerHeroProfile');
  const owner = window.FNAdminAuth.user || {};
  if (!details && !heroProfile) return;
  const ownerName = owner.name || 'Court owner';
  const escapedOwnerName = window.FNUserPortal.escapeHtml(ownerName);
  if (identity) identity.innerHTML = '<strong>' + escapedOwnerName + '</strong>';
  if (details) details.innerHTML = '<div><span>Name</span><strong>' + escapedOwnerName + '</strong></div>';
  const heroName = document.getElementById('ownerHeroName');
  const displayName = document.getElementById('ownerDisplayName');
  if (heroName) heroName.textContent = ownerName;
  if (displayName) displayName.textContent = ownerName;
  if (heroProfile) heroProfile.innerHTML = '<div class="portal-hero__profile-details"><strong>' + escapedOwnerName + '</strong></div>';
  const form = document.getElementById('ownerProfileForm');
  if (form && form.dataset.profilePopulated !== 'true') {
    form.elements.name.value = owner.name || '';
    form.dataset.profilePopulated = 'true';
  }
};

window.FNOwnerPortal.initProfileForm = function() {
  const form = document.getElementById('ownerProfileForm');
  const editButton = document.getElementById('ownerProfileEditBtn');
  if (!form || form.dataset.fnInitialized === 'true') return;
  if (editButton) editButton.addEventListener('click', () => {
    const isHidden = form.classList.toggle('hidden');
    editButton.innerHTML = '<i class="fa-solid fa-' + (isHidden ? 'pen' : 'xmark') + '"></i>';
    editButton.setAttribute('aria-label', isHidden ? 'Edit profile' : 'Close profile editor');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const owner = window.FNAdminAuth.user;
    if (!owner) return;
    const data = new FormData(form);
    const profile = { id: owner.uid || 'demo-owner', name: data.get('name').trim(), email: owner.email || '', role: 'Owner', updatedAt: new Date().toISOString() };
    const save = window.FNAdminData.isLive() && owner.uid ? window.FNAdminData.save('users', owner.uid, profile) : Promise.resolve();
    save.then(() => {
      Object.assign(owner, profile);
      form.dataset.profilePopulated = 'true';
      form.classList.add('hidden');
      this.renderProfile(this.getCourts());
      window.FNAdminComponents.showToast('Profile updated successfully.', 'success');
    }).catch((error) => window.FNAdminComponents.showToast(error.message || 'Profile could not be updated.', 'error'));
  });
  form.dataset.fnInitialized = 'true';
};

window.FNOwnerPortal.getBookings = function(courts) {
  const courtIds = courts.map((court) => court.id);
  const courtNames = courts.map((court) => court.name);
  return (window.FNAdmin.state.bookings || []).filter((booking) => courtIds.includes(booking.courtId) || courtNames.includes(booking.court));
};

window.FNOwnerPortal.renderHeaderActions = function(bookings) {
  const pendingCount = bookings.filter((booking) => String(booking.bookingStatus || '').toLowerCase() === 'pending').length;
  const notifications = window.FNAdmin.getNotificationsForRole('Owner');
  const bookingCount = document.getElementById('ownerBookingRequestsCount');
  const notificationCount = document.getElementById('ownerNotificationsCount');
  if (bookingCount) bookingCount.textContent = pendingCount > 99 ? '99+' : String(pendingCount);
  const unreadCount = notifications.filter((item) => item.isRead !== true).length;
  if (notificationCount) notificationCount.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
};

window.FNOwnerPortal.initHeaderActions = function() {
  const ownerSection = document.getElementById('ownerSection');
  const views = {
    overview: { title: 'Overview', sections: ['ownerProfilePanel', 'ownerDashboardSummary', 'ownerPeriodPanel', 'ownerCourtPanel', 'ownerReservationsPanel', 'ownerNotificationsPanel'] },
    courts: { title: 'Courts', sections: ['ownerCourtPanel'] },
    bookings: { title: 'Bookings', sections: ['ownerReservationsPanel'] },
    updates: { title: 'Updates', sections: ['ownerNotificationsPanel'] }
  };
  const setOwnerView = (viewName) => {
    const activeView = views[viewName] ? viewName : 'overview';
    const view = views[activeView];
    this.currentView = activeView;
    ['ownerProfilePanel', 'ownerDashboardSummary', 'ownerPeriodPanel', 'ownerCourtPanel', 'ownerReservationsPanel', 'ownerNotificationsPanel'].forEach((sectionId) => {
      const section = sectionId === 'ownerPeriodPanel'
        ? ownerSection && ownerSection.querySelector('.owner-period-panel')
        : document.getElementById(sectionId);
      if (section) section.classList.toggle('hidden', !view.sections.includes(sectionId));
    });
    const title = document.getElementById('ownerCurrentViewTitle');
    if (title) title.textContent = view.title;
    if (ownerSection) {
      ownerSection.querySelectorAll('[data-owner-view]').forEach((button) => {
        const isActive = button.dataset.ownerView === activeView;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  this.setView = setOwnerView;
  if (ownerSection && ownerSection.dataset.navigationBound !== 'true') {
    ownerSection.dataset.navigationBound = 'true';
    ownerSection.addEventListener('click', (event) => {
      const button = event.target.closest('[data-owner-view]');
      if (button) setOwnerView(button.dataset.ownerView);
    });
  }
  if (!this.currentView) setOwnerView('overview');
  const actions = [
    ['ownerBookingRequestsBtn', 'bookings'],
    ['ownerHeroBookingsBtn', 'bookings'],
    ['ownerHeroProfileBtn', 'overview']
  ];
  actions.forEach(([buttonId, targetId]) => {
    const button = document.getElementById(buttonId);
    if (!button || button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => setOwnerView(targetId));
  });
  const notificationButton = document.getElementById('ownerNotificationsBtn');
  const notificationDropdown = document.getElementById('ownerNotificationDropdown');
  const viewAll = document.getElementById('viewOwnerNotificationsBtn');
  if (notificationButton && notificationDropdown && notificationButton.dataset.dropdownBound !== 'true') {
    notificationButton.dataset.dropdownBound = 'true';
    notificationButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (this.currentView !== 'updates') setOwnerView('updates');
      const isHidden = notificationDropdown.classList.toggle('is-hidden');
      notificationButton.setAttribute('aria-expanded', String(!isHidden));
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.owner-notification-menu')) {
        notificationDropdown.classList.add('is-hidden');
        notificationButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
  if (viewAll && viewAll.dataset.bound !== 'true') {
    viewAll.dataset.bound = 'true';
    viewAll.addEventListener('click', () => setOwnerView('updates'));
  }
  const markAll = document.getElementById('markOwnerNotificationsReadBtn');
  if (markAll && markAll.dataset.readBound !== 'true') {
    markAll.dataset.readBound = 'true';
    markAll.addEventListener('click', () => this.markAllNotificationsRead());
  }
  const markPanel = document.getElementById('markOwnerAllReadBtn');
  if (markPanel && markPanel.dataset.readBound !== 'true') {
    markPanel.dataset.readBound = 'true';
    markPanel.addEventListener('click', () => this.markAllNotificationsRead());
  }
};

window.FNOwnerPortal.renderSummary = function(courts, bookings) {
  const holder = document.getElementById('ownerDashboardSummary');
  if (!holder) return;
  const today = new Date().toISOString().slice(0, 10);
  const active = (booking) => !['cancelled', 'rejected'].includes(String(booking.bookingStatus || '').toLowerCase());
  const todayBookings = bookings.filter((booking) => booking.date === today && active(booking));
  const upcoming = bookings.filter((booking) => booking.date >= today && active(booking));
  const revenue = todayBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
  const blockedToday = courts.reduce((sum, court) => sum + (court.blockedSlots || []).filter((slot) => slot.indexOf(today + ' | ') === 0).length, 0);
  const totalSlots = courts.reduce((sum, court) => {
    const start = Number(String(court.openingTime || '08:00').split(':')[0]) * 60 + Number(String(court.openingTime || '08:00').split(':')[1] || 0);
    const end = Number(String(court.closingTime || '22:00').split(':')[0]) * 60 + Number(String(court.closingTime || '22:00').split(':')[1] || 0);
    return sum + Math.max(0, Math.floor((end - start) / Number(court.slotDuration || 90)));
  }, 0);
  const stats = [
    ['Today\'s bookings', todayBookings.length.toLocaleString(), 'fa-regular fa-calendar-check'],
    ['Today\'s revenue', 'NPR ' + revenue.toLocaleString(), 'fa-solid fa-wallet'],
    ['Available slots', Math.max(0, totalSlots - todayBookings.length - blockedToday).toLocaleString(), 'fa-regular fa-clock'],
    ['Upcoming bookings', upcoming.length.toLocaleString(), 'fa-solid fa-arrow-trend-up']
  ];
  holder.innerHTML = stats.map((stat) => '<article class="owner-summary-card"><i class="' + stat[2] + '"></i><span>' + stat[0] + '</span><strong>' + stat[1] + '</strong></article>').join('');
  const periodHolder = document.getElementById('ownerPeriodStats');
  if (periodHolder) {
    const now = new Date(today + 'T00:00:00');
    const countInPeriod = (days) => bookings.filter((booking) => {
      const date = new Date(String(booking.date || '') + 'T00:00:00');
      return active(booking) && !Number.isNaN(date.valueOf()) && date >= new Date(now.valueOf() - (days - 1) * 86400000) && date <= now;
    }).length;
    periodHolder.innerHTML = [['Daily', 1], ['Weekly', 7], ['Monthly', 30]].map((period) => '<div><span>' + period[0] + '</span><strong>' + countInPeriod(period[1]).toLocaleString() + '</strong><small>bookings</small></div>').join('');
  }
};

window.FNOwnerPortal.render = function() {
  const ownerGreeting = document.getElementById('ownerGreetingText');
  if (ownerGreeting) ownerGreeting.textContent = window.FNAdminComponents.getTimeGreeting();

  const panel = document.getElementById('ownerCourtPanel');
  const bookingsList = document.getElementById('ownerBookingsList');
  if (!panel || !bookingsList) return;
  const ownerSection = document.getElementById('ownerSection');
  const ownerReservationsPanel = document.getElementById('ownerReservationsPanel');
  const ownerNotificationsPanel = ownerSection && ownerSection.querySelector('.user-notifications-panel');
  if (ownerSection && panel && ownerReservationsPanel) {
    ownerSection.insertBefore(ownerReservationsPanel, panel.nextSibling);
    if (ownerNotificationsPanel) {
      const ownerNavigation = ownerSection.querySelector('.owner-mobile-bottom-nav');
      if (ownerNavigation) ownerSection.insertBefore(ownerNotificationsPanel, ownerNavigation);
      else ownerSection.appendChild(ownerNotificationsPanel);
    }
  }
  this.renderNotifications();
  this.initProfileForm();

  const courts = this.getCourts();
  const bookings = this.getBookings(courts);
  this.renderHeaderActions(bookings);
  this.initHeaderActions();
  this.renderProfile(courts);
  this.renderSummary(courts, bookings);
  if (!courts.length) {
    panel.innerHTML = '<section class="user-panel"><div class="empty-state"><i class="fa-solid fa-futbol"></i><h3>No courts assigned</h3><p>Ask an administrator to assign a court to your owner account.</p></div></section>';
    bookingsList.innerHTML = '<p class="muted">No bookings available.</p>';
    return;
  }

  panel.innerHTML = courts.map((court) => {
    const location = [court.address, court.city, court.district, court.province, 'Nepal'].filter(Boolean).join(', ');
    const mapLocation = [court.name, location].filter(Boolean).join(', ');
    const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapLocation);
    const mapEmbedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(mapLocation) + '&output=embed';
    const courtImage = (court.images && court.images[0]) || 'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=900&q=80';
    return '<article class="owner-court-card"><button class="court-image-button" type="button" data-court-image="' + courtImage + '" data-court-name="' + court.name + '" aria-label="View ' + court.name + ' image"><img class="court-card-image" src="' + courtImage + '" alt="' + court.name + '" /><span><i class="fa-solid fa-expand"></i> View image</span></button><h3>' + court.name + '</h3><p>' + location + '</p><div class="owner-court-map"><div class="owner-court-map-heading"><strong>' + court.name + '</strong><span>Live location</span></div><iframe src="' + mapEmbedUrl + '" title="Live map for ' + court.name + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><a href="' + mapUrl + '" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Open ' + court.name + ' map</a></div><form class="owner-court-form" data-court-id="' + court.id + '"><label>Futsal name<input name="name" value="' + (court.name || '') + '" required /></label><label>Futsal photo<input name="photo" type="file" accept="image/*" /></label><label>Address<input name="address" value="' + (court.address || '') + '" required /></label><label>City<input name="city" value="' + (court.city || '') + '" required /></label><label>District<input name="district" value="' + (court.district || '') + '" /></label><label>Province<input name="province" value="' + (court.province || '') + '" /></label><label>Contact number<input name="contactNumber" value="' + (court.contactNumber || '') + '" /></label><label>Price per hour<input name="pricePerHour" type="number" min="0" value="' + court.pricePerHour + '" required /></label><label>Slot duration (minutes)<input name="slotDuration" type="number" min="30" step="30" value="' + (court.slotDuration || 60) + '" required /></label><label>Blocked slots<input name="blockedSlots" type="text" value="' + (court.blockedSlots || []).join(', ') + '" placeholder="YYYY-MM-DD | HH:MM - HH:MM" /><small>Separate blocked slots with commas.</small></label><label>Court type<select name="type"><option value="Indoor" ' + (court.type === 'Indoor' ? 'selected' : '') + '>Indoor</option><option value="Outdoor" ' + (court.type === 'Outdoor' ? 'selected' : '') + '>Outdoor</option></select></label><label>Turf type<select name="turfType"><option value="Artificial" ' + (court.turfType === 'Artificial' ? 'selected' : '') + '>Artificial</option><option value="Synthetic" ' + (court.turfType === 'Synthetic' ? 'selected' : '') + '>Synthetic</option><option value="Hybrid" ' + (court.turfType === 'Hybrid' ? 'selected' : '') + '>Hybrid</option></select></label><label>Availability<select name="status"><option value="active" ' + (court.status === 'active' ? 'selected' : '') + '>Available</option><option value="inactive" ' + (court.status === 'inactive' ? 'selected' : '') + '>Unavailable</option></select></label><label>Opening time<input name="openingTime" type="time" value="' + (court.openingTime || '08:00') + '" required /></label><label>Closing time<input name="closingTime" type="time" value="' + (court.closingTime || '22:00') + '" required /></label><label class="owner-field-wide">Description<textarea name="description" rows="3">' + (court.description || '') + '</textarea></label><button class="btn btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Save court settings</button></form></article>';
  }).join('');

  panel.querySelectorAll('[data-court-image]').forEach((button) => button.addEventListener('click', () => {
    const imageUrl = button.dataset.courtImage;
    const courtName = button.dataset.courtName || 'Futsal court';
    window.FNAdminComponents.openModal('<div class="panel__header"><div><p class="eyebrow text-green">Court image</p><h3>' + courtName + '</h3></div><button class="icon-button" data-close-modal="true" aria-label="Close image preview"><i class="fa-solid fa-xmark"></i></button></div><div class="court-image-preview"><img src="' + imageUrl + '" alt="' + courtName + '" /></div>');
    document.querySelectorAll('[data-close-modal="true"]').forEach((closeButton) => closeButton.addEventListener('click', window.FNAdminComponents.closeModal));
  }));

  bookingsList.innerHTML = bookings.length ? bookings.sort((first, second) => (first.date + first.startTime).localeCompare(second.date + second.startTime)).map((booking) => '<div class="owner-booking-row"><div><strong>' + booking.court + ' • ' + booking.user + '</strong><small>' + booking.date + ' • ' + booking.startTime + ' - ' + booking.endTime + ' • ' + booking.phone + ' • ' + booking.paymentMethod + ' (' + booking.paymentStatus + ')</small></div><div class="owner-booking-actions">' + window.FNAdminComponents.getStatusBadge(booking.bookingStatus) + (booking.bookingStatus === 'Pending' ? '<button type="button" data-owner-booking-action="confirm" data-booking-id="' + booking.id + '">Confirm</button><button type="button" data-owner-booking-action="reject" data-booking-id="' + booking.id + '">Reject</button>' : '') + (booking.bookingStatus === 'Cancelled' ? '<button class="icon-button danger" type="button" data-owner-booking-action="delete" data-booking-id="' + booking.id + '" title="Delete cancelled reservation" aria-label="Delete cancelled reservation"><i class="fa-solid fa-trash"></i></button>' : (!['Rejected', 'Completed'].includes(booking.bookingStatus) ? '<button class="icon-button danger" type="button" data-owner-booking-action="cancel" data-booking-id="' + booking.id + '" title="Delete reservation" aria-label="Delete reservation"><i class="fa-solid fa-trash"></i></button>' : '')) + '</div></div>').join('') : '<p class="muted">No bookings for your courts yet.</p>';

  panel.querySelectorAll('.owner-court-form').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const court = window.FNAdmin.state.courts.find((item) => item.id === form.dataset.courtId);
    if (!court) return;
    const data = new FormData(form);
    const saveButton = form.querySelector('button[type="submit"]');
    const photo = data.get('photo');
    const owner = window.FNAdminAuth.user;
    const updatedCourt = { ...court,
      name: data.get('name'),
      address: data.get('address'),
      city: data.get('city'),
      district: data.get('district'),
      province: data.get('province'),
      contactNumber: data.get('contactNumber'),
      pricePerHour: Number(data.get('pricePerHour')),
      type: data.get('type'),
      turfType: data.get('turfType'),
      status: data.get('status'),
      openingTime: data.get('openingTime'),
      closingTime: data.get('closingTime'),
      slotDuration: Number(data.get('slotDuration')) || 60,
      blockedSlots: String(data.get('blockedSlots') || '').split(',').map((slot) => slot.trim()).filter(Boolean),
      description: data.get('description'),
      ownerId: court.ownerId || (owner && owner.uid)
    };
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }
    const withTimeout = (promise, message) => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(message)), 15000);
      promise.then(resolve, reject).finally(() => clearTimeout(timeout));
    });
    const upload = photo && photo.size
      ? withTimeout(window.FNAdminData.uploadAsset(photo, 'courts/' + court.id + '/' + Date.now() + '-' + photo.name), 'Firebase Storage is not ready. Open the Firebase Console for the footshal project, select Storage, and click Get started.')
      : Promise.resolve('');
    upload.then((imageUrl) => {
      if (imageUrl) updatedCourt.images = [imageUrl];
      Object.assign(court, updatedCourt);
      return window.FNAdmin.syncCourt(updatedCourt);
    }).then(() => {
      window.FNAdminComponents.showToast('Court profile saved.', 'success');
      this.render();
    }).catch((error) => {
      console.error('Unable to save owner court:', error);
      window.FNAdminComponents.showToast('Court could not be saved: ' + (error.message || 'permission denied.'), 'error');
    }).finally(() => {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save court settings';
      }
    });
  }));

  bookingsList.querySelectorAll('[data-owner-booking-action]').forEach((button) => button.addEventListener('click', () => {
    const booking = window.FNAdmin.state.bookings.find((item) => item.id === button.dataset.bookingId);
    if (!booking) return;
    if (button.dataset.ownerBookingAction === 'delete') {
      if (!window.confirm('Delete this cancelled reservation permanently?')) return;
      window.FNAdmin.deleteBooking(booking).then(() => {
        this.render();
        window.FNAdminComponents.showToast('Cancelled reservation deleted.', 'success');
      }).catch((error) => {
        console.error('Unable to delete cancelled reservation:', error);
        window.FNAdminComponents.showToast('Reservation could not be deleted: ' + (error.message || 'permission denied.'), 'error');
      });
      return;
    }
    if (button.dataset.ownerBookingAction === 'cancel') {
      if (!window.confirm('Delete this reservation? It will be cancelled and the time will become available.')) return;
      window.FNAdmin.setBookingStatus(booking, 'Cancelled');
      window.FNAdmin.syncBookings(booking).then(() => {
        this.render();
        window.FNAdminComponents.showToast('Reservation deleted and time released.', 'success');
      }).catch((error) => {
        console.error('Unable to delete owner reservation:', error);
        window.FNAdminComponents.showToast('Reservation could not be deleted: ' + (error.message || 'permission denied.'), 'error');
      });
      return;
    }
    if (button.dataset.ownerBookingAction === 'reject') {
      window.FNAdmin.rejectBooking(booking).then(() => {
        this.render();
        window.FNAdminComponents.showToast('Booking request rejected and removed. The time is available again.', 'success');
      }).catch((error) => window.FNAdminComponents.showToast('Booking could not be rejected: ' + (error.message || 'permission denied.'), 'error'));
      return;
    }
    if (window.FNAdmin.hasBookingConflict(booking, booking.id)) {
      window.FNAdmin.rejectBooking(booking, 'The futsal could not confirm your booking because this date and time is no longer available.').then(() => {
        this.render();
        window.FNAdminComponents.showToast('Booking request rejected and removed because the time is no longer available.', 'error');
      }).catch((error) => {
        console.error('Unable to remove conflicting booking request:', error);
        window.FNAdminComponents.showToast('Booking request could not be rejected: ' + (error.message || 'permission denied.'), 'error');
      });
      return;
    }
    const previousStatus = booking.bookingStatus;
    window.FNAdmin.setBookingStatus(booking, 'Confirmed');
    window.FNAdmin.syncBookings(booking).then(() => {
      this.render();
      window.FNAdminComponents.showToast('Booking confirmed.', 'success');
    }).catch((error) => {
      booking.bookingStatus = previousStatus;
      console.error('Unable to confirm booking:', error);
      const message = error && error.code === 'permission-denied'
        ? 'Firebase denied owner confirmation. Deploy firebase/firestore.rules for the footshal project, then reload the app.'
        : 'Booking could not be confirmed: ' + (error.message || 'unknown error.');
      window.FNAdminComponents.showToast(message, 'error');
      this.render();
    });
  }));
};

window.FNOwnerPortal.init = function() {
  this.initHeaderActions();
  window.addEventListener('fn:bookings-changed', () => {
    if (window.FNAdminAuth.getRole() === 'Owner') this.render();
  });
};

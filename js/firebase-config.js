window.FNAdmin = window.FNAdmin || {};

window.FNAdmin.config = {
 apiKey: "AIzaSyBvE18p7p_C-YrsjkZJC7BDh6GEVPmM_ms",
  authDomain: "footshal.firebaseapp.com",
  projectId: "footshal",
  storageBucket: "footshal.firebasestorage.app",
  messagingSenderId: "405370974979",
  appId: "1:405370974979:web:e716542b75250ce34daf36",
  measurementId: "G-Z0E0STK2HQ"
};

window.FNAdmin.r2Config = {
  enabled: false,
  publicUrl: 'https://your-bucket.r2.cloudflarestorage.com/your-bucket',
  uploadUrl: 'https://your-worker.example.com/upload',
  uploadMethod: 'PUT',
  headers: {},
  getPublicUrl: function(key) {
    return new URL(key, this.publicUrl.replace(/\/$/, '') + '/').toString();
  }
};

const demoRequested = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
const hasPlaceholderConfig = Object.values(window.FNAdmin.config).some((value) => typeof value === 'string' && /(YOUR_|your_|replace_me|example)/i.test(value));
window.FNAdmin.demoMode = demoRequested || hasPlaceholderConfig;
const demoState = {
  courts: [
    { id: 'court-1', name: 'Anveshan Futsal', owner: 'Aarav Shrestha', city: 'Kathmandu', district: 'Kathmandu', province: 'Bagmati', address: 'Tinkune, Kathmandu', pricePerHour: 2200, rating: 4.8, bookings: 68, status: 'active', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: true, shower: true, lighting: true, openingTime: '08:00', closingTime: '22:00', contactNumber: '+977-9800000001', description: 'Premium indoor futsal court with a modern synthetic turf.' },
    { id: 'court-2', name: 'GoalZone Futsal', owner: 'Sujan Gurung', city: 'Lalitpur', district: 'Lalitpur', province: 'Bagmati', address: 'Jawalakhel, Lalitpur', pricePerHour: 2500, rating: 4.7, bookings: 52, status: 'active', images: [], type: 'Indoor', turfType: 'Hybrid', parking: true, washroom: true, changingRoom: true, shower: true, lighting: true, openingTime: '09:00', closingTime: '23:00', contactNumber: '+977-9800000002', description: 'Convenient and family-friendly futsal venue.' },
    { id: 'court-3', name: 'The Futsal Hub', owner: 'Niraj KC', city: 'Bhaktapur', district: 'Bhaktapur', province: 'Bagmati', address: 'Suryabinayak, Bhaktapur', pricePerHour: 2100, rating: 4.5, bookings: 44, status: 'active', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: true, shower: true, lighting: true, openingTime: '08:30', closingTime: '21:30', contactNumber: '+977-9800000003', description: 'Fast-paced community venue for evening matches.' },
    { id: 'court-4', name: 'PlayArena', owner: 'Rajesh Ghimire', city: 'Pokhara', district: 'Kaski', province: 'Gandaki', address: 'Lakeside, Pokhara', pricePerHour: 2700, rating: 4.9, bookings: 84, status: 'active', images: [], type: 'Indoor', turfType: 'Synthetic', parking: true, washroom: true, changingRoom: true, shower: true, lighting: true, openingTime: '08:00', closingTime: '22:00', contactNumber: '+977-9800000004', description: 'Top-rated venue with premium lights and excellent turf quality.' },
    { id: 'court-5', name: 'GamePoint Futsal', owner: 'Manish Thapa', city: 'Biratnagar', district: 'Morang', province: 'Koshi', address: 'Central Bus Park, Biratnagar', pricePerHour: 2300, rating: 4.6, bookings: 38, status: 'inactive', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: true, shower: true, lighting: true, openingTime: '10:00', closingTime: '21:00', contactNumber: '+977-9800000005', description: 'Ideal for weekend tournments and team practice.' },
    { id: 'court-6', name: 'Kathmandu Kickers Arena', owner: 'Venue Owner 6', city: 'Kathmandu', district: 'Kathmandu', province: 'Bagmati', address: 'Baneshwor, Kathmandu', pricePerHour: 2400, rating: 4.4, bookings: 0, status: 'active', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: false, shower: false, lighting: true, openingTime: '07:00', closingTime: '22:00', contactNumber: '+977-9800000006', description: 'Editable starter venue listing.' },
    { id: 'court-7', name: 'Lalitpur Soccer Zone', owner: 'Venue Owner 7', city: 'Lalitpur', district: 'Lalitpur', province: 'Bagmati', address: 'Satdobato, Lalitpur', pricePerHour: 2300, rating: 4.4, bookings: 0, status: 'active', images: [], type: 'Indoor', turfType: 'Synthetic', parking: true, washroom: true, changingRoom: true, shower: false, lighting: true, openingTime: '06:00', closingTime: '22:00', contactNumber: '+977-9800000007', description: 'Editable starter venue listing.' },
    { id: 'court-8', name: 'Bhaktapur Goal Station', owner: 'Venue Owner 8', city: 'Bhaktapur', district: 'Bhaktapur', province: 'Bagmati', address: 'Kamalbinayak, Bhaktapur', pricePerHour: 2000, rating: 4.3, bookings: 0, status: 'active', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: false, shower: false, lighting: true, openingTime: '08:00', closingTime: '21:00', contactNumber: '+977-9800000008', description: 'Editable starter venue listing.' },
    { id: 'court-9', name: 'Pokhara Futsal Point', owner: 'Venue Owner 9', city: 'Pokhara', district: 'Kaski', province: 'Gandaki', address: 'New Road, Pokhara', pricePerHour: 2400, rating: 4.3, bookings: 0, status: 'active', images: [], type: 'Indoor', turfType: 'Hybrid', parking: true, washroom: true, changingRoom: true, shower: false, lighting: true, openingTime: '07:00', closingTime: '22:00', contactNumber: '+977-9800000009', description: 'Editable starter venue listing.' },
    { id: 'court-10', name: 'Chitwan Futsal Center', owner: 'Venue Owner 10', city: 'Bharatpur', district: 'Chitwan', province: 'Bagmati', address: 'Bharatpur, Chitwan', pricePerHour: 1900, rating: 4.2, bookings: 0, status: 'active', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: false, shower: false, lighting: true, openingTime: '08:00', closingTime: '21:00', contactNumber: '+977-9800000010', description: 'Editable starter venue listing.' },
    { id: 'court-11', name: 'Dharan Football Hub', owner: 'Venue Owner 11', city: 'Dharan', district: 'Sunsari', province: 'Koshi', address: 'Bhanu Chowk, Dharan', pricePerHour: 1800, rating: 4.2, bookings: 0, status: 'active', images: [], type: 'Outdoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: false, shower: false, lighting: true, openingTime: '09:00', closingTime: '21:00', contactNumber: '+977-9800000011', description: 'Editable starter venue listing.' },
    { id: 'court-12', name: 'Butwal Futsal Arena', owner: 'Venue Owner 12', city: 'Butwal', district: 'Rupandehi', province: 'Lumbini', address: 'Traffic Chowk, Butwal', pricePerHour: 1900, rating: 4.1, bookings: 0, status: 'active', images: [], type: 'Indoor', turfType: 'Artificial', parking: true, washroom: true, changingRoom: false, shower: false, lighting: true, openingTime: '08:00', closingTime: '21:00', contactNumber: '+977-9800000012', description: 'Editable starter venue listing.' }
  ],
  bookings: [
    { id: 'BK-1001', user: 'Ritesh Tamang', phone: '+977-9801111111', court: 'Anveshan Futsal', date: '2026-09-12', startTime: '18:00', endTime: '19:30', duration: 90, amount: 4400, paymentMethod: 'eSewa', paymentStatus: 'Paid', bookingStatus: 'Confirmed', createdAt: '2026-09-10' },
    { id: 'BK-1002', user: 'Biraj Karki', phone: '+977-9801111112', court: 'GoalZone Futsal', date: '2026-09-13', startTime: '19:00', endTime: '20:30', duration: 90, amount: 5000, paymentMethod: 'Khalti', paymentStatus: 'Pending', bookingStatus: 'Pending', createdAt: '2026-09-11' },
    { id: 'BK-1003', user: 'Anish Rai', phone: '+977-9801111113', court: 'PlayArena', date: '2026-09-12', startTime: '17:00', endTime: '18:30', duration: 90, amount: 5400, paymentMethod: 'Card', paymentStatus: 'Paid', bookingStatus: 'Completed', createdAt: '2026-09-08' },
    { id: 'BK-1004', user: 'Nischal Thapa', phone: '+977-9801111114', court: 'The Futsal Hub', date: '2026-09-14', startTime: '20:00', endTime: '21:30', duration: 90, amount: 4200, paymentMethod: 'Cash', paymentStatus: 'Paid', bookingStatus: 'Cancelled', createdAt: '2026-09-09' }
  ],
  users: [
    { id: 'user-1', name: 'Ritesh Tamang', email: 'ritesh@example.com', phone: '+977-9801111111', location: 'Kathmandu', bookings: 12, joined: '2024-02-12', status: 'active', avatar: 'RT' },
    { id: 'user-2', name: 'Biraj Karki', email: 'biraj@example.com', phone: '+977-9801111112', location: 'Lalitpur', bookings: 9, joined: '2023-11-20', status: 'active', avatar: 'BK' },
    { id: 'user-3', name: 'Anish Rai', email: 'anish@example.com', phone: '+977-9801111113', location: 'Pokhara', bookings: 15, joined: '2024-01-16', status: 'active', avatar: 'AR' },
    { id: 'user-4', name: 'Nischal Thapa', email: 'nischal@example.com', phone: '+977-9801111114', location: 'Bhaktapur', bookings: 5, joined: '2025-05-10', status: 'disabled', avatar: 'NT' }
  ],
  teams: [
    { id: 'team-1', name: 'Green Warriors', captain: 'Ritesh Tamang', members: 7, location: 'Kathmandu', matchesPlayed: 18, wins: 12, losses: 6, status: 'approved' },
    { id: 'team-2', name: 'City Strikers', captain: 'Biraj Karki', members: 8, location: 'Lalitpur', matchesPlayed: 15, wins: 9, losses: 6, status: 'pending' }
  ],
  matches: [
    { id: 'match-1', teamA: 'Green Warriors', teamB: 'City Strikers', court: 'Anveshan Futsal', date: '2026-09-20', time: '18:00', duration: 60, referee: 'Amit Shah', score: '2 - 1', status: 'Upcoming' },
    { id: 'match-2', teamA: 'Lions FC', teamB: 'Mile High', court: 'GoalZone Futsal', date: '2026-09-18', time: '19:30', duration: 90, referee: 'Shambhu Rai', score: '1 - 1', status: 'Live' }
  ],
  tournaments: [
    { id: 'tournament-1', name: 'Kathmandu Futsal League', courtId: 'court-1', courtName: 'Anveshan Futsal', location: 'Tinkune, Kathmandu, Kathmandu, Bagmati', startDate: '2026-10-01', endDate: '2026-10-14', fee: 2500, prize: 50000, maxTeams: 12, status: 'Open' },
    { id: 'tournament-2', name: 'Pokhara Community Cup', courtId: 'court-4', courtName: 'PlayArena', location: 'Lakeside, Pokhara, Kaski, Gandaki', startDate: '2026-10-10', endDate: '2026-10-18', fee: 2000, prize: 35000, maxTeams: 10, status: 'Closed' }
  ],
  payments: [
    { id: 'txn-1', bookingId: 'BK-1001', user: 'Ritesh Tamang', amount: 4400, method: 'eSewa', paymentDate: '2026-09-10', status: 'Paid' },
    { id: 'txn-2', bookingId: 'BK-1002', user: 'Biraj Karki', amount: 5000, method: 'Khalti', paymentDate: '2026-09-11', status: 'Pending' },
    { id: 'txn-3', bookingId: 'BK-1003', user: 'Anish Rai', amount: 5400, method: 'Card', paymentDate: '2026-09-08', status: 'Paid' }
  ],
  reviews: [
    { id: 'review-1', user: 'Ritesh Tamang', court: 'Anveshan Futsal', rating: 5, review: 'Excellent turf and smooth booking experience.', date: '2026-09-11', status: 'Approved' },
    { id: 'review-2', user: 'Biraj Karki', court: 'GoalZone Futsal', rating: 4, review: 'Good lights and helpful staff.', date: '2026-09-09', status: 'Pending' }
  ],
  notifications: [
    { id: 'notify-1', title: 'New booking received', message: 'A new booking was confirmed for Anveshan Futsal.', target: 'All users', date: '2026-09-12', status: 'Sent' },
    { id: 'notify-2', title: 'Tournament reminder', message: 'Registration window ends in 48 hours.', target: 'Tournament participants', date: '2026-09-11', status: 'Scheduled' }
  ],
  reports: [
    { name: 'Booking report', details: '120 bookings in the last 30 days' },
    { name: 'Revenue report', details: 'NPR 1.3M generated' },
    { name: 'Court performance', details: 'Anveshan and PlayArena are leading' }
  ],
  admins: [
    { id: 'admin-1', name: 'Admin Nepal', email: 'admin@futsalnepal.com', role: 'Super Admin', permissions: ['Dashboard', 'Courts', 'Bookings', 'Users', 'Payments'], status: 'active' },
    { id: 'admin-2', name: 'Manager Team', email: 'manager@futsalnepal.com', role: 'Manager', permissions: ['Courts', 'Bookings', 'Reports'], status: 'active' }
  ]
};

window.FNAdmin.state = demoState;
window.FNAdmin.demoState = demoState;

window.FNAdmin.listeners = window.FNAdmin.listeners || [];
window.FNAdmin.bookingSlotUnsubscriber = null;
window.FNAdmin.bookingSlotSubscriptionKey = '';

window.FNAdmin.getBookingSlotId = function(booking) {
  return [booking.courtId || booking.court, booking.date, booking.startTime, booking.endTime].join('_').replace(/[^a-zA-Z0-9_-]/g, '-');
};

window.FNAdmin.getNepalDateTime = function(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((values, part) => {
    values[part.type] = part.value;
    return values;
  }, {});
  return {
    date: parts.year + '-' + parts.month + '-' + parts.day,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
};

window.FNAdmin.getNepalTimestamp = function(date, time) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) - (5 * 60 + 45) * 60 * 1000;
};

window.FNAdmin.isBookingTimeExpired = function(booking, nepalNow = this.getNepalDateTime()) {
  return booking.date < nepalNow.date
    || (booking.date === nepalNow.date && Number(booking.startTime.split(':')[0]) * 60 + Number(booking.startTime.split(':')[1]) <= nepalNow.minutes);
};

window.FNAdmin.canTransitionBookingStatus = function(currentStatus, nextStatus) {
  const current = String(currentStatus || '').toLowerCase();
  const next = String(nextStatus || '').toLowerCase();
  if (current === next) return true;
  const transitions = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['cancelled', 'completed'],
    rejected: [],
    cancelled: [],
    completed: []
  };
  return (transitions[current] || []).includes(next);
};

window.FNAdmin.setBookingStatus = function(booking, nextStatus) {
  if (!this.canTransitionBookingStatus(booking.bookingStatus, nextStatus)) {
    throw new Error('Booking status cannot change from ' + (booking.bookingStatus || 'Unknown') + ' to ' + nextStatus + '.');
  }
  booking.bookingStatus = nextStatus;
  return booking;
};

window.FNAdmin.hasBookingConflict = function(booking, excludeBookingId) {
  const toMinutes = (time) => {
    const parts = String(time || '').split(':').map(Number);
    return (parts[0] * 60) + parts[1];
  };
  const bookingStart = toMinutes(booking.startTime);
  const bookingEnd = toMinutes(booking.endTime);
  const today = this.getNepalDateTime().date;
  const reservations = [...(this.state.bookings || []), ...(this.state.bookingSlots || [])];
  return reservations.some((item) => {
    if (item.id === excludeBookingId || item.bookingId === excludeBookingId || !this.isBookingActive(item) || (item.date && item.date < today)) return false;
    if (!((item.courtId && item.courtId === booking.courtId) || item.court === booking.court) || item.date !== booking.date) return false;
    return bookingStart < toMinutes(item.endTime) && toMinutes(item.startTime) < bookingEnd;
  });
};

window.FNAdmin.isBookingActive = function(booking) {
  const status = String(booking && booking.bookingStatus || '').toLowerCase();
  if (!['pending', 'confirmed'].includes(status)) return false;
  return status !== 'pending' || !booking.expiresAt || Number(booking.expiresAt) > Date.now();
};

window.FNAdmin.syncBookings = function(booking) {
  if (this.demoMode) {
    const actorRole = window.FNAdminAuth && window.FNAdminAuth.getRole();
    const court = (this.state.courts || []).find((item) => item.id === booking.courtId || item.name === booking.court);
    const alerts = [];
    const addAlert = (id, targetRole, targetUserId, title, message, type) => alerts.push({ id, bookingId: booking.id, courtId: booking.courtId || '', userId: booking.userId || '', targetUserId: targetUserId || '', targetRole, target: targetRole === 'Admin' ? 'Staff' : targetRole === 'Owner' ? 'Owners' : 'Users', title, message, type, isRead: false, createdAt: Date.now(), date: new Date().toISOString(), status: 'Sent' });
    if (booking.bookingStatus === 'Confirmed') {
      addAlert('booking-confirmed-' + booking.id, 'User', booking.userId, 'Booking confirmed', 'Your booking at ' + booking.court + ' on ' + booking.date + ', ' + booking.startTime + ' - ' + booking.endTime + ' is confirmed.', 'booking_confirmed');
      addAlert('booking-confirmed-admin-' + booking.id, 'Admin', '', 'Booking confirmed', booking.court + ' booking ' + booking.id + ' was confirmed.', 'booking_confirmed');
    } else if (booking.bookingStatus === 'Cancelled') {
      addAlert('booking-cancelled-' + booking.id, 'User', booking.userId, 'Booking cancelled', 'Your booking at ' + booking.court + ' on ' + booking.date + ' was cancelled.', 'booking_cancelled');
      addAlert('booking-cancelled-admin-' + booking.id, 'Admin', '', 'Booking cancelled', booking.court + ' booking ' + booking.id + ' was cancelled.', 'booking_cancelled');
      if (actorRole === 'User' && court && court.ownerId) addAlert('booking-cancelled-owner-' + booking.id, 'Owner', court.ownerId, 'Player cancelled a booking', booking.user + ' cancelled ' + booking.court + ' on ' + booking.date + ', ' + booking.startTime + ' - ' + booking.endTime + '.', 'booking_cancelled');
    }
    if (alerts.length) this.state.notifications = [...(this.state.notifications || []).filter((item) => !alerts.some((alert) => alert.id === item.id)), ...alerts];
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking || null }));
    if (alerts.length) window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return Promise.resolve();
  }

  if (!window.firebase || !firebase.firestore) return Promise.reject(new Error('Firebase is not available.'));
  if (!firebase.auth || !firebase.auth().currentUser) {
    const authenticationError = new Error('You must be signed in to update bookings.');
    authenticationError.code = 'unauthenticated';
    return Promise.reject(authenticationError);
  }
  const database = firebase.firestore();
  const status = String(booking.bookingStatus || '').toLowerCase();
  const slotReleased = ['cancelled', 'rejected', 'completed'].includes(status);
  const bookingRef = database.collection('bookings').doc(booking.id);
  const slotRef = database.collection('bookingSlots').doc(this.getBookingSlotId(booking));
  const court = (this.state.courts || []).find((item) => item.id === booking.courtId || item.name === booking.court);
  const ownerId = court && court.ownerId;
  const actorRole = window.FNAdminAuth && window.FNAdminAuth.getRole();
  let eventNotifications = [];
  return database.runTransaction((transaction) => Promise.all([transaction.get(bookingRef), transaction.get(slotRef)]).then(([bookingSnapshot, slot]) => {
    eventNotifications = [];
    const previousStatus = bookingSnapshot.exists ? String(bookingSnapshot.data().bookingStatus || '').toLowerCase() : '';
    transaction.set(bookingRef, booking, { merge: true });
    if (slot.exists && slot.data().bookingId === booking.id) {
      transaction.set(slotRef, {
        status: slotReleased ? 'Available' : booking.bookingStatus,
        bookingStatus: booking.bookingStatus
      }, { merge: true });
    }
    const date = new Date().toISOString();
    const createdAt = Date.now();
    const writeNotification = (id, targetRole, targetUserId, title, message, type) => {
      const notification = { id, bookingId: booking.id, courtId: booking.courtId || '', userId: booking.userId || '', targetUserId: targetUserId || '', targetRole, target: targetRole === 'Admin' ? 'Staff' : targetRole === 'Owner' ? 'Owners' : 'Users', title, message, type, isRead: false, createdAt, date, status: 'Sent' };
      eventNotifications.push(notification);
      transaction.set(database.collection('notifications').doc(id), notification);
    };

    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      writeNotification('booking-confirmed-' + booking.id, 'User', booking.userId, 'Booking confirmed', 'Your booking at ' + booking.court + ' on ' + booking.date + ', ' + booking.startTime + ' - ' + booking.endTime + ' is confirmed.', 'booking_confirmed');
      writeNotification('booking-confirmed-admin-' + booking.id, 'Admin', '', 'Booking confirmed', booking.court + ' booking ' + booking.id + ' was confirmed.', 'booking_confirmed');
    } else if (status === 'cancelled' && previousStatus !== 'cancelled') {
      writeNotification('booking-cancelled-' + booking.id, 'User', booking.userId, 'Booking cancelled', 'Your booking at ' + booking.court + ' on ' + booking.date + ' was cancelled.', 'booking_cancelled');
      writeNotification('booking-cancelled-admin-' + booking.id, 'Admin', '', 'Booking cancelled', booking.court + ' booking ' + booking.id + ' was cancelled.', 'booking_cancelled');
      if (actorRole === 'User' && ownerId) {
        writeNotification('booking-cancelled-owner-' + booking.id, 'Owner', ownerId, 'Player cancelled a booking', booking.user + ' cancelled ' + booking.court + ' on ' + booking.date + ', ' + booking.startTime + ' - ' + booking.endTime + '.', 'booking_cancelled');
      }
    }
  })).then(() => {
    if (eventNotifications.length) {
      this.state.notifications = [...(this.state.notifications || []).filter((item) => !eventNotifications.some((notification) => notification.id === item.id)), ...eventNotifications];
      window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    }
  });
};

window.FNAdmin.rejectBooking = function(booking, reason) {
  const user = window.FNAdminAuth && window.FNAdminAuth.user;
  const notification = {
    id: 'booking-rejected-' + booking.id,
    bookingId: booking.id,
    userId: booking.userId || '',
    targetUserId: booking.userId || '',
    title: 'Booking request not accepted',
    message: reason || 'Your booking request for ' + booking.court + ' on ' + booking.date + ' at ' + booking.startTime + ' was not accepted.',
    target: 'Users',
    targetRole: 'User',
    courtId: booking.courtId || '',
    date: new Date().toISOString(),
    createdAt: Date.now(),
    isRead: false,
    status: 'Sent',
    type: 'booking_rejected'
  };
  const adminNotification = {
    id: 'booking-rejected-admin-' + booking.id,
    bookingId: booking.id,
    courtId: booking.courtId || '',
    target: 'Staff',
    targetRole: 'Admin',
    title: 'Booking request rejected',
    message: booking.court + ' booking ' + booking.id + ' was rejected by the ground owner.',
    date: notification.date,
    createdAt: notification.createdAt,
    isRead: false,
    status: 'Sent',
    type: 'booking_rejected'
  };

  if (this.demoMode) {
    this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
    this.state.bookingSlots = (this.state.bookingSlots || []).filter((item) => item.bookingId !== booking.id);
    this.state.payments = (this.state.payments || []).filter((item) => item.bookingId !== booking.id);
    this.state.notifications = [...(this.state.notifications || []), notification];
    this.state.notifications.push(adminNotification);
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return Promise.resolve(notification);
  }

  if (!user || !window.firebase || !firebase.firestore || !firebase.auth || !firebase.auth().currentUser) {
    return Promise.reject(new Error('A signed-in Firebase account is required to reject a booking.'));
  }

  const database = firebase.firestore();
  const bookingRef = database.collection('bookings').doc(booking.id);
  const slotRef = database.collection('bookingSlots').doc(this.getBookingSlotId(booking));
  const paymentRef = database.collection('payments').doc('TX-' + booking.id);
  const notificationRef = database.collection('notifications').doc(notification.id);
  const adminNotificationRef = database.collection('notifications').doc(adminNotification.id);

  return database.runTransaction((transaction) => Promise.all([
    transaction.get(bookingRef),
    transaction.get(slotRef),
    transaction.get(paymentRef)
  ]).then(([bookingSnapshot, slotSnapshot, paymentSnapshot]) => {
    if (!bookingSnapshot.exists) throw new Error('This booking request no longer exists.');
    const storedBooking = bookingSnapshot.data();
    notification.userId = storedBooking.userId || '';
    notification.targetUserId = storedBooking.userId || '';
    notification.courtId = storedBooking.courtId || '';
    adminNotification.courtId = storedBooking.courtId || '';
    if (slotSnapshot.exists && slotSnapshot.data().bookingId === booking.id) transaction.delete(slotRef);
    if (paymentSnapshot.exists && paymentSnapshot.data().status === 'Pending') transaction.delete(paymentRef);
    transaction.delete(bookingRef);
    transaction.set(notificationRef, notification);
    transaction.set(adminNotificationRef, adminNotification);
  })).then(() => {
    this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
    this.state.bookingSlots = (this.state.bookingSlots || []).filter((item) => item.bookingId !== booking.id);
    this.state.payments = (this.state.payments || []).filter((item) => item.bookingId !== booking.id);
    this.state.notifications = [...(this.state.notifications || []).filter((item) => item.id !== notification.id && item.id !== adminNotification.id), notification, adminNotification];
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return notification;
  });
};

window.FNAdmin.deleteBooking = function(booking) {
  if (this.demoMode) {
    this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    return Promise.resolve();
  }
  if (!window.firebase || !firebase.firestore) return Promise.reject(new Error('Firebase is not available.'));
  const database = firebase.firestore();
  const isOwner = window.FNAdminAuth && window.FNAdminAuth.getRole() === 'Owner';
  const bookingRef = database.collection('bookings').doc(booking.id);
  const slotRef = database.collection('bookingSlots').doc(this.getBookingSlotId(booking));
  if (isOwner) {
    return slotRef.get().then((slot) => {
      const batch = database.batch();
      batch.delete(bookingRef);
      if (slot.exists) batch.delete(slotRef);
      return batch.commit().then(() => window.FNAdminData.logActivity('delete', 'bookings', booking.id));
    }).then(() => {
      this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
      window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    });
  }
  const batch = database.batch();
  batch.delete(bookingRef);
  batch.delete(database.collection('payments').doc('TX-' + booking.id));
  batch.delete(slotRef);
  return batch.commit().then(() => window.FNAdminData.logActivity('delete', 'bookings', booking.id)).then(() => {
    this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
  });
};

window.FNAdmin.deleteUserBooking = function(booking) {
  const user = window.FNAdminAuth && window.FNAdminAuth.user;
  const isDemoBooking = this.demoMode && user && !booking.userId && booking.user === user.name;
  if (!user || (booking.userId !== user.uid && !isDemoBooking)) return Promise.reject(new Error('You can only delete your own bookings.'));

  const deleteRecords = () => {
    const database = firebase.firestore();
    const bookingRef = database.collection('bookings').doc(booking.id);
    const slotRef = database.collection('bookingSlots').doc(this.getBookingSlotId(booking));
    return slotRef.get().then((slot) => {
      const batch = database.batch();
      batch.delete(bookingRef);
      if (slot.exists && slot.data().bookingId === booking.id) batch.delete(slotRef);
      return batch.commit().catch((error) => {
        if (error && error.code === 'permission-denied') {
          throw new Error('Firebase denied deleting the booking or releasing its slot. Deploy the updated firebase/firestore.rules rules, then try again.');
        }
        throw error;
      });
    }).catch((error) => {
      if (error && error.code === 'permission-denied') {
        throw new Error('Firebase denied access to this booking slot. Deploy the updated firebase/firestore.rules rules, then try again.');
      }
      throw error;
    }).then(() => {
      this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
      this.state.bookingSlots = (this.state.bookingSlots || []).filter((item) => item.bookingId !== booking.id);
      window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    });
  };

  if (this.demoMode) {
    this.state.bookings = (this.state.bookings || []).filter((item) => item.id !== booking.id);
    this.state.payments = (this.state.payments || []).filter((item) => item.id !== 'TX-' + booking.id);
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    return Promise.resolve();
  }
  if (!window.firebase || !firebase.firestore || !firebase.auth || !firebase.auth().currentUser || firebase.auth().currentUser.uid !== user.uid) {
    return Promise.reject(new Error('Your Firebase login session has expired. Please sign in again.'));
  }

  const active = ['Pending', 'Confirmed'].includes(booking.bookingStatus);
  if (!active) return deleteRecords();
  const bookingStart = this.getNepalTimestamp(booking.date, booking.startTime);
  if (!Number.isFinite(bookingStart) || (bookingStart > Date.now() && bookingStart - Date.now() <= 60 * 60 * 1000)) {
    return Promise.reject(new Error('Bookings cannot be deleted within one hour of their start time.'));
  }

  const previousStatus = booking.bookingStatus;
  this.setBookingStatus(booking, 'Cancelled');
  return this.syncBookings(booking).catch((error) => {
    booking.bookingStatus = previousStatus;
    if (error && error.code === 'permission-denied') {
      throw new Error('Firebase denied cancelling this booking or releasing its slot. Deploy the updated firebase/firestore.rules rules, then try again.');
    }
    throw error;
  }).then(deleteRecords);
};

window.FNAdmin.createBooking = function(booking) {
  if (this.isBookingTimeExpired(booking)) {
    const expiredError = new Error('This booking time has already passed in Nepal time. Please choose a future slot.');
    expiredError.code = 'slot-expired';
    return Promise.reject(expiredError);
  }
  if (this.hasBookingConflict(booking)) return Promise.reject(new Error('Already booked. Please choose another time.'));

  if (this.demoMode) {
    this.state.bookings.push(booking);
    this.state.payments.push({ id: 'TX-' + booking.id, bookingId: booking.id, user: booking.user, userId: booking.userId, courtId: booking.courtId, amount: booking.amount, method: booking.paymentMethod, paymentDate: booking.createdAt, status: 'Pending' });
    const court = (this.state.courts || []).find((item) => item.id === booking.courtId);
    const owner = (this.state.users || []).find((item) => item.role === 'Owner' && (item.id === (court && court.ownerId) || item.name === (court && court.owner)));
    const date = new Date().toISOString();
    const createdAt = Date.now();
    const alerts = [
      { id: 'booking-user-' + booking.id, targetRole: 'User', targetUserId: booking.userId, target: 'Users', title: 'Booking request sent', message: 'Your booking request has been sent to ' + booking.court + ' for ' + booking.startTime + ' - ' + booking.endTime + '.', type: 'booking_created' },
      { id: 'booking-admin-' + booking.id, targetRole: 'Admin', target: 'Staff', title: 'New booking request', message: booking.user + ' requested ' + booking.court + ' on ' + booking.date + ', ' + booking.startTime + ' - ' + booking.endTime + '.', type: 'booking_created' }
    ];
    if ((court && court.ownerId) || (owner && owner.id)) alerts.push({ id: 'booking-owner-' + booking.id, targetRole: 'Owner', targetUserId: (court && court.ownerId) || owner.id, target: 'Owners', title: 'New booking request', message: booking.user + ' requested ' + booking.startTime + ' - ' + booking.endTime + ' at ' + booking.court + '.', type: 'booking_created' });
    this.state.notifications = [...(this.state.notifications || []), ...alerts.map((alert) => ({ ...alert, bookingId: booking.id, userId: booking.userId, courtId: booking.courtId, date, createdAt, isRead: false, status: 'Sent' }))];
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return Promise.resolve(booking);
  }

  if (!window.firebase || !firebase.firestore) return Promise.reject(new Error('Firebase is not available.'));
  const database = firebase.firestore();
  const slotRef = database.collection('bookingSlots').doc(this.getBookingSlotId(booking));
  const bookingRef = database.collection('bookings').doc(booking.id);
  const courtRef = database.collection('courts').doc(booking.courtId);
  const paymentRef = database.collection('payments').doc('TX-' + booking.id);
  const payment = { id: 'TX-' + booking.id, bookingId: booking.id, userId: booking.userId, courtId: booking.courtId, user: booking.user, amount: booking.amount, method: booking.paymentMethod, paymentDate: booking.createdAt, status: 'Pending' };
  const date = new Date().toISOString();
  const createdAt = Date.now();
  const notifications = [
    { id: 'booking-user-' + booking.id, bookingId: booking.id, userId: booking.userId, targetUserId: booking.userId, targetRole: 'User', target: 'Users', title: 'Booking request sent', message: 'Your booking request has been sent to ' + booking.court + ' for ' + booking.startTime + ' - ' + booking.endTime + '.', type: 'booking_created', courtId: booking.courtId, date, createdAt, isRead: false, status: 'Sent' },
    { id: 'booking-admin-' + booking.id, bookingId: booking.id, userId: booking.userId, targetRole: 'Admin', target: 'Staff', title: 'New booking request', message: booking.user + ' requested ' + booking.court + ' on ' + booking.date + ', ' + booking.startTime + ' - ' + booking.endTime + '.', type: 'booking_created', courtId: booking.courtId, date, createdAt, isRead: false, status: 'Sent' }
  ];
  return database.runTransaction((transaction) => Promise.all([transaction.get(slotRef), transaction.get(courtRef)]).then(([slot, courtSnapshot]) => {
    notifications.length = 2;
    if (this.isBookingTimeExpired(booking)) {
      const expiredError = new Error('This booking time has already passed in Nepal time. Please choose a future slot.');
      expiredError.code = 'slot-expired';
      throw expiredError;
    }
    const slotData = slot.exists ? slot.data() : {};
    const slotStatus = String(slotData.status || '').toLowerCase();
    const bookingStatus = String(slotData.bookingStatus || '').toLowerCase();
    const slotDate = String(slotData.date || booking.date);
    const today = this.getNepalDateTime().date;
    const isExpired = slotDate < today;
    const lockExpired = bookingStatus === 'pending' && Number(slotData.expiresAt || 0) > 0 && Number(slotData.expiresAt) <= Date.now();
    const isAvailable = isExpired || lockExpired || ['available', 'cancelled', 'released', 'rejected', 'completed'].includes(slotStatus)
      || ['available', 'cancelled', 'rejected', 'completed'].includes(bookingStatus);
    if (slot.exists && !isExpired && !isAvailable) {
      const conflictError = new Error('Already booked. Please choose another time.');
      conflictError.code = 'already-booked';
      conflictError.slotStatus = slotData.bookingStatus || slotData.status || 'Active';
      throw conflictError;
    }
    transaction.set(slotRef, { bookingId: booking.id, userId: booking.userId, courtId: booking.courtId, date: booking.date, startTime: booking.startTime, endTime: booking.endTime, status: booking.bookingStatus, bookingStatus: booking.bookingStatus, expiresAt: booking.expiresAt || null });
    transaction.set(bookingRef, booking);
    transaction.set(paymentRef, payment);
    const court = courtSnapshot.exists ? courtSnapshot.data() : {};
    const ownerId = court.ownerId || '';
    if (ownerId) notifications.push({ id: 'booking-owner-' + booking.id, bookingId: booking.id, userId: booking.userId, targetUserId: ownerId, targetRole: 'Owner', target: 'Owners', title: 'New booking request', message: booking.user + ' requested ' + booking.startTime + ' - ' + booking.endTime + ' at ' + booking.court + '.', type: 'booking_created', courtId: booking.courtId, date, createdAt, isRead: false, status: 'Sent' });
    notifications.forEach((notification) => transaction.set(database.collection('notifications').doc(notification.id), notification));
  })).then(() => {
    window.FNAdmin.state.bookings = [...(window.FNAdmin.state.bookings || []).filter((item) => item.id !== booking.id), booking];
    window.FNAdmin.state.notifications = [...(window.FNAdmin.state.notifications || []).filter((item) => !notifications.some((notification) => notification.id === item.id)), ...notifications];
    window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: booking }));
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return booking;
  });
};

window.FNAdmin.syncCourt = function(court) {
  if (this.demoMode) {
    window.dispatchEvent(new CustomEvent('fn:courts-changed', { detail: court || null }));
    return Promise.resolve();
  }

  if (!window.firebase || !firebase.firestore) return Promise.reject(new Error('Firebase is not available.'));
  return firebase.firestore().collection('courts').doc(court.id).set(court, { merge: true }).then(() => window.FNAdminData.logActivity('update', 'courts', court.id));
};

window.FNAdmin.cleanupExpiredNotifications = function() {
  const expiryLimit = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const notifications = this.state.notifications || [];
  const expired = notifications.filter((item) => {
    const createdAt = new Date(item.date || 0).getTime();
    return Number.isFinite(createdAt) && createdAt < expiryLimit;
  });
  if (!expired.length) return Promise.resolve();

  this.state.notifications = notifications.filter((item) => !expired.includes(item));
  if (this.demoMode) {
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return Promise.resolve();
  }

  return Promise.all(expired.map((item) => window.FNAdminData.remove('notifications', item.id))).then(() => undefined);
};

window.FNAdmin.deleteNotification = function(notificationId, rerender) {
  const notifications = this.state.notifications || [];
  const index = notifications.findIndex((item) => item.id === notificationId);
  if (index < 0) return Promise.resolve(false);
  const notification = notifications[index];
  if (!window.confirm('Delete this notification?')) return Promise.resolve(false);
  const remove = this.demoMode ? Promise.resolve() : window.FNAdminData.remove('notifications', notification.id);
  return remove.then(() => {
    this.state.notifications.splice(index, 1);
    if (typeof rerender === 'function') rerender();
    window.FNAdminComponents.showToast('Notification deleted.', 'success');
    return true;
  }).catch((error) => {
    window.FNAdminComponents.showToast('Notification could not be deleted: ' + (error.message || 'permission denied.'), 'error');
    return false;
  });
};

window.FNAdmin.getNotificationsForRole = function(role) {
  const user = window.FNAdminAuth && window.FNAdminAuth.user || {};
  const courts = window.FNAdmin.state.courts || [];
  return (this.state.notifications || []).filter((item) => {
    if (role === 'Admin' || role === 'Super Admin' || role === 'Manager') return true;
    if (item.targetUserId && item.targetUserId !== user.uid) return false;
    if (item.targetUserId && item.targetUserId === user.uid) return true;
    if (item.targetRole === role && !item.targetUserId) return true;
    if (role === 'User') return !item.targetRole && ['All', 'Users'].includes(item.target);
    if (role === 'Owner') {
      if (!item.targetRole && ['All', 'Owners'].includes(item.target)) return true;
      const ownedCourts = courts.filter((court) => court.ownerId === user.uid || court.owner === user.name);
      return item.type === 'booking' && item.target === 'Staff' && ownedCourts.some((court) => court.id === item.courtId || court.name === item.court);
    }
    return false;
  });
};

window.FNAdmin.markNotificationRead = function(notification) {
  if (!notification || notification.isRead === true) return Promise.resolve();
  const markLocally = () => {
    notification.isRead = true;
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
  };
  if (this.demoMode) {
    markLocally();
    return Promise.resolve();
  }
  if (!window.firebase || !firebase.firestore || !firebase.auth || !firebase.auth().currentUser) return Promise.reject(new Error('Sign in to update notifications.'));
  return firebase.firestore().collection('notifications').doc(notification.id).set({ isRead: true }, { merge: true }).then(markLocally);
};

window.FNAdmin.markAllNotificationsRead = function(notifications) {
  return Promise.all((notifications || []).filter((item) => item.isRead !== true).map((item) => this.markNotificationRead(item)));
};

window.FNAdmin.stopBookingSlotSubscription = function() {
  if (this.bookingSlotUnsubscriber) this.bookingSlotUnsubscriber();
  this.bookingSlotUnsubscriber = null;
  this.bookingSlotSubscriptionKey = '';
  this.state.bookingSlots = [];
  this.state.bookingSlotsLoadedDate = '';
  this.state.bookingSlotsErrorDate = '';
};

window.FNAdmin.subscribeToBookingSlots = function(courtId, date) {
  const subscriptionKey = date || '';
  if (this.bookingSlotSubscriptionKey === subscriptionKey && this.bookingSlotUnsubscriber) return;
  this.stopBookingSlotSubscription();
  if (!subscriptionKey || this.demoMode || !window.firebase || !firebase.firestore || !firebase.auth || !firebase.auth().currentUser) return;

  this.bookingSlotSubscriptionKey = subscriptionKey;
  this.bookingSlotUnsubscriber = firebase.firestore().collection('bookingSlots')
    .where('date', '==', date)
    .onSnapshot((snapshot) => {
      this.state.bookingSlots = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.state.bookingSlotsLoadedDate = date;
      this.state.bookingSlotsErrorDate = '';
      window.dispatchEvent(new CustomEvent('fn:booking-slots-changed', { detail: { courtId: courtId || null, date } }));
    }, (error) => {
      this.state.bookingSlotsErrorDate = date;
      console.error('Unable to subscribe to booking slot updates:', error.message);
      window.dispatchEvent(new CustomEvent('fn:bookings-error', { detail: error }));
    });
};

window.FNAdmin.subscribeToBookings = function() {
  if (this.demoMode || !window.firebase || !firebase.firestore) return;
  this.listeners.forEach((unsubscribe) => unsubscribe());
  this.listeners = [];
  const role = window.FNAdminAuth && window.FNAdminAuth.getRole();
  if (role === 'User' && window.FNUserPortal) window.FNUserPortal.subscribeToSelectedSlot();
  if (role === 'Owner') {
    const owner = window.FNAdminAuth.user;
    const courts = (this.state.courts || []).filter((court) => court.ownerId === owner.uid || court.owner === owner.name);
    courts.forEach((court) => {
      const unsubscribe = firebase.firestore().collection('bookings').where('courtId', '==', court.id).onSnapshot((snapshot) => {
        this.state.liveCollections = this.state.liveCollections || {};
        this.state.liveCollections.bookings = true;
        const otherBookings = (this.state.bookings || []).filter((booking) => booking.courtId !== court.id);
        this.state.bookings = otherBookings.concat(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        window.dispatchEvent(new CustomEvent('fn:bookings-changed', { detail: { courtId: court.id } }));
      }, (error) => {
        this.state.liveCollections = this.state.liveCollections || {};
        this.state.liveCollections.bookings = false;
        console.error('Unable to subscribe to owner bookings:', error.message);
        window.dispatchEvent(new CustomEvent('fn:bookings-error', { detail: error }));
      });
      this.listeners.push(unsubscribe);
    });
    return;
  }
  let query = firebase.firestore().collection('bookings');
  if (window.FNAdminAuth && window.FNAdminAuth.getRole() === 'User' && window.FNAdminAuth.user) {
    query = query.where('userId', '==', window.FNAdminAuth.user.uid);
  }
  const unsubscribe = query.onSnapshot((snapshot) => {
    this.state.liveCollections = this.state.liveCollections || {};
    this.state.liveCollections.bookings = true;
    this.state.bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    window.dispatchEvent(new CustomEvent('fn:bookings-changed'));
  }, (error) => {
    this.state.liveCollections = this.state.liveCollections || {};
    this.state.liveCollections.bookings = false;
    console.error('Unable to subscribe to booking updates:', error.message);
    window.dispatchEvent(new CustomEvent('fn:bookings-error', { detail: error }));
  });
  this.listeners.push(unsubscribe);
};

window.FNAdmin.ensureFirebase = function() {
  if (window.FNAdmin.demoMode) {
    console.info('Firebase is in demo mode. Replace the config values in js/firebase-config.js with your Firebase project settings to enable live backend access.');
    return false;
  }

  if (!window.firebase) {
    console.warn('Firebase SDK is not available yet. Check the CDN script tags in index.html.');
    return false;
  }

  if (firebase.apps && firebase.apps.length === 0) {
    try {
      firebase.initializeApp(window.FNAdmin.config);
    } catch (error) {
      console.warn('Firebase initialization failed:', error.message);
      window.FNAdmin.firebaseError = error;
      return false;
    }
  }

  return !!(firebase.apps && firebase.apps.length > 0);
};

window.FNAdmin.createBookingNotification = function(booking, title, message) {
  const targetUser = (this.state.users || []).find((user) => (booking.userId && user.id === booking.userId) || (booking.userEmail && user.email === booking.userEmail) || (booking.user && user.name === booking.user));
  const notification = {
    id: 'booking-notification-' + booking.id + '-' + Date.now(),
    bookingId: booking.id,
    title,
    message,
    target: 'Users',
    targetRole: 'User',
    courtId: booking.courtId || '',
    targetUserId: booking.userId || (targetUser && targetUser.id) || '',
    targetUserEmail: booking.userEmail || (targetUser && targetUser.email) || '',
    userId: booking.userId || (targetUser && targetUser.id) || '',
    date: new Date().toISOString(),
    createdAt: Date.now(),
    isRead: false,
    status: 'Sent',
    type: /confirm/i.test(title) ? 'booking_confirmed' : /cancel/i.test(title) ? 'booking_cancelled' : /reschedul/i.test(title) ? 'booking_rescheduled' : 'booking'
  };

  if (this.demoMode || !window.FNAdminData.isLive()) {
    this.state.notifications = [...(this.state.notifications || []), notification];
    window.dispatchEvent(new CustomEvent('fn:collection-changed', { detail: { collection: 'notifications' } }));
    return Promise.resolve(notification);
  }

  return window.FNAdminData.getCollection('notifications').doc(notification.id).set(notification, { merge: true }).then(() => notification);
};

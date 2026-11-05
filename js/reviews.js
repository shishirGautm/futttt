window.FNAdminReviews = window.FNAdminReviews || {};

window.FNAdminReviews.getAverageRating = function(courtName) {
  const reviews = (window.FNAdmin.state.reviews || []).filter((review) => review.court === courtName && review.status === 'Approved');
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
};

window.FNAdminReviews.updateCourtRating = function(courtName) {
  const court = (window.FNAdmin.state.courts || []).find((item) => item.name === courtName);
  if (!court) return Promise.resolve();
  const average = this.getAverageRating(courtName);
  court.rating = Number(average ? average.toFixed(1) : 0);
  const canPersist = !window.FNAdminData.isLive() || ['Admin', 'Manager', 'Super Admin'].includes(window.FNAdminAuth.getRole());
  return canPersist ? (window.FNAdminData.isLive() ? window.FNAdminData.save('courts', court.id, { rating: court.rating }) : Promise.resolve()) : Promise.resolve();
};

window.FNAdminReviews.createReview = function(data) {
  const review = {
    id: data.id || 'review-' + Date.now(),
    bookingId: data.bookingId || '',
    userId: data.userId || window.FNAdminAuth.user?.uid || '',
    user: data.user || 'Guest',
    userEmail: data.userEmail || '',
    court: data.court || 'Unknown court',
    courtId: data.courtId || '',
    rating: Number(data.rating || 0),
    review: String(data.review || '').trim(),
    date: data.date || new Date().toISOString().slice(0, 10),
    status: data.status || 'Pending'
  };

  if (!review.rating || review.rating < 1 || review.rating > 5) {
    throw new Error('Please select a rating between 1 and 5 stars.');
  }

  if (!review.review) {
    throw new Error('Please add a short review message.');
  }

  const existingIndex = (window.FNAdmin.state.reviews || []).findIndex((item) => item.bookingId === review.bookingId || (item.user === review.user && item.court === review.court && item.date === review.date));
  if (existingIndex >= 0) {
    window.FNAdmin.state.reviews[existingIndex] = { ...window.FNAdmin.state.reviews[existingIndex], ...review };
  } else {
    window.FNAdmin.state.reviews = [...(window.FNAdmin.state.reviews || []), review];
  }

  const ratingSave = this.updateCourtRating(review.court);

  if (window.FNAdminData.isLive()) {
    return Promise.all([window.FNAdminData.save('reviews', review.id, review), ratingSave]).then(() => {
      this.render();
      return review;
    });
  }

  this.render();
  return Promise.resolve(review);
};

window.FNAdminReviews.getRows = function() {
  return (window.FNAdmin.state.reviews || []).map((review) => [
    review.user,
    review.court,
    '★ '.repeat(Number(review.rating || 0)) + '☆ '.repeat(Math.max(0, 5 - Number(review.rating || 0))),
    review.review,
    review.date,
    window.FNAdminComponents.getStatusBadge(review.status),
    '<div class="action-group"><button class="icon-button" data-review-action="approve" data-review-id="' + review.id + '" title="Approve review"><i class="fa-solid fa-check"></i></button><button class="icon-button danger" data-review-action="delete" data-review-id="' + review.id + '" title="Delete review"><i class="fa-solid fa-trash"></i></button></div>'
  ]);
};

window.FNAdminReviews.handleAction = function(action, reviewId) {
  const review = (window.FNAdmin.state.reviews || []).find((item) => item.id === reviewId);
  if (!review) return;

  if (action === 'approve') {
    review.status = 'Approved';
    const ratingSave = this.updateCourtRating(review.court);
    const save = window.FNAdminData.isLive() ? Promise.all([window.FNAdminData.save('reviews', review.id, review), ratingSave]) : ratingSave;
    save.then(() => {
      this.render();
      window.FNAdminComponents.showToast('Review approved.', 'success');
    }).catch(() => window.FNAdminComponents.showToast('Approval could not be saved.', 'error'));
    return;
  }

  if (action === 'delete') {
    if (!window.confirm('Delete this review?')) return;
    const filtered = (window.FNAdmin.state.reviews || []).filter((item) => item.id !== reviewId);
    window.FNAdmin.state.reviews = filtered;
    const ratingSave = this.updateCourtRating(review.court);
    const remove = window.FNAdminData.isLive() ? window.FNAdminData.remove('reviews', reviewId) : Promise.resolve();
    Promise.all([remove, ratingSave]).then(() => {
      this.render();
      window.FNAdminComponents.showToast('Review deleted.', 'success');
    }).catch(() => window.FNAdminComponents.showToast('Review could not be deleted.', 'error'));
  }
};

window.FNAdminReviews.render = function() {
  const headers = ['User', 'Court', 'Rating', 'Review', 'Date', 'Status', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'reviewsTableContainer', emptyMessage: 'No reviews found.' });
  const target = document.getElementById('reviewsTableContainer');
  if (!target) return;
  target.querySelectorAll('[data-review-action]').forEach((button) => {
    button.addEventListener('click', () => this.handleAction(button.dataset.reviewAction, button.dataset.reviewId));
  });
};

window.FNAdminReviews.openReviewModal = function(booking) {
  const court = (window.FNAdmin.state.courts || []).find((item) => item.id === booking.courtId || item.name === booking.court) || { name: booking.court, id: booking.courtId || '' };
  const currentReview = (window.FNAdmin.state.reviews || []).find((item) => item.bookingId === booking.id || (item.user === booking.user && item.court === court.name && item.date === booking.date));
  const ratingValue = currentReview ? Number(currentReview.rating || 5) : 5;
  const reviewText = currentReview ? (currentReview.review || '') : '';
  const modalHtml = '<div class="panel__header"><div><p class="eyebrow">Rate your experience</p><h3>' + court.name + '</h3></div><button class="icon-button" data-close-modal="true" aria-label="Close review form"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<form id="reviewForm" class="review-form">' +
    '<div class="star-rating" aria-label="Choose a rating">' +
      [1, 2, 3, 4, 5].map((star) => '<button type="button" class="star-btn ' + (star <= ratingValue ? 'active' : '') + '" data-star="' + star + '" aria-label="Rate ' + star + ' out of 5"><i class="fa-solid fa-star"></i></button>').join('') +
    '</div>' +
    '<input type="hidden" id="reviewRating" value="' + ratingValue + '" />' +
    '<label>Review<textarea id="reviewMessage" rows="4" placeholder="Tell other players about your experience...">' + reviewText + '</textarea></label>' +
    '<div class="form-actions"><button type="button" class="btn btn-secondary" data-close-modal="true">Cancel</button><button type="submit" class="btn btn-primary">Submit review</button></div>' +
    '</form>';

  window.FNAdminComponents.openModal(modalHtml);
  const modal = document.getElementById('genericModal');
  const form = document.getElementById('reviewForm');
  const hiddenRating = document.getElementById('reviewRating');
  const reviewMessage = document.getElementById('reviewMessage');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const nextRating = Number(hiddenRating.value || 0);
      const message = (reviewMessage ? reviewMessage.value.trim() : '').replace(/<[^>]*>/g, '');
      const reviewData = {
        id: currentReview ? currentReview.id : 'review-' + Date.now(),
        bookingId: booking.id,
        userId: window.FNAdminAuth.user?.uid || booking.userId || '',
        user: booking.user || window.FNAdminAuth.user?.name || 'Guest',
        userEmail: window.FNAdminAuth.user?.email || booking.userEmail || '',
        court: court.name,
        courtId: court.id,
        rating: nextRating,
        review: message,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending'
      };

      window.FNAdminReviews.createReview(reviewData).then(() => {
        window.FNAdminComponents.closeModal();
        window.FNAdminComponents.showToast('Thank you! Your review has been submitted.', 'success');
        if (window.FNAdminAuth.getRole() === 'User') window.FNUserPortal.renderBookings();
      }).catch((error) => {
        window.FNAdminComponents.showToast(error.message || 'Unable to submit your review.', 'error');
      });
    });
  }

  modal?.querySelectorAll('.star-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = Number(button.dataset.star || 0);
      hiddenRating.value = String(selected);
      modal.querySelectorAll('.star-btn').forEach((starButton) => starButton.classList.toggle('active', Number(starButton.dataset.star || 0) <= selected));
    });
  });

  modal?.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', () => window.FNAdminComponents.closeModal()));
};

window.FNAdminReviews.init = function() {
  this.render();
};

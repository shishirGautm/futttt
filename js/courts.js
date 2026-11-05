window.FNAdminCourts = window.FNAdminCourts || {};

window.FNAdminCourts.getRows = function(searchTerm) {
  const courts = window.FNAdmin.state.courts;
  const query = (searchTerm || '').toLowerCase().trim();
  const filtered = !query ? courts : courts.filter((court) => [court.name, court.city, court.address].join(' ').toLowerCase().includes(query));

  return filtered.map((court) => [
    '<img class="court-thumb" src="' + ((court.images && court.images[0]) || 'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=120&q=80') + '" alt="' + court.name + '" />',
    '<div class="table-court"><div><strong>' + court.name + '</strong><small>' + court.owner + '</small></div></div>',
    court.city + '<br><small>' + court.address + '</small>',
    'NPR ' + Number(court.pricePerHour || 0).toLocaleString(),
    '<span>' + (court.rating || 4.5) + ' ★</span>',
    '<strong>' + (court.bookings || 0) + '</strong>',
    window.FNAdminComponents.getStatusBadge(court.status),
    '<div class="action-group"><button class="icon-button" data-court-action="view" data-court-id="' + court.id + '" title="View"><i class="fa-solid fa-eye"></i></button><button class="icon-button" data-court-action="edit" data-court-id="' + court.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button><button class="icon-button danger" data-court-action="delete" data-court-id="' + court.id + '" title="Delete"><i class="fa-solid fa-trash"></i></button></div>'
  ]);
};

window.FNAdminCourts.formatFieldValue = function(value) {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value !== 'object') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.error('Unable to format court field:', error);
    return String(value);
  }
};

window.FNAdminCourts.escapeHtml = function(value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
};

window.FNAdminCourts.viewDetails = function(court) {
  const fields = Object.entries(court).map(([key, value]) =>
    '<div class="court-record-field"><dt>' + this.escapeHtml(key) + '</dt><dd>' +
    this.escapeHtml(this.formatFieldValue(value)) + '</dd></div>'
  ).join('');
  window.FNAdminComponents.openModal(
    '<div class="panel__header"><div><p class="eyebrow">Live Firebase court record</p><h3>' + this.escapeHtml(court.name || 'Court details') + '</h3></div><button class="icon-button" data-close-modal="true" aria-label="Close court details"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<dl class="court-record-fields">' + fields + '</dl>'
  );
  document.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
};

window.FNAdminCourts.render = function() {
  const searchTerm = document.getElementById('courtSearch') ? document.getElementById('courtSearch').value : '';
  const target = document.getElementById('courtsTableContainer');
  if (!target) return;

  const headers = ['Image', 'Court', 'Location', 'Price', 'Rating', 'Bookings', 'Status', 'Actions'];
  const rows = this.getRows(searchTerm);
  const liveStatus = window.FNAdmin.state.liveCollections && window.FNAdmin.state.liveCollections.courts;
  const emptyMessage = liveStatus === false
    ? 'Firebase could not load the courts collection. Check this account’s Firestore read permissions and connection.'
    : liveStatus === true || window.FNAdmin.demoMode
      ? (searchTerm ? 'No courts match your search.' : 'No court documents are available in Firebase.')
      : 'Loading court records from Firebase.';
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'courtsTableContainer', emptyMessage });

  const modalButtons = target.querySelectorAll('.icon-button[data-court-action]');
  modalButtons.forEach((btn) => {
    btn.addEventListener('click', function() {
      const court = window.FNAdmin.state.courts.find((item) => item.id === this.dataset.courtId);
      if (!court) return;
      if (this.dataset.courtAction === 'edit') window.FNAdminCourts.openForm(court);
      if (this.dataset.courtAction === 'delete') window.FNAdminCourts.deleteCourt(court);
      if (this.dataset.courtAction === 'view') window.FNAdminCourts.viewDetails(court);
    });
  });
};

window.FNAdminCourts.deleteCourt = function(court) {
  if (!window.confirm('Delete "' + court.name + '" permanently?')) return;

  const index = window.FNAdmin.state.courts.findIndex((item) => item.id === court.id);
  const remove = window.FNAdminData.isLive()
    ? window.FNAdminData.remove('courts', court.id)
    : Promise.resolve();
  remove.then(() => {
    if (index >= 0) window.FNAdmin.state.courts.splice(index, 1);
    window.FNAdminComponents.showToast('Court deleted successfully.', 'success');
    window.dispatchEvent(new CustomEvent('fn:courts-changed', { detail: { deletedCourtId: court.id } }));
    try {
      window.FNAdminApp.renderAll();
    } catch (error) {
      console.error('Court was deleted, but the dashboard could not refresh:', error);
      window.FNAdminComponents.showToast('Court was deleted, but the dashboard could not refresh. Reload to see the latest data.', 'error');
    }
  }).catch((error) => {
    console.error('Unable to delete court:', error);
    window.FNAdminComponents.showToast('Court could not be deleted (' + (error.code || 'error') + '): ' + (error.message || 'permission denied.'), 'error');
  });
};

window.FNAdminCourts.openForm = function(court = null) {
  const owners = (window.FNAdmin.state.users || []).filter((user) => user.role === 'Owner');
  const currentOwnerId = court && court.ownerId ? court.ownerId : '';
  const ownerOptions = owners.length
    ? owners.map((owner) => '<option value="' + owner.id + '" ' + (owner.id === currentOwnerId || owner.name === (court && court.owner) ? 'selected' : '') + '>' + owner.name + ' (' + owner.email + ')</option>').join('')
    : '<option value="' + currentOwnerId + '" selected>' + ((court && court.owner) || 'No owners found') + '</option>';
  const formHtml = `
    <div class="panel__header"><div><p class="eyebrow">Court</p><h3>${court ? 'Edit Court' : 'Add Court'}</h3></div><button class="icon-button" data-close-modal="true"><i class="fa-solid fa-xmark"></i></button></div>
    <form id="courtForm">
      <div class="field-grid">
        <label>Court Name<input name="name" value="${court ? court.name : ''}" required /></label>
        <label>Court Owner<select name="ownerId" required>${ownerOptions}</select></label>
        <label>Futsal Photo<input name="photo" type="file" accept="image/*" /></label>
        <label>Address<input name="address" value="${court ? court.address : ''}" required /></label>
        <label>City<input name="city" value="${court ? court.city : ''}" required /></label>
        <label>District<input name="district" value="${court ? court.district : ''}" /></label>
        <label>Province<input name="province" value="${court ? court.province : ''}" /></label>
        <label>Contact Number<input name="contactNumber" value="${court ? court.contactNumber : ''}" /></label>
        <label>Price Per Hour<input name="pricePerHour" type="number" value="${court ? court.pricePerHour : 2200}" /></label>
        <label>Opening Time<input name="openingTime" value="${court ? court.openingTime : '08:00'}" /></label>
        <label>Closing Time<input name="closingTime" value="${court ? court.closingTime : '22:00'}" /></label>
        <label>Type<select name="type"><option ${court && court.type === 'Indoor' ? 'selected' : ''}>Indoor</option><option ${court && court.type === 'Outdoor' ? 'selected' : ''}>Outdoor</option></select></label>
        <label>Status<select name="status"><option ${court && court.status === 'active' ? 'selected' : ''} value="active">Active</option><option ${court && court.status === 'inactive' ? 'selected' : ''} value="inactive">Inactive</option></select></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-close-modal="true">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Court</button>
      </div>
    </form>
  `;

  window.FNAdminComponents.openModal(formHtml);
  const modal = document.getElementById('genericModal');
  if (modal) {
    modal.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
  }
  const form = document.getElementById('courtForm');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
      }
      const formData = new FormData(form);
      const photo = formData.get('photo');
      const ownerId = formData.get('ownerId');
      const ownerProfile = (window.FNAdmin.state.users || []).find((user) => user.id === ownerId);
      const newCourt = {
        id: court ? court.id : 'court-' + Date.now(),
        name: formData.get('name'),
        owner: ownerProfile ? ownerProfile.name : (court ? court.owner : ''),
        ownerId,
        address: formData.get('address'),
        city: formData.get('city'),
        district: formData.get('district') || 'Kathmandu',
        province: formData.get('province') || 'Bagmati',
        contactNumber: formData.get('contactNumber') || '+977-9800000000',
        pricePerHour: Number(formData.get('pricePerHour') || 2200),
        openingTime: formData.get('openingTime') || '08:00',
        closingTime: formData.get('closingTime') || '22:00',
        type: formData.get('type') || 'Indoor',
        status: formData.get('status') || 'active',
        images: court && Array.isArray(court.images) ? court.images : [],
        bookingCount: 0,
        rating: 4.7
      };

      const saveCourt = (imageUrl) => {
        if (imageUrl) newCourt.images = [imageUrl];
        if (court) {
          const index = window.FNAdmin.state.courts.findIndex((item) => item.id === court.id);
          if (index >= 0) window.FNAdmin.state.courts[index] = { ...window.FNAdmin.state.courts[index], ...newCourt };
        } else {
          window.FNAdmin.state.courts.push(newCourt);
        }
        return window.FNAdmin.syncCourt(newCourt);
      };

      const withTimeout = (promise, message) => new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(message)), 15000);
        promise.then(resolve, reject).finally(() => clearTimeout(timeout));
      });
      const upload = photo && photo.size
        ? withTimeout(window.FNAdminData.uploadAsset(photo, 'courts/' + newCourt.id + '/' + photo.name), 'Firebase Storage is not ready. Open the Firebase Console for the footshal project, select Storage, and click Get started.')
        : Promise.resolve('');
      upload.then(saveCourt).then(() => {
        window.FNAdminComponents.closeModal();
        window.FNAdminApp.renderAll();
        window.FNAdminComponents.showToast('Court saved successfully.', 'success');
      }).catch((error) => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Save Court';
        }
        console.error('Unable to save court:', error);
        const message = error && error.code === 'permission-denied'
          ? 'Permission denied. Make sure this Firebase account is registered in the admins collection.'
          : error && error.message
            ? error.message
            : 'Check Firebase Storage and Firestore configuration.';
        window.FNAdminComponents.showToast('Court could not be saved: ' + message, 'error');
      });
    });
  }
};

window.FNAdminCourts.init = function() {
  const input = document.getElementById('courtSearch');
  if (input) input.addEventListener('input', () => this.render());

  const addButton = document.getElementById('addCourtBtn');
  if (addButton) addButton.addEventListener('click', () => this.openForm());

  const viewButton = document.getElementById('toggleCourtViewBtn');
  if (viewButton) {
    viewButton.addEventListener('click', () => {
      const current = viewButton.textContent.trim();
      viewButton.innerHTML = current.includes('Card') ? '<i class="fa-solid fa-table-cells"></i> Table View' : '<i class="fa-solid fa-table-cells"></i> Card View';
      window.FNAdminComponents.showToast('Court layout toggled.', 'success');
    });
  }

  this.render();
};

window.FNAdminTournaments = window.FNAdminTournaments || {};

window.FNAdminTournaments.getFilteredTournaments = function() {
  const searchValue = (document.getElementById('tournamentSearch')?.value || '').trim().toLowerCase();
  const filterStatus = document.getElementById('tournamentStatusFilter')?.value || 'all';

  return (window.FNAdmin.state.tournaments || []).filter((tournament) => {
    const matchesSearch = !searchValue || [tournament.name, tournament.location, tournament.courtName, tournament.status, tournament.description || ''].join(' ').toLowerCase().includes(searchValue);
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
};

window.FNAdminTournaments.getStatusClass = function(status) {
  const normalized = String(status || 'Open').toLowerCase();
  if (normalized === 'closed') return 'status-closed';
  if (normalized === 'draft') return 'status-draft';
  return 'status-open';
};

window.FNAdminTournaments.getCardMarkup = function(tournament) {
  const priceLabel = 'NPR ' + Number(tournament.fee || 0).toLocaleString();
  const prizeLabel = 'NPR ' + Number(tournament.prize || 0).toLocaleString();
  const statusText = tournament.status || 'Open';
  const registeredTeams = Array.isArray(tournament.participants) ? tournament.participants.filter((participant) => !['Cancelled', 'Rejected'].includes(participant.registrationStatus)).length : 0;

  return `
    <article class="tournament-card ${this.getStatusClass(statusText)}">
      <div class="tournament-card__header">
        <div>
          <p class="eyebrow">Tournament</p>
          <h3>${tournament.name || 'Untitled tournament'}</h3>
        </div>
        <span class="status-badge ${String(statusText).toLowerCase()}">${statusText}</span>
      </div>

      <div class="tournament-card__meta">
        <div><i class="fa-solid fa-location-dot"></i><span>${tournament.courtName || tournament.location || 'Ground not set'}</span></div>
        <div><i class="fa-regular fa-calendar"></i><span>${tournament.startDate || 'TBA'} - ${tournament.endDate || 'TBA'}</span></div>
      </div>

      <p class="tournament-card__description">${tournament.description || 'Competitive futsal tournament for local and community teams.'}</p>

      <div class="tournament-card__stats">
        <div>
          <small>Entry fee</small>
          <strong>${priceLabel}</strong>
        </div>
        <div>
          <small>Prize pool</small>
          <strong>${prizeLabel}</strong>
        </div>
        <div>
          <small>Teams</small>
          <strong>${tournament.maxTeams || 0}</strong>
        </div>
        <div>
          <small>Registered</small>
          <strong>${registeredTeams}</strong>
        </div>
      </div>

      <div class="tournament-card__actions">
        <button class="icon-button" data-tournament-action="view" data-tournament-id="${tournament.id}" title="View details"><i class="fa-solid fa-eye"></i></button>
        <button class="icon-button" data-tournament-action="edit" data-tournament-id="${tournament.id}" title="Edit tournament"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-button" data-tournament-action="toggle-status" data-tournament-id="${tournament.id}" title="Toggle status"><i class="fa-solid fa-arrows-rotate"></i></button>
        <button class="icon-button danger" data-tournament-action="delete" data-tournament-id="${tournament.id}" title="Delete tournament"><i class="fa-solid fa-trash"></i></button>
      </div>
    </article>
  `;
};

window.FNAdminTournaments.render = function() {
  const container = document.getElementById('tournamentsTableContainer');
  if (!container) return;

  const tournaments = this.getFilteredTournaments();

  if (!tournaments.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-trophy"></i><h3>No tournaments</h3><p>No tournaments match your search or filter.</p></div>';
    return;
  }

  container.innerHTML = '<div class="tournament-card-grid">' + tournaments.map((tournament) => this.getCardMarkup(tournament)).join('') + '</div>';

  container.querySelectorAll('[data-tournament-action]').forEach((button) => {
    button.addEventListener('click', () => this.handleAction(button.dataset.tournamentAction, button.dataset.tournamentId));
  });
};

window.FNAdminTournaments.openForm = function(tournament = null) {
  const courts = (window.FNAdmin.state.courts || []).filter((court) => court.status === 'active');
  const defaultValues = tournament || {
    id: 'tournament-' + Date.now(),
    name: '',
    courtId: '',
    courtName: '',
    location: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    fee: 1500,
    prize: 20000,
    maxTeams: 8,
    status: 'Open',
    description: ''
  };
  const courtOptions = courts.length
    ? '<option value="">Select a futsal ground</option>' + courts.map((court) => '<option value="' + court.id + '" ' + (court.id === defaultValues.courtId ? 'selected' : '') + '>' + court.name + ' - ' + [court.address, court.city].filter(Boolean).join(', ') + '</option>').join('')
    : '<option value="">No active futsal grounds available</option>';

  const formHtml = `
    <div class="panel__header">
      <div>
        <p class="eyebrow">Tournament</p>
        <h3>${tournament ? 'Edit Tournament' : 'Create Tournament'}</h3>
      </div>
      <button class="icon-button" data-close-modal="true" aria-label="Close modal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form id="tournamentForm">
      <div class="field-grid">
        <label>Name<input name="name" value="${(tournament && tournament.name) || ''}" required /></label>
        <label>Futsal ground<select name="courtId" required>${courtOptions}</select></label>
        <label>Start date<input name="startDate" type="date" value="${(tournament && tournament.startDate) || defaultValues.startDate}" required /></label>
        <label>End date<input name="endDate" type="date" value="${(tournament && tournament.endDate) || defaultValues.endDate}" required /></label>
        <label>Entry fee<input name="fee" type="number" min="0" value="${(tournament && tournament.fee) || defaultValues.fee}" required /></label>
        <label>Prize pool<input name="prize" type="number" min="0" value="${(tournament && tournament.prize) || defaultValues.prize}" required /></label>
        <label>Max teams<input name="maxTeams" type="number" min="2" value="${(tournament && tournament.maxTeams) || defaultValues.maxTeams}" required /></label>
        <label>Status<select name="status"><option value="Open" ${((tournament && tournament.status) || defaultValues.status) === 'Open' ? 'selected' : ''}>Open</option><option value="Closed" ${((tournament && tournament.status) || defaultValues.status) === 'Closed' ? 'selected' : ''}>Closed</option><option value="Draft" ${((tournament && tournament.status) || defaultValues.status) === 'Draft' ? 'selected' : ''}>Draft</option></select></label>
        <label style="grid-column: 1 / -1;">Description<textarea name="description" placeholder="Tournament summary, rules, or notes...">${(tournament && tournament.description) || ''}</textarea></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-close-modal="true">Cancel</button>
        <button type="submit" class="btn btn-primary">Save tournament</button>
      </div>
    </form>
  `;

  window.FNAdminComponents.openModal(formHtml);

  document.querySelectorAll('[data-close-modal="true"]').forEach((button) => {
    button.addEventListener('click', window.FNAdminComponents.closeModal);
  });

  const form = document.getElementById('tournamentForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const selectedCourt = (window.FNAdmin.state.courts || []).find((court) => court.id === formData.get('courtId'));
    const payload = {
      id: (tournament && tournament.id) || 'tournament-' + Date.now(),
      name: String(formData.get('name') || '').trim(),
      courtId: selectedCourt ? selectedCourt.id : '',
      courtName: selectedCourt ? selectedCourt.name : '',
      location: selectedCourt ? [selectedCourt.address, selectedCourt.city, selectedCourt.district, selectedCourt.province].filter(Boolean).join(', ') : '',
      startDate: String(formData.get('startDate') || '').trim(),
      endDate: String(formData.get('endDate') || '').trim(),
      fee: Number(formData.get('fee') || 0),
      prize: Number(formData.get('prize') || 0),
      maxTeams: Number(formData.get('maxTeams') || 0),
      status: String(formData.get('status') || 'Open'),
      description: String(formData.get('description') || '').trim() || 'Competitive futsal tournament for local and community teams.'
    };

    if (!payload.name || !payload.courtId || !payload.startDate || !payload.endDate) {
      window.FNAdminComponents.showToast('Please select a futsal ground and complete all required fields.', 'error');
      return;
    }

    const collection = window.FNAdmin.state.tournaments || [];
    const index = collection.findIndex((item) => item.id === payload.id);
    if (index >= 0) {
      collection[index] = { ...collection[index], ...payload };
    } else {
      collection.unshift(payload);
    }

    const savePromise = window.FNAdminData.isLive()
      ? window.FNAdminData.save('tournaments', payload.id, payload)
      : Promise.resolve(payload);

    savePromise.then(() => {
      window.FNAdminComponents.closeModal();
      this.render();
      window.FNAdminComponents.showToast(tournament ? 'Tournament updated successfully.' : 'Tournament created successfully.', 'success');
    }).catch((error) => {
      console.error('Unable to save tournament:', error);
      window.FNAdminComponents.showToast('Tournament could not be saved. Check Firebase configuration.', 'error');
    });
  });
};

window.FNAdminTournaments.handleAction = function(action, tournamentId) {
  const tournament = (window.FNAdmin.state.tournaments || []).find((item) => item.id === tournamentId);
  if (!tournament) return;

  if (action === 'view') {
    const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
    const registrationMarkup = participants.length
      ? '<div class="tournament-registrations"><h4>Registered teams (' + participants.length + ')</h4>' + participants.map((participant, index) => '<article class="tournament-registration"><div><strong>' + (participant.teamName || 'Team ' + (index + 1)) + '</strong><span>Captain: ' + (participant.captainName || participant.name || 'Not provided') + '</span><span>Status: ' + (participant.registrationStatus || 'Confirmed') + '</span></div><div><span>Contact: ' + (participant.contactNumber || participant.email || 'Not provided') + '</span><span>Squad: ' + (participant.squadSize || 'Not provided') + '</span>' + (participant.registrationStatus === 'Pending' ? '<div class="tournament-registration-actions"><button class="btn btn-primary tournament-registration-action" type="button" data-registration-action="confirm" data-participant-index="' + index + '">Confirm</button><button class="btn btn-secondary tournament-registration-action" type="button" data-registration-action="reject" data-participant-index="' + index + '">Reject</button></div>' : '') + '</div></article>').join('') + '</div>'
      : '<div class="tournament-registrations"><h4>Registered teams</h4><p class="muted">No teams have joined this tournament yet.</p></div>';
    const details = `
      <div class="panel__header">
        <div><p class="eyebrow">Tournament details</p><h3>${tournament.name}</h3></div>
        <button class="icon-button" data-close-modal="true" aria-label="Close details"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="detail-list">
        <div><span>Location</span><strong>${tournament.location || 'Not set'}</strong></div>
        <div><span>Dates</span><strong>${tournament.startDate || 'TBA'} to ${tournament.endDate || 'TBA'}</strong></div>
        <div><span>Entry fee</span><strong>NPR ${Number(tournament.fee || 0).toLocaleString()}</strong></div>
        <div><span>Prize pool</span><strong>NPR ${Number(tournament.prize || 0).toLocaleString()}</strong></div>
        <div><span>Teams</span><strong>${tournament.maxTeams || 0}</strong></div>
        <div><span>Status</span><strong>${tournament.status || 'Open'}</strong></div>
        <div style="grid-column: 1 / -1;"><span>Description</span><strong>${tournament.description || 'No description provided.'}</strong></div>
      </div>
      ${registrationMarkup}
    `;
    window.FNAdminComponents.openModal(details);
    document.querySelectorAll('[data-close-modal="true"]').forEach((button) => button.addEventListener('click', window.FNAdminComponents.closeModal));
    document.querySelectorAll('.tournament-registration-action').forEach((button) => button.addEventListener('click', () => this.updateRegistration(tournament, Number(button.dataset.participantIndex), button.dataset.registrationAction)));
    return;
  }

  if (action === 'edit') {
    this.openForm(tournament);
    return;
  }

  if (action === 'toggle-status') {
    const nextStatus = tournament.status === 'Open' ? 'Closed' : 'Open';
    const updated = { ...tournament, status: nextStatus };
    const savePromise = window.FNAdminData.isLive() ? window.FNAdminData.save('tournaments', tournament.id, updated) : Promise.resolve(updated);
    savePromise.then(() => {
      const index = window.FNAdmin.state.tournaments.findIndex((item) => item.id === tournament.id);
      if (index >= 0) window.FNAdmin.state.tournaments[index] = updated;
      this.render();
      window.FNAdminComponents.showToast('Tournament status updated.', 'success');
    }).catch((error) => {
      console.error('Unable to toggle tournament status:', error);
      window.FNAdminComponents.showToast('Status could not be updated.', 'error');
    });
    return;
  }

  if (action === 'delete') {
    if (!window.confirm('Delete tournament "' + tournament.name + '" permanently?')) return;
    const savePromise = window.FNAdminData.isLive() ? window.FNAdminData.remove('tournaments', tournament.id) : Promise.resolve();
    savePromise.then(() => {
      const index = window.FNAdmin.state.tournaments.findIndex((item) => item.id === tournament.id);
      if (index >= 0) window.FNAdmin.state.tournaments.splice(index, 1);
      this.render();
      window.FNAdminComponents.showToast('Tournament deleted successfully.', 'success');
    }).catch((error) => {
      console.error('Unable to delete tournament:', error);
      window.FNAdminComponents.showToast('Tournament could not be deleted.', 'error');
    });
  }
};

window.FNAdminTournaments.updateRegistration = function(tournament, participantIndex, action) {
  const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
  const participant = participants[participantIndex];
  if (!participant) return;
  const nextStatus = action === 'confirm' ? 'Confirmed' : 'Rejected';
  const updatedParticipants = participants.map((item, index) => index === participantIndex ? { ...item, registrationStatus: nextStatus, reviewedAt: new Date().toISOString() } : item);
  const updatedTournament = { ...tournament, participants: updatedParticipants };
  const notification = {
    id: 'tournament-' + tournament.id + '-' + (participant.userId || participant.email || participantIndex) + '-' + Date.now(),
    userId: participant.userId || null,
    targetUserId: participant.userId || null,
    targetUserEmail: participant.email || null,
    title: 'Tournament registration ' + nextStatus.toLowerCase(),
    message: 'Your team ' + (participant.teamName || 'registration') + ' has been ' + nextStatus.toLowerCase() + ' for ' + (tournament.name || 'the tournament') + '.',
    target: 'Users',
    type: 'tournament',
    tournamentId: tournament.id,
    date: new Date().toISOString(),
    status: 'Sent'
  };
  const saveTournament = window.FNAdminData.isLive() ? window.FNAdminData.save('tournaments', tournament.id, updatedTournament) : Promise.resolve(updatedTournament);
  return saveTournament.then(() => window.FNAdminData.save('notifications', notification.id, notification)).then(() => {
    const index = window.FNAdmin.state.tournaments.findIndex((item) => item.id === tournament.id);
    if (index >= 0) window.FNAdmin.state.tournaments[index] = updatedTournament;
    window.FNAdminComponents.closeModal();
    this.render();
    window.FNAdminComponents.showToast('Registration ' + nextStatus.toLowerCase() + ' and user notified.', 'success');
  }).catch((error) => {
    console.error('Unable to update tournament registration:', error);
    window.FNAdminComponents.showToast('Registration could not be updated.', 'error');
  });
};

window.FNAdminTournaments.bindEvents = function() {
  const searchInput = document.getElementById('tournamentSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => this.render());
  }

  const statusFilter = document.getElementById('tournamentStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => this.render());
  }

  const addButton = document.getElementById('addTournamentBtn');
  if (addButton) {
    addButton.addEventListener('click', () => this.openForm());
  }
};

window.FNAdminTournaments.init = function() {
  this.bindEvents();
  this.render();
};

window.FNAdminMatches = window.FNAdminMatches || {};

window.FNAdminMatches.getRows = function() {
  return window.FNAdmin.state.matches.map((match) => [
    match.teamA,
    match.teamB,
    match.court,
    match.date,
    match.time,
    match.score,
    window.FNAdminComponents.getStatusBadge(match.status),
    '<div class="action-group"><button class="icon-button" title="View"><i class="fa-solid fa-eye"></i></button><button class="icon-button" title="Edit"><i class="fa-solid fa-pen"></i></button></div>'
  ]);
};

window.FNAdminMatches.render = function() {
  const headers = ['Team A', 'Team B', 'Court', 'Date', 'Time', 'Score', 'Status', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'matchesTableContainer', emptyMessage: 'No matches scheduled.' });
};

window.FNAdminMatches.init = function() {
  this.render();
};

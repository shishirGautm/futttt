window.FNAdminTeams = window.FNAdminTeams || {};

window.FNAdminTeams.getRows = function() {
  return window.FNAdmin.state.teams.map((team) => [
    team.name,
    team.captain,
    team.members,
    team.location,
    team.matchesPlayed,
    team.wins + ' / ' + team.losses,
    window.FNAdminComponents.getStatusBadge(team.status),
    '<div class="action-group"><button class="icon-button" title="View"><i class="fa-solid fa-eye"></i></button><button class="icon-button" title="Edit"><i class="fa-solid fa-pen"></i></button></div>'
  ]);
};

window.FNAdminTeams.render = function() {
  const headers = ['Team', 'Captain', 'Members', 'Location', 'Played', 'Record', 'Status', 'Actions'];
  const rows = this.getRows();
  window.FNAdminComponents.renderTable({ headers, rows, targetId: 'teamsTableContainer', emptyMessage: 'No teams found.' });
};

window.FNAdminTeams.init = function() {
  this.render();
};

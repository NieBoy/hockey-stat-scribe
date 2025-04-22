
// Re-export all team membership related functions with specific naming to avoid conflicts
export { addTeamMember } from './membershipService';
export { removeTeamMember, deleteTeamMember } from './memberDeletionService';
export { updateTeamMemberInfo } from './memberUpdateService';
export { deleteTeamAndAllData } from './teamDeletion';

// Re-export from other team service files
export * from './playerManagement';
export * from './teamCreation';
export * from './teamQueries';
export * from './lineup';  // Updated to use the new lineup path

// Export with specific naming to avoid conflicts
export {
  getTeamMembers as getTeamMembersList
} from './memberQueryService';

// Export invitationService functions from new location
export {
  sendTeamInvitations,
  acceptInvitation,
  ensureInvitationsTableExists
} from './invitations';

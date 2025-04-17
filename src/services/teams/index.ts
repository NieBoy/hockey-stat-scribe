
// Re-export all team membership related functions with specific naming to avoid conflicts
export { addTeamMember } from './membershipService';
export { removeTeamMember } from './memberDeletionService';
export { updateTeamMemberInfo } from './memberUpdateService';

// Re-export from other team service files
export * from './playerManagement';
export * from './teamCreation';
export * from './teamQueries';
export * from './lineupManagement';

// Export with specific naming to avoid conflicts
export {
  getTeamMembers as getTeamMembersList
} from './memberQueryService';

// Export invitationService with a rename to avoid conflict
export {
  sendTeamInvitations as sendInvitationsToTeamMembers,
  acceptInvitation
} from './invitationService';

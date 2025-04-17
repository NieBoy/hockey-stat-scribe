
// Re-export all team membership related functions with specific naming to avoid conflicts
export { 
  addTeamMember,
  removeTeamMember,
  updateTeamMemberInfo 
} from './membershipService';

export {
  updateMemberRole,
  updateMemberPosition
} from './memberUpdateService';

export {
  getTeamMembers as getTeamMembersList
} from './memberQueryService';

export {
  deleteTeamMember
} from './memberDeletionService';

// Re-export from other team service files
export * from './playerManagement';
export * from './teamCreation';
export * from './teamQueries';
export * from './lineupManagement';

// Export invitationService with a rename to avoid conflict
export {
  sendTeamInvitations as sendInvitationsToTeamMembers,
  acceptInvitation
} from './invitationService';

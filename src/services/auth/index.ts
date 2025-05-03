
// Re-export all auth services for backwards compatibility
export { getCurrentUser, signIn, signUp, signOut } from './userAuthService';
export { addRoleToUser, removeRoleFromUser } from './userRoleService';

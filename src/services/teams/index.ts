
// This file serves as the main entry point for teams-related services
// It re-exports all functions from the modules to maintain the existing API

import { getTeams, getTeamById } from './teamQueries';
import { createTeam } from './teamCreation';
import { 
  addPlayerToTeam, 
  removePlayerFromTeam, 
  getTeamMembers, 
  updatePlayerInfo, 
  sendTeamInvitations 
} from './playerManagement';
import { updateTeamLineup } from './lineupManagement';

export {
  getTeams,
  getTeamById,
  createTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
  updateTeamLineup,
  getTeamMembers,
  updatePlayerInfo,
  sendTeamInvitations
};

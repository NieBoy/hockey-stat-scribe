
export function transform(games: any[]): any[] {
  return games.map(game => transformSingle(game));
}

export function transformSingle(game: any): any {
  if (!game) return null;

  return {
    id: game.id,
    date: game.date,
    location: game.location,
    periods: game.periods,
    current_period: game.current_period,
    is_active: game.is_active,
    opponent_name: game.opponent_name,
    homeTeam: {
      id: game.home_team_id?.id,
      name: game.home_team_id?.name,
      players: []
    },
    // Only include awayTeam if it exists
    ...(game.away_team_id ? {
      awayTeam: {
        id: game.away_team_id?.id,
        name: game.away_team_id?.name,
        players: []
      }
    } : { 
      awayTeam: null
    })
  };
}

// Add the missing transformTeamForCreate function
export const transformTeamForCreate = (team: any) => {
  if (!team) return null;
  
  return {
    id: team.id,
    name: team.name
  };
};

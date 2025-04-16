
import { Game, Team, User, StatTracker, GameStat, PlayerStat, Organization, UserRole } from '@/types';

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Northside Hockey Association',
    teams: [],
    admins: []
  },
  {
    id: '2',
    name: 'Southside Hockey League',
    teams: [],
    admins: []
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Coach Smith',
    email: 'coach@example.com',
    role: ['coach', 'admin'],
    isAdmin: true,
    organizations: [mockOrganizations[0]]
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: ['player']
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: ['player']
  },
  {
    id: '4',
    name: 'John Davis',
    email: 'john@example.com',
    role: ['parent'],
    children: [
      {
        id: '5',
        name: 'Alex Davis',
        email: '',
        role: ['player'],
      }
    ]
  },
  {
    id: '6',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: ['admin'],
    isAdmin: true,
    organizations: [mockOrganizations[0], mockOrganizations[1]]
  }
];

// Update mockOrganizations with admins reference
mockOrganizations[0].admins = [mockUsers[0], mockUsers[5]];
mockOrganizations[1].admins = [mockUsers[5]];

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Ice Hawks',
    organizationId: '1',
    players: [mockUsers[1], mockUsers[2]],
    coaches: [mockUsers[0]],
    parents: [mockUsers[3]]
  },
  {
    id: '2',
    name: 'Polar Bears',
    organizationId: '1',
    players: [
      {
        id: '5',
        name: 'Alex Davis',
        email: '',
        role: ['player'],
      }
    ],
    coaches: [],
    parents: [mockUsers[3]]
  }
];

// Update organization with teams
mockOrganizations[0].teams = mockTeams;

export const mockStatTrackers: StatTracker[] = [
  {
    user: mockUsers[3], // John Davis (parent)
    statTypes: ['goals', 'assists']
  },
  {
    user: mockUsers[0], // Coach Smith
    statTypes: ['faceoffs']
  }
];

export const mockGames: Game[] = [
  {
    id: '1',
    date: new Date('2023-04-15T19:00:00'),
    homeTeam: mockTeams[0],
    awayTeam: mockTeams[1],
    location: 'City Ice Arena',
    statTrackers: mockStatTrackers,
    periods: 3,
    currentPeriod: 0,
    isActive: false,
    stats: []
  }
];

export const mockGameStats: GameStat[] = [
  {
    id: '1',
    gameId: '1',
    playerId: '2', // Mike Johnson
    statType: 'goals',
    period: 1,
    timestamp: new Date(),
    value: 1,
    details: 'Top shelf goal from the slot'
  },
  {
    id: '2',
    gameId: '1',
    playerId: '3', // Sarah Williams
    statType: 'assists',
    period: 1,
    timestamp: new Date(),
    value: 1,
    details: 'Clean pass to Mike for the goal'
  },
  {
    id: '3',
    gameId: '1',
    playerId: '2', // Mike Johnson
    statType: 'faceoffs',
    period: 2,
    timestamp: new Date(),
    value: 1,
    details: 'Offensive zone faceoff win'
  }
];

export const mockPlayerStats: PlayerStat[] = [
  {
    playerId: '2', // Mike Johnson
    statType: 'goals',
    value: 5,
    gamesPlayed: 3
  },
  {
    playerId: '2', // Mike Johnson
    statType: 'assists',
    value: 3,
    gamesPlayed: 3
  },
  {
    playerId: '3', // Sarah Williams
    statType: 'goals',
    value: 2,
    gamesPlayed: 3
  },
  {
    playerId: '3', // Sarah Williams
    statType: 'assists',
    value: 4,
    gamesPlayed: 3
  }
];

// Current mock user (simulating logged in user)
export const currentUser: User = mockUsers[0]; // Coach Smith with admin role


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          organization_id: string
          logo_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
          logo_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
          logo_url?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          position?: string
          line_number?: number
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: string
          position?: string
          line_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          position?: string
          line_number?: number
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          home_team_id: string
          away_team_id: string
          date: string
          location: string
          periods: number
          current_period: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          home_team_id: string
          away_team_id: string
          date: string
          location: string
          periods: number
          current_period?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          home_team_id?: string
          away_team_id?: string
          date?: string
          location?: string
          periods?: number
          current_period?: number
          is_active?: boolean
          created_at?: string
        }
      }
      stat_trackers: {
        Row: {
          id: string
          game_id: string
          user_id: string
          stat_type: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          stat_type: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          stat_type?: string
          created_at?: string
        }
      }
      game_stats: {
        Row: {
          id: string
          game_id: string
          player_id: string
          stat_type: string
          period: number
          timestamp: string
          value: number
          details?: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          stat_type: string
          period: number
          timestamp: string
          value: number
          details?: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          stat_type?: string
          period?: number
          timestamp?: string
          value?: number
          details?: string
          created_at?: string
        }
      }
      player_stats: {
        Row: {
          id: string
          player_id: string
          stat_type: string
          value: number
          games_played: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          stat_type: string
          value: number
          games_played: number
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          stat_type?: string
          value?: number
          games_played?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

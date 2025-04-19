
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
      game_events: {
        Row: {
          id: string
          game_id: string
          event_type: string
          period: number
          team_type: string
          timestamp: string
          created_at: string
          created_by?: string
          time_in_period?: unknown
        }
        Insert: {
          id?: string
          game_id: string
          event_type: string
          period: number
          team_type: string
          timestamp?: string
          created_at?: string
          created_by?: string
          time_in_period?: unknown
        }
        Update: {
          id?: string
          game_id?: string
          event_type?: string
          period?: number
          team_type?: string
          timestamp?: string
          created_at?: string
          created_by?: string
          time_in_period?: unknown
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_player_user: {
        Args: { player_name: string, player_email?: string }
        Returns: string
      }
      create_user_bypass_rls: {
        Args: { user_id: string, user_name: string, user_email: string }
        Returns: Json
      }
      get_game_events: {
        Args: { p_game_id: string }
        Returns: Database['public']['Tables']['game_events']['Row'][]
      }
      delete_game_event: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      create_game_event: {
        Args: { 
          p_game_id: string, 
          p_event_type: string, 
          p_period: number, 
          p_team_type: string 
        }
        Returns: { 
          id: string, 
          game_id: string, 
          event_type: string, 
          period: number, 
          team_type: string 
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

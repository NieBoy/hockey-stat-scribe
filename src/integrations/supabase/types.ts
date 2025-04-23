export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_players: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_opponent: boolean | null
          jersey_number: string | null
          player_id: string
          role: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_opponent?: boolean | null
          jersey_number?: string | null
          player_id: string
          role: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_opponent?: boolean | null
          jersey_number?: string | null
          player_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_players_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "game_events"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          created_at: string
          created_by: string | null
          details: Json | null
          event_type: string
          game_id: string
          id: string
          period: number
          team_type: string
          time_in_period: unknown | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          event_type: string
          game_id: string
          id?: string
          period: number
          team_type: string
          time_in_period?: unknown | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          event_type?: string
          game_id?: string
          id?: string
          period?: number
          team_type?: string
          time_in_period?: unknown | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_stats: {
        Row: {
          created_at: string
          details: string | null
          game_id: string
          id: string
          period: number
          player_id: string
          stat_type: string
          timestamp: string
          value: number
        }
        Insert: {
          created_at?: string
          details?: string | null
          game_id: string
          id?: string
          period: number
          player_id: string
          stat_type: string
          timestamp: string
          value: number
        }
        Update: {
          created_at?: string
          details?: string | null
          game_id?: string
          id?: string
          period?: number
          player_id?: string
          stat_type?: string
          timestamp?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_stats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_team_id: string | null
          created_at: string
          current_period: number
          date: string
          home_team_id: string
          id: string
          is_active: boolean
          location: string
          opponent_name: string | null
          periods: number
        }
        Insert: {
          away_team_id?: string | null
          created_at?: string
          current_period?: number
          date: string
          home_team_id: string
          id?: string
          is_active?: boolean
          location: string
          opponent_name?: string | null
          periods?: number
        }
        Update: {
          away_team_id?: string | null
          created_at?: string
          current_period?: number
          date?: string
          home_team_id?: string
          id?: string
          is_active?: boolean
          location?: string
          opponent_name?: string | null
          periods?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_parents: {
        Row: {
          created_at: string
          id: string
          parent_id: string | null
          player_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id?: string | null
          player_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_parents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          created_at: string
          games_played: number
          id: string
          player_id: string
          stat_type: string
          value: number
        }
        Insert: {
          created_at?: string
          games_played?: number
          id?: string
          player_id: string
          stat_type: string
          value?: number
        }
        Update: {
          created_at?: string
          games_played?: number
          id?: string
          player_id?: string
          stat_type?: string
          value?: number
        }
        Relationships: []
      }
      stat_trackers: {
        Row: {
          created_at: string
          game_id: string
          id: string
          stat_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          stat_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          stat_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stat_trackers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          line_number: number | null
          name: string | null
          position: string | null
          role: string | null
          team_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          line_number?: number | null
          name?: string | null
          position?: string | null
          role?: string | null
          team_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          line_number?: number | null
          name?: string | null
          position?: string | null
          role?: string | null
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_game_event: {
        Args:
          | {
              p_game_id: string
              p_event_type: string
              p_period: number
              p_team_type: string
            }
          | {
              p_game_id: string
              p_event_type: string
              p_period: number
              p_team_type: string
              p_details?: Json
            }
        Returns: Json
      }
      create_player_user: {
        Args: { player_name: string; player_email?: string }
        Returns: string
      }
      create_user_bypass_rls: {
        Args: { user_id: string; user_name: string; user_email: string }
        Returns: Json
      }
      delete_game_event: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      delete_team_completely: {
        Args: { team_id_param: string }
        Returns: boolean
      }
      delete_team_game_data: {
        Args: { team_id_param: string }
        Returns: undefined
      }
      delete_team_members: {
        Args: { team_id_param: string }
        Returns: undefined
      }
      delete_team_player_stats: {
        Args: { team_id_param: string }
        Returns: undefined
      }
      delete_team_relationships: {
        Args: { team_id_param: string }
        Returns: undefined
      }
      get_game_events: {
        Args: { p_game_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          details: Json | null
          event_type: string
          game_id: string
          id: string
          period: number
          team_type: string
          time_in_period: unknown | null
          timestamp: string
        }[]
      }
      record_game_stat: {
        Args: {
          p_game_id: string
          p_player_id: string
          p_stat_type: string
          p_period: number
          p_value: number
          p_details?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

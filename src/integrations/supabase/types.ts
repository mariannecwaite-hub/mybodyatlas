export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      body_regions: {
        Row: {
          a11y_description: string | null
          id: string
          label: string
        }
        Insert: {
          a11y_description?: string | null
          id: string
          label: string
        }
        Update: {
          a11y_description?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      event_regions: {
        Row: {
          event_id: string
          id: string
          region_id: string
        }
        Insert: {
          event_id: string
          id?: string
          region_id: string
        }
        Update: {
          event_id?: string
          id?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_regions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "body_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date_end: string | null
          date_start: string
          description: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          is_archived: boolean
          is_ongoing: boolean
          notes: string | null
          profile_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_end?: string | null
          date_start: string
          description?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          is_archived?: boolean
          is_ongoing?: boolean
          notes?: string | null
          profile_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_end?: string | null
          date_start?: string
          description?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          is_archived?: boolean
          is_ongoing?: boolean
          notes?: string | null
          profile_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          body: string
          created_at: string
          id: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          is_dismissed: boolean
          is_premium: boolean
          is_saved: boolean
          profile_id: string
          related_event_ids: string[] | null
          related_regions: string[] | null
          title: string
          tone: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          is_dismissed?: boolean
          is_premium?: boolean
          is_saved?: boolean
          profile_id: string
          related_event_ids?: string[] | null
          related_regions?: string[] | null
          title: string
          tone?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          insight_type?: Database["public"]["Enums"]["insight_type"]
          is_dismissed?: boolean
          is_premium?: boolean
          is_saved?: boolean
          profile_id?: string
          related_event_ids?: string[] | null
          related_regions?: string[] | null
          title?: string
          tone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string
          birth_year: number | null
          created_at: string
          handover_age: number | null
          id: string
          is_default: boolean
          name: string
          type: Database["public"]["Enums"]["profile_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string
          birth_year?: number | null
          created_at?: string
          handover_age?: number | null
          id?: string
          is_default?: boolean
          name: string
          type?: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string
          birth_year?: number | null
          created_at?: string
          handover_age?: number | null
          id?: string
          is_default?: boolean
          name?: string
          type?: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          approach: string | null
          created_at: string
          date_logged: string
          event_id: string
          id: string
          is_ongoing: boolean
          notes: string | null
          outcome: string | null
          provider: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approach?: string | null
          created_at?: string
          date_logged?: string
          event_id: string
          id?: string
          is_ongoing?: boolean
          notes?: string | null
          outcome?: string | null
          provider?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approach?: string | null
          created_at?: string
          date_logged?: string
          event_id?: string
          id?: string
          is_ongoing?: boolean
          notes?: string | null
          outcome?: string | null
          provider?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_event: { Args: { _event_id: string }; Returns: boolean }
    }
    Enums: {
      event_type:
        | "injury"
        | "symptom"
        | "stress_period"
        | "treatment"
        | "life_transition"
        | "recovery"
      impact_level: "mild" | "moderate" | "significant"
      insight_type:
        | "recurring_region"
        | "stress_correlation"
        | "treatment_outcome"
        | "life_transition_link"
        | "body_echo"
        | "general"
      profile_type: "adult" | "child"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: [
        "injury",
        "symptom",
        "stress_period",
        "treatment",
        "life_transition",
        "recovery",
      ],
      impact_level: ["mild", "moderate", "significant"],
      insight_type: [
        "recurring_region",
        "stress_correlation",
        "treatment_outcome",
        "life_transition_link",
        "body_echo",
        "general",
      ],
      profile_type: ["adult", "child"],
    },
  },
} as const

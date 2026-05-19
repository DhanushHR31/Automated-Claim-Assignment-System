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
      agents: {
        Row: {
          active_claims: number
          agent_code: string
          availability: Database["public"]["Enums"]["agent_availability"]
          created_at: string
          email: string | null
          home_city: string
          home_state: string
          id: string
          latitude: number
          longitude: number
          manager_id: string | null
          name: string
          performance_score: number
          phone: string | null
          travel_allowed: boolean
          updated_at: string
          user_id: string | null
          working_hours_end: string
          working_hours_start: string
        }
        Insert: {
          active_claims?: number
          agent_code: string
          availability?: Database["public"]["Enums"]["agent_availability"]
          created_at?: string
          email?: string | null
          home_city: string
          home_state: string
          id?: string
          latitude: number
          longitude: number
          manager_id?: string | null
          name: string
          performance_score?: number
          phone?: string | null
          travel_allowed?: boolean
          updated_at?: string
          user_id?: string | null
          working_hours_end?: string
          working_hours_start?: string
        }
        Update: {
          active_claims?: number
          agent_code?: string
          availability?: Database["public"]["Enums"]["agent_availability"]
          created_at?: string
          email?: string | null
          home_city?: string
          home_state?: string
          id?: string
          latitude?: number
          longitude?: number
          manager_id?: string | null
          name?: string
          performance_score?: number
          phone?: string | null
          travel_allowed?: boolean
          updated_at?: string
          user_id?: string | null
          working_hours_end?: string
          working_hours_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          agent_id: string
          assigned_time: string
          assignment_code: string
          claim_id: string
          created_at: string
          distance: number
          hotel_cost: number
          id: string
          overridden: boolean
          overridden_by: string | null
          override_reason: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          total_cost: number
          travel_cost: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          assigned_time?: string
          assignment_code: string
          claim_id: string
          created_at?: string
          distance?: number
          hotel_cost?: number
          id?: string
          overridden?: boolean
          overridden_by?: string | null
          override_reason?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          total_cost?: number
          travel_cost?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          assigned_time?: string
          assignment_code?: string
          claim_id?: string
          created_at?: string
          distance?: number
          hotel_cost?: number
          id?: string
          overridden?: boolean
          overridden_by?: string | null
          override_reason?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          total_cost?: number
          travel_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          agent_id: string | null
          claim_id: string | null
          created_at: string
          details: string | null
          id: string
          performed_by: string
        }
        Insert: {
          action: string
          agent_id?: string | null
          claim_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          performed_by: string
        }
        Update: {
          action?: string
          agent_id?: string | null
          claim_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          address: string
          assigned_agent_id: string | null
          city: string
          claim_code: string
          claim_type: Database["public"]["Enums"]["claim_type"]
          created_at: string
          created_by: string | null
          description: string
          estimated_value: number
          id: string
          latitude: number
          longitude: number
          state: string
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["claim_urgency"]
        }
        Insert: {
          address: string
          assigned_agent_id?: string | null
          city: string
          claim_code: string
          claim_type: Database["public"]["Enums"]["claim_type"]
          created_at?: string
          created_by?: string | null
          description: string
          estimated_value?: number
          id?: string
          latitude: number
          longitude: number
          state: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["claim_urgency"]
        }
        Update: {
          address?: string
          assigned_agent_id?: string | null
          city?: string
          claim_code?: string
          claim_type?: Database["public"]["Enums"]["claim_type"]
          created_at?: string
          created_by?: string | null
          description?: string
          estimated_value?: number
          id?: string
          latitude?: number
          longitude?: number
          state?: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["claim_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "claims_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          active: boolean
          created_at: string
          department: string | null
          email: string | null
          id: string
          max_agents: number
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          max_agents?: number
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          max_agents?: number
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          agent_id: string | null
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          agent_id?: string | null
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          agent_id?: string | null
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_availability: "available" | "on_assignment" | "on_leave"
      app_role: "manager" | "agent"
      assignment_status:
        | "pending"
        | "accepted"
        | "in_transit"
        | "inspecting"
        | "completed"
      claim_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "closed"
      claim_type:
        | "accident"
        | "property"
        | "health"
        | "natural_disaster"
        | "industrial"
      claim_urgency: "low" | "medium" | "high" | "emergency"
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
      agent_availability: ["available", "on_assignment", "on_leave"],
      app_role: ["manager", "agent"],
      assignment_status: [
        "pending",
        "accepted",
        "in_transit",
        "inspecting",
        "completed",
      ],
      claim_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "closed",
      ],
      claim_type: [
        "accident",
        "property",
        "health",
        "natural_disaster",
        "industrial",
      ],
      claim_urgency: ["low", "medium", "high", "emergency"],
    },
  },
} as const

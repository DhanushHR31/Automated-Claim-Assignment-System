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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      claim_approvals: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          claim_id: string
          company_id: string
          created_at: string
          decided_at: string | null
          id: string
          remarks: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          claim_id: string
          company_id: string
          created_at?: string
          decided_at?: string | null
          id?: string
          remarks?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          claim_id?: string
          company_id?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_approvals_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_billing: {
        Row: {
          claim_id: string
          discharge_summary_url: string | null
          final_bill_url: string | null
          id: string
          notes: string | null
          pharmacy_bill: number | null
          submitted_at: string
          total_bill: number
        }
        Insert: {
          claim_id: string
          discharge_summary_url?: string | null
          final_bill_url?: string | null
          id?: string
          notes?: string | null
          pharmacy_bill?: number | null
          submitted_at?: string
          total_bill?: number
        }
        Update: {
          claim_id?: string
          discharge_summary_url?: string | null
          final_bill_url?: string | null
          id?: string
          notes?: string | null
          pharmacy_bill?: number | null
          submitted_at?: string
          total_bill?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_billing_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_documents: {
        Row: {
          claim_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string | null
          file_path: string
          id: string
          uploaded_at: string
        }
        Insert: {
          claim_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name?: string | null
          file_path: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          claim_id?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string | null
          file_path?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_patient_details: {
        Row: {
          aadhaar_number: string | null
          age: number | null
          claim_id: string
          company_id_card_url: string | null
          contact_number: string | null
          corporate_company_name: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          gender: string | null
          id: string
          is_corporate: boolean
          pan_number: string | null
          patient_name: string
          relation_to_policy_holder: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          age?: number | null
          claim_id: string
          company_id_card_url?: string | null
          contact_number?: string | null
          corporate_company_name?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          gender?: string | null
          id?: string
          is_corporate?: boolean
          pan_number?: string | null
          patient_name: string
          relation_to_policy_holder?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          age?: number | null
          claim_id?: string
          company_id_card_url?: string | null
          contact_number?: string | null
          corporate_company_name?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          gender?: string | null
          id?: string
          is_corporate?: boolean
          pan_number?: string | null
          patient_name?: string
          relation_to_policy_holder?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_patient_details_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: true
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_payments: {
        Row: {
          amount_paid: number
          claim_id: string
          created_at: string
          id: string
          payment_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount_paid?: number
          claim_id: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount_paid?: number
          claim_id?: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_payments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          admission_date: string | null
          approved_amount: number | null
          claim_number: string
          claim_status: Database["public"]["Enums"]["claim_status"]
          created_at: string
          diagnosis: string | null
          discharge_date: string | null
          doctor_name: string | null
          estimated_amount: number | null
          hospital_id: string
          id: string
          policy_id: string
          remarks: string | null
          treatment_details: string | null
          updated_at: string
        }
        Insert: {
          admission_date?: string | null
          approved_amount?: number | null
          claim_number?: string
          claim_status?: Database["public"]["Enums"]["claim_status"]
          created_at?: string
          diagnosis?: string | null
          discharge_date?: string | null
          doctor_name?: string | null
          estimated_amount?: number | null
          hospital_id: string
          id?: string
          policy_id: string
          remarks?: string | null
          treatment_details?: string | null
          updated_at?: string
        }
        Update: {
          admission_date?: string | null
          approved_amount?: number | null
          claim_number?: string
          claim_status?: Database["public"]["Enums"]["claim_status"]
          created_at?: string
          diagnosis?: string | null
          discharge_date?: string | null
          doctor_name?: string | null
          estimated_amount?: number | null
          hospital_id?: string
          id?: string
          policy_id?: string
          remarks?: string | null
          treatment_details?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string | null
          bed_capacity: number | null
          city: string | null
          contact_number: string | null
          created_at: string
          email: string | null
          hospital_name: string
          id: string
          license_number: string | null
          logo_url: string | null
          registration_certificate_url: string | null
          specialization: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          bed_capacity?: number | null
          city?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          hospital_name: string
          id?: string
          license_number?: string | null
          logo_url?: string | null
          registration_certificate_url?: string | null
          specialization?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          bed_capacity?: number | null
          city?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          hospital_name?: string
          id?: string
          license_number?: string | null
          logo_url?: string | null
          registration_certificate_url?: string | null
          specialization?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      insurance_companies: {
        Row: {
          address: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          aadhaar_number: string | null
          company_id: string
          contact_number: string | null
          corporate_company_name: string | null
          coverage_amount: number
          created_at: string
          customer_name: string
          email: string | null
          end_date: string
          id: string
          pan_number: string | null
          policy_number: string
          policy_type: Database["public"]["Enums"]["policy_type"]
          start_date: string
          status: Database["public"]["Enums"]["policy_status"]
        }
        Insert: {
          aadhaar_number?: string | null
          company_id: string
          contact_number?: string | null
          corporate_company_name?: string | null
          coverage_amount?: number
          created_at?: string
          customer_name: string
          email?: string | null
          end_date: string
          id?: string
          pan_number?: string | null
          policy_number: string
          policy_type?: Database["public"]["Enums"]["policy_type"]
          start_date: string
          status?: Database["public"]["Enums"]["policy_status"]
        }
        Update: {
          aadhaar_number?: string | null
          company_id?: string
          contact_number?: string | null
          corporate_company_name?: string | null
          coverage_amount?: number
          created_at?: string
          customer_name?: string
          email?: string | null
          end_date?: string
          id?: string
          pan_number?: string | null
          policy_number?: string
          policy_type?: Database["public"]["Enums"]["policy_type"]
          start_date?: string
          status?: Database["public"]["Enums"]["policy_status"]
        }
        Relationships: [
          {
            foreignKeyName: "policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          id: string
          message: string
          sender_id: string
          sender_role: string
          sent_at: string
          ticket_id: string
        }
        Insert: {
          id?: string
          message: string
          sender_id: string
          sender_role?: string
          sent_at?: string
          ticket_id: string
        }
        Update: {
          id?: string
          message?: string
          sender_id?: string
          sender_role?: string
          sent_at?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          claim_id: string | null
          created_at: string
          hospital_id: string
          id: string
          issue: string
          screenshot_url: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          claim_id?: string | null
          created_at?: string
          hospital_id: string
          id?: string
          issue: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          claim_id?: string | null
          created_at?: string
          hospital_id?: string
          id?: string
          issue?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_belongs_to_me: { Args: { _claim: string }; Returns: boolean }
      current_hospital_id: { Args: never; Returns: string }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      claim_status:
        | "initiated"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "under_verification"
        | "paid"
      document_type:
        | "aadhaar"
        | "pan"
        | "insurance_doc"
        | "admission_doc"
        | "diagnosis_report"
        | "discharge_summary"
        | "final_bill"
        | "pharmacy_bill"
        | "company_id"
      payment_status: "pending" | "completed"
      policy_status: "active" | "expired"
      policy_type: "individual" | "corporate"
      ticket_status: "open" | "in_progress" | "closed"
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
      approval_status: ["pending", "approved", "rejected"],
      claim_status: [
        "initiated",
        "pending_approval",
        "approved",
        "rejected",
        "under_verification",
        "paid",
      ],
      document_type: [
        "aadhaar",
        "pan",
        "insurance_doc",
        "admission_doc",
        "diagnosis_report",
        "discharge_summary",
        "final_bill",
        "pharmacy_bill",
        "company_id",
      ],
      payment_status: ["pending", "completed"],
      policy_status: ["active", "expired"],
      policy_type: ["individual", "corporate"],
      ticket_status: ["open", "in_progress", "closed"],
    },
  },
} as const

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
      drawings: {
        Row: {
          approval_status: string | null
          approved_by: string | null
          approved_date: string | null
          drawing_name: string | null
          drawing_type: string | null
          file_url: string | null
          id: string
          project_id: string | null
          revision_number: string | null
          uploaded_at: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_by?: string | null
          approved_date?: string | null
          drawing_name?: string | null
          drawing_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          revision_number?: string | null
          uploaded_at?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_by?: string | null
          approved_date?: string | null
          drawing_name?: string | null
          drawing_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          revision_number?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drawings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery: string | null
          category: string | null
          expected_delivery: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          invoice_status: string | null
          item_name: string | null
          lpo_date: string | null
          lpo_number: string | null
          lpo_received: boolean | null
          notes: string | null
          order_date: string | null
          ordered: boolean | null
          payment_date: string | null
          payment_status: string | null
          project_id: string | null
          quantity: number | null
          status: string | null
          supplier: string | null
          total_cost: number | null
          unit_price: number | null
        }
        Insert: {
          actual_delivery?: string | null
          category?: string | null
          expected_delivery?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_status?: string | null
          item_name?: string | null
          lpo_date?: string | null
          lpo_number?: string | null
          lpo_received?: boolean | null
          notes?: string | null
          order_date?: string | null
          ordered?: boolean | null
          payment_date?: string | null
          payment_status?: string | null
          project_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit_price?: number | null
        }
        Update: {
          actual_delivery?: string | null
          category?: string | null
          expected_delivery?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_status?: string | null
          item_name?: string | null
          lpo_date?: string | null
          lpo_number?: string | null
          lpo_received?: boolean | null
          notes?: string | null
          order_date?: string | null
          ordered?: boolean | null
          payment_date?: string | null
          payment_status?: string | null
          project_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          file_url: string | null
          id: string
          location_on_site: string | null
          photo_date: string | null
          project_id: string | null
          tags: string[] | null
          taken_by: string | null
          uploaded_at: string | null
        }
        Insert: {
          caption?: string | null
          file_url?: string | null
          id?: string
          location_on_site?: string | null
          photo_date?: string | null
          project_id?: string | null
          tags?: string[] | null
          taken_by?: string | null
          uploaded_at?: string | null
        }
        Update: {
          caption?: string | null
          file_url?: string | null
          id?: string
          location_on_site?: string | null
          photo_date?: string | null
          project_id?: string | null
          tags?: string[] | null
          taken_by?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_issues: {
        Row: {
          assigned_to: string | null
          description: string | null
          id: string
          impact_level: string | null
          issue_type: string | null
          priority: string | null
          project_id: string | null
          reported_by: string | null
          reported_date: string | null
          resolution: string | null
          resolved_by: string | null
          resolved_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          description?: string | null
          id?: string
          impact_level?: string | null
          issue_type?: string | null
          priority?: string | null
          project_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          description?: string | null
          id?: string
          impact_level?: string | null
          issue_type?: string | null
          priority?: string | null
          project_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_meetings: {
        Row: {
          action_items: Json | null
          attendees: string[] | null
          id: string
          location: string | null
          meeting_date: string | null
          meeting_type: string | null
          minutes: string | null
          project_id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          action_items?: Json | null
          attendees?: string[] | null
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          minutes?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          action_items?: Json | null
          attendees?: string[] | null
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          minutes?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          company: string | null
          email: string | null
          id: string
          is_primary_contact: boolean | null
          name: string
          phone: string | null
          project_id: string | null
          role: string
        }
        Insert: {
          company?: string | null
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          name: string
          phone?: string | null
          project_id?: string | null
          role: string
        }
        Update: {
          company?: string | null
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          name?: string
          phone?: string | null
          project_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          brand: string | null
          budget: number | null
          client: string | null
          contractor: string | null
          contractor_progress: number | null
          created_at: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          owner_progress: number | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          brand?: string | null
          budget?: number | null
          client?: string | null
          contractor?: string | null
          contractor_progress?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          owner_progress?: number | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          brand?: string | null
          budget?: number | null
          client?: string | null
          contractor?: string | null
          contractor_progress?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          owner_progress?: number | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          description: string | null
          file_url: string | null
          generated_by: string | null
          id: string
          includes_orders: boolean | null
          includes_photos: boolean | null
          includes_responsibilities: boolean | null
          includes_schedules: boolean | null
          last_updated: string | null
          project_id: string | null
          report_date: string | null
          report_type: string | null
          shared_with: string[] | null
          status: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          includes_orders?: boolean | null
          includes_photos?: boolean | null
          includes_responsibilities?: boolean | null
          includes_schedules?: boolean | null
          last_updated?: string | null
          project_id?: string | null
          report_date?: string | null
          report_type?: string | null
          shared_with?: string[] | null
          status?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          includes_orders?: boolean | null
          includes_photos?: boolean | null
          includes_responsibilities?: boolean | null
          includes_schedules?: boolean | null
          last_updated?: string | null
          project_id?: string | null
          report_date?: string | null
          report_type?: string | null
          shared_with?: string[] | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      responsibilities: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          due_date: string | null
          id: string
          last_updated: string | null
          notes: string | null
          priority: string | null
          project_id: string | null
          responsible_party: string | null
          status: string | null
          task: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          responsible_party?: string | null
          status?: string | null
          task?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          responsible_party?: string | null
          status?: string | null
          task?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responsibilities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_items: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          completion_percentage: number | null
          created_at: string | null
          delay_days: number | null
          dependencies: string[] | null
          description: string | null
          id: string
          milestone: boolean | null
          owner_comment: string | null
          planned_end: string | null
          planned_start: string | null
          priority: string | null
          project_id: string | null
          responsible_party: string | null
          status: string | null
          task: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          delay_days?: number | null
          dependencies?: string[] | null
          description?: string | null
          id?: string
          milestone?: boolean | null
          owner_comment?: string | null
          planned_end?: string | null
          planned_start?: string | null
          priority?: string | null
          project_id?: string | null
          responsible_party?: string | null
          status?: string | null
          task?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          delay_days?: number | null
          dependencies?: string[] | null
          description?: string | null
          id?: string
          milestone?: boolean | null
          owner_comment?: string | null
          planned_end?: string | null
          planned_start?: string | null
          priority?: string | null
          project_id?: string | null
          responsible_party?: string | null
          status?: string | null
          task?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          delay_days: number | null
          description: string | null
          end_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          project_id: string | null
          start_date: string | null
          status: string | null
          title: string | null
          uploaded_at: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          delay_days?: number | null
          description?: string | null
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          uploaded_at?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          delay_days?: number | null
          description?: string | null
          end_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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

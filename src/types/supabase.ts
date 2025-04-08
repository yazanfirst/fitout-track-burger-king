
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          location: string | null
          brand: string | null
          contractor: string | null
          notes: string | null
          owner_progress: number | null
          contractor_progress: number | null
          created_at: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          client: string | null
          status: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['projects']['Row']]?: Database['public']['Tables']['projects']['Row'][K] }
        Update: Database['public']['Tables']['projects']['Insert']
      }
      schedule_items: {
        Row: {
          id: string
          project_id: string | null
          task: string | null
          planned_start: string | null
          planned_end: string | null
          actual_start: string | null
          actual_end: string | null
          delay_days: number | null
          status: string | null
          responsible_party: string | null
          owner_comment: string | null
          created_at: string | null
          description: string | null
          priority: string | null
          completion_percentage: number | null
          dependencies: string[] | null
          milestone: boolean | null
        }
        Insert: { [K in keyof Database['public']['Tables']['schedule_items']['Row']]?: Database['public']['Tables']['schedule_items']['Row'][K] }
        Update: Database['public']['Tables']['schedule_items']['Insert']
      }
      schedules: {
        Row: {
          id: string
          project_id: string | null
          file_name: string | null
          file_url: string | null
          uploaded_at: string | null
          title: string | null
          start_date: string | null
          end_date: string | null
          actual_start: string | null
          actual_end: string | null
          delay_days: number | null
          description: string | null
          status: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['schedules']['Row']]?: Database['public']['Tables']['schedules']['Row'][K] }
        Update: Database['public']['Tables']['schedules']['Insert']
      }
      drawings: {
        Row: {
          id: string
          project_id: string | null
          drawing_name: string | null
          file_url: string | null
          uploaded_at: string | null
          revision_number: string | null
          drawing_type: string | null
          approval_status: string | null
          approved_by: string | null
          approved_date: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['drawings']['Row']]?: Database['public']['Tables']['drawings']['Row'][K] }
        Update: Database['public']['Tables']['drawings']['Insert']
      }
      photos: {
        Row: {
          id: string
          project_id: string | null
          file_url: string | null
          caption: string | null
          uploaded_at: string | null
          location_on_site: string | null
          taken_by: string | null
          photo_date: string | null
          tags: string[] | null
        }
        Insert: { [K in keyof Database['public']['Tables']['photos']['Row']]?: Database['public']['Tables']['photos']['Row'][K] }
        Update: Database['public']['Tables']['photos']['Insert']
      }
      orders: {
        Row: {
          id: string
          project_id: string | null
          item_name: string | null
          quantity: number | null
          order_date: string | null
          expected_delivery: string | null
          actual_delivery: string | null
          status: string | null
          notes: string | null
          supplier: string | null
          unit_price: number | null
          total_cost: number | null
          category: string | null
          ordered: boolean | null
          lpo_number: string | null
          lpo_received: boolean | null
          lpo_date: string | null
          invoice_number: string | null
          invoice_date: string | null
          invoice_status: string | null
          payment_status: string | null
          payment_date: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['orders']['Row']]?: Database['public']['Tables']['orders']['Row'][K] }
        Update: Database['public']['Tables']['orders']['Insert']
      }
      responsibilities: {
        Row: {
          id: string
          project_id: string | null
          task: string | null
          assigned_to: string | null
          due_date: string | null
          status: string | null
          notes: string | null
          responsible_party: string | null
          priority: string | null
          completed_at: string | null
          created_at: string | null
          last_updated: string | null
          completion_notes: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['responsibilities']['Row']]?: Database['public']['Tables']['responsibilities']['Row'][K] }
        Update: Database['public']['Tables']['responsibilities']['Insert'] 
      }
      reports: {
        Row: {
          id: string
          project_id: string | null
          report_type: string | null
          report_date: string | null
          title: string | null
          description: string | null
          file_url: string | null
          generated_by: string | null
          status: string | null
          shared_with: string[] | null
          last_updated: string | null
          includes_photos: boolean | null
          includes_schedules: boolean | null
          includes_orders: boolean | null
          includes_responsibilities: boolean | null
        }
        Insert: { [K in keyof Database['public']['Tables']['reports']['Row']]?: Database['public']['Tables']['reports']['Row'][K] }
        Update: Database['public']['Tables']['reports']['Insert']
      }
      project_members: {
        Row: {
          id: string
          project_id: string | null
          name: string
          role: string
          email: string | null
          phone: string | null
          company: string | null
          is_primary_contact: boolean | null
        }
        Insert: { [K in keyof Database['public']['Tables']['project_members']['Row']]?: Database['public']['Tables']['project_members']['Row'][K] }
        Update: Database['public']['Tables']['project_members']['Insert']
      }
      project_issues: {
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string | null
          reported_date: string | null
          reported_by: string | null
          assigned_to: string | null
          priority: string | null
          status: string | null
          resolution: string | null
          resolved_date: string | null
          resolved_by: string | null
          issue_type: string | null
          impact_level: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['project_issues']['Row']]?: Database['public']['Tables']['project_issues']['Row'][K] }
        Update: Database['public']['Tables']['project_issues']['Insert']
      }
      project_meetings: {
        Row: {
          id: string
          project_id: string | null
          meeting_date: string | null
          title: string | null
          location: string | null
          attendees: string[] | null
          minutes: string | null
          action_items: Json | null
          meeting_type: string | null
          status: string | null
        }
        Insert: { [K in keyof Database['public']['Tables']['project_meetings']['Row']]?: Database['public']['Tables']['project_meetings']['Row'][K] }
        Update: Database['public']['Tables']['project_meetings']['Insert']
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

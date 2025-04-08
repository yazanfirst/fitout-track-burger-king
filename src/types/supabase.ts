
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
          // Add missing fields that causes TypeScript errors
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
          // Adding missing fields used in the API
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
        }
        Insert: { [K in keyof Database['public']['Tables']['photos']['Row']]?: Database['public']['Tables']['photos']['Row'][K] }
        Update: Database['public']['Tables']['photos']['Insert']
      }
      // Adding missing tables that are referenced in the API
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
        }
        Insert: { [K in keyof Database['public']['Tables']['responsibilities']['Row']]?: Database['public']['Tables']['responsibilities']['Row'][K] }
        Update: Database['public']['Tables']['responsibilities']['Insert'] 
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  user_type: 'manager' | 'client' | 'vendor'
  company_name?: string
  license_number?: string
  specialties?: string[]
  status: 'active' | 'pending' | 'suspended'
  created_at: string
  updated_at: string
}

export interface WorkOrder {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'approved' | 'paid'
  budget_min?: number
  budget_max?: number
  location: string
  images?: string[]
  assigned_vendor_id?: string
  completion_photos?: string[]
  completion_notes?: string
  service_fee_percentage: number
  total_amount?: number
  vendor_amount?: number
  created_at: string
  updated_at: string
}

export interface VendorApplication {
  id: string
  work_order_id: string
  vendor_id: string
  proposal_amount: number
  estimated_completion: string
  proposal_notes: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Payment {
  id: string
  work_order_id: string
  client_id: string
  vendor_id: string
  total_amount: number
  vendor_amount: number
  service_fee: number
  status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  transaction_id?: string
  created_at: string
}
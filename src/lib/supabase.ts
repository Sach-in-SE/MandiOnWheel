import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  phone: string
  role: 'vendor' | 'supplier'
  name: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image_url: string
  supplier_id: string
  supplier_name: string
  created_at: string
}

export type Order = {
  id: string
  product_id: string
  vendor_id: string
  supplier_id: string
  quantity: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'delivered'
  created_at: string
  product_name: string
  vendor_name: string
}
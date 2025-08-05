import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl); // Debug log
console.log('Supabase Key exists:', !!supabaseKey); // Debug log - don't log the actual key

export const supabase = createClient(supabaseUrl, supabaseKey) 
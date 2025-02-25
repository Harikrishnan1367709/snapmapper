import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
let supabaseInitialized = false

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    supabaseInitialized = true
  }
} catch (error) {
  console.error('Supabase initialization error:', error)
}

export function isSupabaseInitialized() {
  return supabaseInitialized
}

export async function saveTransformation(inputData, transformLogic) {
  if (!supabaseInitialized) {
    throw new Error('Supabase is not initialized')
  }

  const { data, error } = await supabase
    .from('transformations')
    .insert([
      {
        input_data: inputData,
        transform_logic: transformLogic,
        created_at: new Date().toISOString()
      }
    ])
    .select()

  if (error) throw error
  return data
}

export async function loadTransformation() {
  if (!supabaseInitialized) {
    throw new Error('Supabase is not initialized')
  }

  const { data, error } = await supabase
    .from('transformations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error

  return {
    inputData: data.input_data,
    transformLogic: data.transform_logic
  }
}

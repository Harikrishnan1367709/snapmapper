import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined
const supabaseKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined

let supabase = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export async function saveTransformation(inputData, transformLogic) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your environment variables.')
  }
  const { data, error } = await supabase
    .from('transformations')
    .insert([{ input_data: inputData, transform_logic: transformLogic }])

  if (error) throw error
  return data
}

export async function loadTransformation() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your environment variables.')
  }
  const { data, error } = await supabase
    .from('transformations')
    .select('input_data, transform_logic')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return { inputData: data.input_data, transformLogic: data.transform_logic }
}

export function isSupabaseInitialized() {
  return !!supabase
}


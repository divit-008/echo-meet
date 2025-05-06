import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qqrugjnzdebuepjjsdop.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnVnam56ZGVidWVwampzZG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDk0NTQsImV4cCI6MjA2MjA4NTQ1NH0.8A3_OAVhrqAbw1p4rT1SOK8KgKz4QzxLCLetZoY9rxM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createServerSupabaseClient } from './supabase-server'

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  // For now, we'll use a simple email check
  // You can change this to your email address
  const adminEmails = [
    'limchunyik6868@gmail.com', // Replace with your actual email
    // Add more admin emails as needed
  ]
  
  return adminEmails.includes(user.email || '')
}

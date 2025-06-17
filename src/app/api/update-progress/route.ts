import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      vocabListId, 
      wordId, 
      masteryLevel, 
      reviewCount, 
      correctCount
    } = await request.json()

    const supabase = await createServerSupabaseClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Upsert user progress
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        vocab_list_id: vocabListId,
        word_id: wordId,
        mastery_level: masteryLevel,
        review_count: reviewCount,
        correct_count: correctCount,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,word_id'
      })

    if (error) {
      console.error('Error updating progress:', error)
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in update-progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

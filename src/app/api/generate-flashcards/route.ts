import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateFlashcards } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  console.log('API route called')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { vocabListId } = body

    if (!vocabListId) {
      console.log('No vocabListId provided')
      return NextResponse.json(
        { error: 'Vocabulary list ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('User:', user?.email)
    
    if (authError || !user) {
      console.log('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all words from the vocabulary list
    const { data: words, error: wordsError } = await supabase
      .from('vocabulary_words')
      .select('*')
      .eq('vocab_list_id', vocabListId)

    console.log('Words found:', words?.length)
    console.log('Words error:', wordsError)

    if (wordsError || !words) {
      return NextResponse.json(
        { error: 'Failed to fetch vocabulary words: ' + (wordsError?.message || 'Unknown error') },
        { status: 500 }
      )
    }

    // Check if flashcards already exist for this list
    const { data: existingFlashcards } = await supabase
      .from('flashcards')
      .select('word_id')
      .eq('vocab_list_id', vocabListId)

    const existingWordIds = new Set(existingFlashcards?.map(f => f.word_id) || [])
    console.log('Existing flashcards for words:', existingWordIds.size)

    // Generate flashcards for words that don't have them yet
    const newFlashcards = []
    let processedCount = 0

    for (const word of words) {
      if (existingWordIds.has(word.id)) {
        console.log(`Skipping ${word.word} - already has flashcards`)
        continue
      }

      try {
        console.log(`Generating flashcards for: ${word.word}`)
        const flashcards = await generateFlashcards(word.word, word.definition)
        console.log(`Generated ${flashcards.length} flashcards for ${word.word}`)
        
        for (const flashcard of flashcards) {
          newFlashcards.push({
            vocab_list_id: vocabListId,
            word_id: word.id,
            front_text: flashcard.front_text,
            back_text: flashcard.back_text,
            card_type: flashcard.card_type
          })
        }
        
        processedCount++
        
        // Add a small delay to avoid rate limiting
        if (processedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`Failed to generate flashcards for word: ${word.word}`, error)
        // Continue with other words even if one fails
      }
    }

    console.log(`Total new flashcards to insert: ${newFlashcards.length}`)

    // ADD THIS DEBUG LOGGING BEFORE INSERT
    console.log('=== DEBUG: Flashcards to insert ===')
    console.log('Card types being inserted:', newFlashcards.map(f => f.card_type))
    console.log('Unique card types:', [...new Set(newFlashcards.map(f => f.card_type))])
    console.log('First few flashcards:', JSON.stringify(newFlashcards.slice(0, 3), null, 2))

    // Insert all new flashcards
    if (newFlashcards.length > 0) {
      const { error: insertError } = await supabase
        .from('flashcards')
        .insert(newFlashcards)

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to save flashcards: ' + insertError.message },
          { status: 500 }
        )
      }
    }

    const response = {
      success: true,
      message: `Generated flashcards for ${processedCount} words`,
      flashcardsCreated: newFlashcards.length
    }
    
    console.log('Returning response:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in generate-flashcards API:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

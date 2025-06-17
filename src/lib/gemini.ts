import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface FlashcardData {
  front_text: string
  back_text: string
  card_type: 'definition' | 'example' | 'synonym' | 'antonym'
}

export async function generateFlashcards(
  word: string,
  definition: string
): Promise<FlashcardData[]> {
  // Use manual generation to ensure consistent card types
  console.log(`Generating manual flashcards for: ${word}`)
  
  return [
    {
      front_text: word,
      back_text: definition,
      card_type: 'definition'
    },
    {
      front_text: `Use "${word}" in a sentence`,
      back_text: `Example: The ${word} is commonly used in everyday situations.`,
      card_type: 'example'
    },
    {
      front_text: `What's a synonym for "${word}"?`,
      back_text: `A word similar to ${word}`,
      card_type: 'synonym'
    }
  ]
}

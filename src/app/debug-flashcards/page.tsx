import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function DebugFlashcards() {
  const supabase = await createServerSupabaseClient();

  // Test basic connection
  const { data: vocabLists, error: listsError } = await supabase
    .from("vocab_lists")
    .select("*")
    .limit(5);

  const { data: flashcards, error: flashcardsError } = await supabase
    .from("flashcards")
    .select("*")
    .limit(5);

  return (
    <div className="p-8">
      <h1>Debug Flashcards</h1>

      <h2>Vocab Lists:</h2>
      <pre>
        {JSON.stringify({ data: vocabLists, error: listsError }, null, 2)}
      </pre>

      <h2>Flashcards:</h2>
      <pre>
        {JSON.stringify({ data: flashcards, error: flashcardsError }, null, 2)}
      </pre>
    </div>
  );
}

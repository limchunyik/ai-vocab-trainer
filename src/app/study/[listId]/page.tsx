import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import StudyInterface from "@/components/study-interface";

interface StudyPageProps {
  params: {
    listId: string;
  };
}

export default async function StudyPage({ params }: StudyPageProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Get the vocabulary list
  const { data: vocabList, error: listError } = await supabase
    .from("vocab_lists")
    .select("*")
    .eq("id", params.listId)
    .eq("is_active", true)
    .single();

  console.log("Vocab list:", vocabList);
  console.log("List error:", listError);

  if (listError || !vocabList) {
    notFound();
  }

  // Get flashcards for this list
  const { data: flashcards, error: flashcardsError } = await supabase
    .from("flashcards")
    .select(
      `
      *,
      vocabulary_words (
        word,
        definition
      )
    `
    )
    .eq("vocab_list_id", params.listId)
    .order("created_at");

  console.log("Flashcards found:", flashcards?.length || 0);
  console.log("Flashcards error:", flashcardsError);
  console.log("First flashcard:", flashcards?.[0]);

  // Get user's progress for these flashcards
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("vocab_list_id", params.listId);

  console.log("User progress:", userProgress?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudyInterface
        vocabList={vocabList}
        flashcards={flashcards || []}
        userProgress={userProgress || []}
        userId={user.id}
      />
    </div>
  );
}

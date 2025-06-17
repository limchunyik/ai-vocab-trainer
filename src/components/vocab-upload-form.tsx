"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function VocabUploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [vocabText, setVocabText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUploadedId, setLastUploadedId] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setLastUploadedId(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to upload vocabulary");
        return;
      }

      // Parse the vocabulary text
      const lines = vocabText
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const words = [];

      for (const line of lines) {
        const parts = line.split("-").map((part) => part.trim());
        if (parts.length >= 2) {
          const word = parts[0];
          const definition = parts.slice(1).join(" - ");
          words.push({ word, definition });
        }
      }

      if (words.length === 0) {
        setError("Please provide at least one word-definition pair");
        return;
      }

      // Create the vocabulary list
      const { data: vocabList, error: listError } = await supabase
        .from("vocab_lists")
        .insert({
          title,
          description,
          difficulty_level: difficulty,
          total_words: words.length,
          created_by: user.id,
        })
        .select()
        .single();

      if (listError) {
        setError("Failed to create vocabulary list: " + listError.message);
        return;
      }

      // Insert all the words
      const wordsToInsert = words.map((word) => ({
        vocab_list_id: vocabList.id,
        word: word.word,
        definition: word.definition,
        difficulty_score:
          difficulty === "beginner" ? 1 : difficulty === "intermediate" ? 3 : 5,
      }));

      const { error: wordsError } = await supabase
        .from("vocabulary_words")
        .insert(wordsToInsert);

      if (wordsError) {
        setError("Failed to add words: " + wordsError.message);
        return;
      }

      setSuccess(
        `Successfully uploaded "${title}" with ${words.length} words!`
      );
      setLastUploadedId(vocabList.id);
      setTitle("");
      setDescription("");
      setVocabText("");

      // Refresh the page to show the new list
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async (vocabListId: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vocabListId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate flashcards");
        return;
      }

      setSuccess(
        `${data.message}! Created ${data.flashcardsCreated} flashcards.`
      );
      router.refresh();
    } catch (err) {
      setError("Failed to generate flashcards");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              List Title
            </label>
            <Input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Business English Vocabulary"
            />
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value as "beginner" | "intermediate" | "advanced"
                )
              }
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this vocabulary list"
          />
        </div>

        <div>
          <label
            htmlFor="vocab"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vocabulary Words
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Enter one word per line in the format:{" "}
            <strong>word - definition</strong>
          </p>
          <Textarea
            id="vocab"
            required
            value={vocabText}
            onChange={(e) => setVocabText(e.target.value)}
            placeholder={`entrepreneur - a person who starts and runs a business
innovation - the introduction of new ideas or methods
revenue - income generated from business operations
strategy - a plan of action to achieve goals`}
            rows={10}
          />
          <p className="text-xs text-gray-400 mt-1">
            {
              vocabText
                .trim()
                .split("\n")
                .filter((line) => line.trim() && line.includes("-")).length
            }{" "}
            words detected
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Uploading..." : "Upload Vocabulary List"}
        </Button>
      </form>

      {/* Generate Flashcards Section */}
      {lastUploadedId && (
        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              🎉 Vocabulary uploaded successfully!
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Would you like to generate AI-powered flashcards for this
              vocabulary list?
            </p>
            <Button
              onClick={() => handleGenerateFlashcards(lastUploadedId)}
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Generating Flashcards..."
                : "🤖 Generate AI Flashcards"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

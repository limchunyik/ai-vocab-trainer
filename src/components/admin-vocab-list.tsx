"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VocabList {
  id: string;
  title: string;
  description: string;
  total_words: number;
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
}

interface AdminVocabListProps {
  vocabLists: VocabList[] | null | undefined;
}

export default function AdminVocabList({ vocabLists }: AdminVocabListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Fix hydration issue by only rendering dates on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateFlashcards = async (vocabListId: string) => {
    setLoading(vocabListId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vocabListId }),
      });

      const responseText = await response.text();

      if (!responseText) {
        setError("Server returned empty response");
        return;
      }

      const data = JSON.parse(responseText);

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
      setLoading(null);
    }
  };

  // Format date consistently
  const formatDate = (dateString: string) => {
    if (!isClient) return "Loading..."; // Prevent hydration mismatch

    const date = new Date(dateString);
    // Use a consistent format that works across timezones
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!vocabLists || vocabLists.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No vocabulary lists uploaded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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

      {vocabLists.map((list) => (
        <Card key={list.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{list.title}</h3>
                <p className="text-gray-600 mt-1">{list.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{list.total_words} words</span>
                  <span className="capitalize">{list.difficulty_level}</span>
                  <span>{list.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="text-sm text-gray-400">
                  {formatDate(list.created_at)}
                </div>
                <Button
                  onClick={() => handleGenerateFlashcards(list.id)}
                  disabled={loading === list.id}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading === list.id
                    ? "Generating..."
                    : "Generate Flashcards"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

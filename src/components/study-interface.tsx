"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react";

interface VocabList {
  id: string;
  title: string;
  description: string;
  total_words: number;
  difficulty_level: string;
}

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  card_type: string;
  word_id: string;
  vocabulary_words: {
    word: string;
    definition: string;
  }[]; // Change from object to array
}


interface UserProgress {
  word_id: string;
  mastery_level: number;
  review_count: number;
  correct_count: number;
}

interface StudyInterfaceProps {
  vocabList: VocabList;
  flashcards: Flashcard[];
  userProgress: UserProgress[];
  userId: string;
}

export default function StudyInterface({
  vocabList,
  flashcards = [], // Add default empty array
  userProgress = [], // Add default empty array
  userId,
}: StudyInterfaceProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const router = useRouter();

  // Add safety check for flashcards
  const safeFlashcards = flashcards || [];
  const currentCard = safeFlashcards[currentCardIndex];
  const totalCards = safeFlashcards.length;

  // Get progress for current word
  const getCurrentWordProgress = () => {
    return userProgress.find((p) => p.word_id === currentCard?.word_id);
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentCard) return;

    // Update local stats
    setStudyStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      total: prev.total + 1,
    }));

    // Update progress in database
    await updateProgress(currentCard.word_id, isCorrect);

    // Move to next card
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Study session complete
      handleStudyComplete();
    }
  };

  const updateProgress = async (wordId: string, isCorrect: boolean) => {
    try {
      const currentProgress = getCurrentWordProgress();
      const newReviewCount = (currentProgress?.review_count || 0) + 1;
      const newCorrectCount =
        (currentProgress?.correct_count || 0) + (isCorrect ? 1 : 0);

      // Simple mastery calculation
      let newMasteryLevel = currentProgress?.mastery_level || 0;
      if (isCorrect && newMasteryLevel < 5) {
        newMasteryLevel += 1;
      } else if (!isCorrect && newMasteryLevel > 0) {
        newMasteryLevel = Math.max(0, newMasteryLevel - 1);
      }

      const response = await fetch("/api/update-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          vocabListId: vocabList.id,
          wordId,
          masteryLevel: newMasteryLevel,
          reviewCount: newReviewCount,
          correctCount: newCorrectCount,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleStudyComplete = () => {
    router.push("/dashboard");
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyStats({ correct: 0, incorrect: 0, total: 0 });
  };

  // Check if no flashcards or no current card
  if (totalCards === 0 || !currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">No Flashcards Available</h2>
            <p className="text-gray-600 mb-4">
              This vocabulary list doesn&apos;t have any flashcards yet.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{vocabList.title}</h1>
            <p className="text-gray-600">{vocabList.description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRestart}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Card {currentCardIndex + 1} of {totalCards}
          </span>
          <span>
            Correct: {studyStats.correct} | Incorrect: {studyStats.incorrect}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <Card
          className="min-h-[300px] cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={handleCardFlip}
        >
          <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
            <div className="text-center">
              {!isFlipped ? (
                <div>
                  <div className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
                    {currentCard.card_type}
                  </div>
                  <div className="text-2xl font-semibold mb-4">
                    {currentCard.front_text}
                  </div>
                  <div className="text-sm text-gray-400">
                    Click to reveal answer
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
                    Answer
                  </div>
                  <div className="text-xl mb-4">{currentCard.back_text}</div>
                  <div className="text-sm text-gray-400">How did you do?</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answer Buttons */}
      {isFlipped && (
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAnswer(false)}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Incorrect
          </Button>
          <Button
            size="lg"
            onClick={() => handleAnswer(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Correct
          </Button>
        </div>
      )}

      {/* Word Info */}
      <div className="mt-8 text-center">
        <div className="text-sm text-gray-500">
          Current word:{" "}
          <span className="font-semibold">
            {currentCard.vocabulary_words?.[0]?.word || "Unknown word"}
          </span>
        </div>
        {getCurrentWordProgress() && (
          <div className="text-xs text-gray-400 mt-1">
            Mastery Level: {getCurrentWordProgress()?.mastery_level}/5 |
            Reviews: {getCurrentWordProgress()?.review_count} | Accuracy:{" "}
            {(() => {
              const progress = getCurrentWordProgress();
              return progress && progress.review_count > 0
                ? Math.round(
                    ((progress.correct_count || 0) / progress.review_count) *
                      100
                  )
                : 0;
            })()}
            %
          </div>
        )}
      </div>
    </div>
  );
}

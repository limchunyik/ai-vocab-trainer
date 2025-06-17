"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [tableCount, setTableCount] = useState<number>(0);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient();

        const { data: vocabLists, error } = await supabase
          .from("vocab_lists")
          .select("*")
          .limit(1);

        if (error) {
          console.log("Database error:", error);
          setConnected(false);
        } else {
          setConnected(true);
          setTableCount(vocabLists?.length || 0);
        }
      } catch (error) {
        console.log("Connection error:", error);
        setConnected(false);
      }
    };

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          AI Vocabulary Trainer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Master vocabulary with AI-powered flashcards and personalized learning
          plans
        </p>

        {/* Connection status */}
        <div className="text-sm space-y-2">
          <div>
            Database Status:{" "}
            {connected === null
              ? "Testing..."
              : connected
              ? "✅ Connected"
              : "❌ Not Connected"}
          </div>
          {connected && (
            <div className="text-green-600">
              Database schema created successfully! Found {tableCount} vocab
              lists.
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

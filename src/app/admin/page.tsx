import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VocabUploadForm from "@/components/vocab-upload-form";
import AdminVocabList from "@/components/admin-vocab-list";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    redirect("/dashboard");
  }

  // Get existing vocab lists with error handling
  const { data: vocabLists, error: vocabError } = await supabase
    .from("vocab_lists")
    .select("*")
    .order("created_at", { ascending: false });

  if (vocabError) {
    console.error("Error fetching vocab lists:", vocabError);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Upload and manage vocabulary lists
            </p>
          </div>

          {/* Upload Form */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Vocabulary List</CardTitle>
              </CardHeader>
              <CardContent>
                <VocabUploadForm />
              </CardContent>
            </Card>
          </div>

          {/* Existing Lists */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Existing Vocabulary Lists ({vocabLists?.length || 0})
            </h2>

            {vocabError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                Error loading vocabulary lists: {vocabError.message}
              </div>
            )}

            <AdminVocabList vocabLists={vocabLists} />
          </div>
        </div>
      </main>
    </div>
  );
}

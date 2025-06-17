import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  Clock,
  Star,
  Play,
  BarChart3,
  Trophy,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get available vocab lists
  const { data: vocabLists } = await supabase
    .from("vocab_lists")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Get user's progress summary
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  // Safe calculations with null checking
  const totalWordsStudied = progressData?.length ?? 0;
  const masteredWords =
    progressData?.filter((p) => p.mastery_level >= 4).length ?? 0;
  const averageAccuracy =
    progressData && progressData.length > 0
      ? Math.round(
          (progressData.reduce(
            (acc, p) => acc + p.correct_count / Math.max(p.review_count, 1),
            0
          ) /
            progressData.length) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16 ring-4 ring-blue-100">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                />
                <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
                  {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back,{" "}
                  {profile?.full_name || user.email?.split("@")[0]}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Ready to expand your vocabulary today?
                </p>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-8 w-8 text-blue-100" />
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Words Studied
                      </p>
                      <p className="text-2xl font-bold">{totalWordsStudied}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Award className="h-8 w-8 text-green-100" />
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Mastered
                      </p>
                      <p className="text-2xl font-bold">{masteredWords}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="h-8 w-8 text-purple-100" />
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Accuracy
                      </p>
                      <p className="text-2xl font-bold">{averageAccuracy}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Flame className="h-8 w-8 text-orange-100" />
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Streak
                      </p>
                      <p className="text-2xl font-bold">7 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="study" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white shadow-sm">
              <TabsTrigger
                value="study"
                className="flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Study</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex items-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="study" className="space-y-6">
              {/* Featured Study Section */}
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Continue Your Learning Journey
                      </h2>
                      <p className="text-indigo-100 mb-4">
                        You&apos;re making great progress! Keep up the momentum.
                      </p>
                      <Button
                        size="lg"
                        className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Resume Study Session
                      </Button>
                    </div>
                    <div className="hidden md:block">
                      <Brain className="h-24 w-24 text-white opacity-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vocabulary Lists */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Vocabulary Lists
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {vocabLists?.length || 0} lists available
                  </Badge>
                </div>

                {vocabLists && vocabLists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vocabLists.map((list) => (
                      <Card
                        key={list.id}
                        className="hover:shadow-lg transition-all duration-200 border border-gray-200"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg text-gray-900">
                                {list.title}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                {list.description}
                              </p>
                            </div>
                            <Badge
                              variant={
                                list.difficulty_level === "beginner"
                                  ? "default"
                                  : list.difficulty_level === "intermediate"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="capitalize"
                            >
                              {list.difficulty_level}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{list.total_words} words</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                ~{Math.ceil(list.total_words / 10)} min
                              </span>
                            </div>
                          </div>

                          <Progress
                            value={Math.random() * 100}
                            className="h-2"
                          />

                          <Link href={`/study/${list.id}`}>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                              <Play className="mr-2 h-4 w-4" />
                              Start Learning
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No vocabulary lists yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Ask your admin to upload some vocabulary lists to get
                        started!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Learning Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Mastery</span>
                        <span>
                          {totalWordsStudied > 0
                            ? Math.round(
                                (masteredWords / totalWordsStudied) * 100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          totalWordsStudied > 0
                            ? (masteredWords / totalWordsStudied) * 100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Words Studied
                        </span>
                        <span className="font-semibold">
                          {totalWordsStudied}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Words Mastered
                        </span>
                        <span className="font-semibold text-green-600">
                          {masteredWords}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Average Accuracy
                        </span>
                        <span className="font-semibold text-blue-600">
                          {averageAccuracy}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>Study Streak</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">
                        7
                      </div>
                      <p className="text-gray-600">days in a row</p>
                      <div className="mt-4 flex justify-center space-x-1">
                        {[...Array(7)].map((_, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 bg-orange-500 rounded-full"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-yellow-500 text-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">First Steps</h3>
                    <p className="text-sm text-yellow-100">
                      Completed your first study session
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500 text-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Zap className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Speed Learner</h3>
                    <p className="text-sm text-blue-100">
                      Studied 10 words in one session
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-500 text-white border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Consistency</h3>
                    <p className="text-sm text-green-100">7-day study streak</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

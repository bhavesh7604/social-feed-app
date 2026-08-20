import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import PostComposer from "@/components/PostComposer";

export const revalidate = 0;

export default async function CreatePostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#f8f7ff_0%,#f5f7fb_100%)] text-slate-900">
      <Navbar profile={profile} />
      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-xl font-extrabold tracking-tight">
          Create post
        </h1>
        <PostComposer profile={profile} />
      </main>
    </div>
  );
}

import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthState() {
  await connection();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: null as "client" | "admin" | null };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return { user, role: (profile?.role as "client" | "admin" | undefined) ?? null };
}

import { supabase } from "@/lib/supabase";
import VideoBrowser from "./components/VideoBrowser";

type Channel = { id: string; name: string };
type Genre = { id: string; name: string };
type Member = { id: string; name: string };
type Game = { id: string; name: string };

export default async function Home() {
  const [channelsRes, genresRes, membersRes, gamesRes] = await Promise.all([
    supabase.from("channels").select("id, name").order("name").returns<Channel[]>(),
    supabase.from("genres").select("id, name").order("name").returns<Genre[]>(),
    supabase.from("members").select("id, name").order("name").returns<Member[]>(),
    supabase.from("games").select("id, name").order("name").returns<Game[]>(),
  ]);

  return (
    <VideoBrowser
      channels={channelsRes.data ?? []}
      genres={genresRes.data ?? []}
      members={membersRes.data ?? []}
      games={gamesRes.data ?? []}
    />
  );
}
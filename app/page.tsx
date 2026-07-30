import { supabase } from "@/lib/supabase";
import VideoBrowser from "./components/VideoBrowser";

type Channel = {
  id: string;
  name: string;
};

export default async function Home() {
  const { data: channels } = await supabase
    .from("channels")
    .select("id, name")
    .order("name")
    .returns<Channel[]>();

  return <VideoBrowser channels={channels ?? []} />;
}
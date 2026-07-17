import { supabase } from "@/lib/supabase";

type VideoWithChannel = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  published_at: string;
  view_count: number | null;
  channels: { name: string } | null;
};

export default async function Home() {
  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, title, url, thumbnail_url, published_at, view_count, channels(name)")
    .order("published_at", { ascending: false })
    .returns<VideoWithChannel[]>();

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>動画一覧</h1>
      {videos?.map((video) => (
        <div key={video.id} style={{ marginBottom: "20px" }}>
          <img src={video.thumbnail_url ?? ""} alt={video.title} width={320} />
          <p>{video.title}</p>
          <p>{video.channels?.name}</p>
          <p>投稿日: {new Date(video.published_at).toLocaleDateString()}</p>
          <p>再生回数: {video.view_count}</p>
          <a href={video.url} target="_blank">動画を見る</a>
        </div>
      ))}
    </div>
  );
}
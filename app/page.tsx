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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">動画一覧</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
        {videos?.map((video) => (
          <a key={video.id} href={video.url} target="_blank">
            <img
              src={video.thumbnail_url ?? ""}
              alt={video.title}
              className="w-full aspect-video object-cover rounded-lg"
            />
            <p className="font-semibold mt-2">{video.title}</p>
            <p className="text-sm text-gray-500">{video.channels?.name}</p>
            <p className="text-sm text-gray-500">
              投稿日: {new Date(video.published_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              再生回数: {video.view_count?.toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
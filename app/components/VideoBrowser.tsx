"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import FilterSidebar from "./FilterSidebar";

type VideoWithChannel = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  published_at: string;
  view_count: number | null;
  channel_id: string;
  channels: { name: string } | null;
};

type Channel = {
  id: string;
  name: string;
};

const PAGE_SIZE = 60;

export default function VideoBrowser({ channels }: { channels: Channel[] }) {
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  function toggleChannel(channelId: string) {
    setSelectedChannelIds((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  }

  function buildQuery(pageIndex: number) {
    let query = supabase
      .from("videos")
      .select(
        "id, title, url, thumbnail_url, published_at, view_count, channel_id, channels(name)"
      )
      .order("published_at", { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

    if (selectedChannelIds.length > 0) {
      query = query.in("channel_id", selectedChannelIds);
    }

    if (startDate) {
      query = query.gte("published_at", `${startDate}T00:00:00`);
    }

    if (endDate) {
      query = query.lte("published_at", `${endDate}T23:59:59`);
    }

    return query;
  }

  // 絞り込み条件(チャンネル・期間)が変わるたびに、1ページ目から取得し直す
  useEffect(() => {
    let cancelled = false;

    async function fetchVideos() {
      setIsLoading(true);
      const { data, error } = await buildQuery(0).returns<VideoWithChannel[]>();

      if (!cancelled && !error && data) {
        setVideos(data);
        setHasMore(data.length === PAGE_SIZE);
        setPage(0);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchVideos();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelIds, startDate, endDate]);

  const loadMore = useCallback(async () => {
    setIsLoadingMore((currentlyLoading) => {
      if (currentlyLoading) return currentlyLoading; // 二重読み込みを防ぐ
      return true;
    });
  }, []);

  // isLoadingMoreがtrueになったタイミングで実際に取得する
  useEffect(() => {
    if (!isLoadingMore) return;

    let cancelled = false;
    const nextPage = page + 1;

    async function fetchMore() {
      const { data, error } = await buildQuery(nextPage).returns<VideoWithChannel[]>();

      if (!cancelled && !error && data) {
        setVideos((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
        setPage(nextPage);
      }
      if (!cancelled) setIsLoadingMore(false);
    }

    fetchMore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMore]);

  // 末尾の目印(sentinel)を監視し、画面に近づいたら自動で追加読み込みする
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="flex">
      <FilterSidebar
        channels={channels}
        selectedChannelIds={selectedChannelIds}
        onToggleChannel={toggleChannel}
        startDate={startDate}
        endDate={endDate}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
      />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">テスト版</h1>

        {isLoading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-1">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  className="block p-2 rounded-md hover:bg-gray-100"
                >
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

            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore && (
              <p className="text-center text-gray-500 mt-4">読み込み中...</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
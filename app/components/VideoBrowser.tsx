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
  channels: { name: string; thumbnail_url: string | null } | null;
};

type Channel = {
  id: string;
  name: string;
};

const PAGE_SIZE = 60;

// "2026-07-30T12:00:00" のような日時を "2026/07" の形式にする
function formatYearMonth(dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

// 再生回数を1万単位に丸めて「〇〇万」の形式にする
function formatViewCount(count: number | null) {
  if (count === null || count === undefined) return "-";
  const man = Math.floor(count / 10000);
  return `${man}万`;
}

export default function VideoBrowser({ channels }: { channels: Channel[] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("2014-01-01");
  const [endDate, setEndDate] = useState("");
  const [minViewCount, setMinViewCount] = useState("");
  const [maxViewCount, setMaxViewCount] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function buildQuery(pageIndex: number) {
    let query = supabase
      .from("videos")
      .select(
        "id, title, url, thumbnail_url, published_at, view_count, channel_id, channels(name, thumbnail_url)"
      )
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

    if (sortOrder === "oldest") {
      query = query.order("published_at", { ascending: true });
    } else if (sortOrder === "views") {
      query = query.order("view_count", { ascending: false });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    if (selectedChannelIds.length > 0) {
      query = query.in("channel_id", selectedChannelIds);
    }

    if (startDate) {
      query = query.gte("published_at", `${startDate}T00:00:00`);
    }

    if (endDate) {
      query = query.lte("published_at", `${endDate}T23:59:59`);
    }

    if (minViewCount) {
      query = query.gte("view_count", Number(minViewCount));
    }

    if (maxViewCount) {
      query = query.lte("view_count", Number(maxViewCount));
    }

    if (searchKeyword) {
      query = query.ilike("title", `%${searchKeyword}%`);
    }

    return query;
  }

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
  }, [
    selectedChannelIds,
    startDate,
    endDate,
    minViewCount,
    maxViewCount,
    searchKeyword,
    sortOrder,
  ]);

  const loadMore = useCallback(async () => {
    setIsLoadingMore((currentlyLoading) => {
      if (currentlyLoading) return currentlyLoading;
      return true;
    });
  }, []);

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
    <div>
      <header className="h-16 flex items-center gap-3 px-4 border-b sticky top-0 bg-white z-20">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="text-2xl leading-none p-2 rounded-md hover:bg-gray-100"
          aria-label="サイドバーの開閉"
        >
          ≡
        </button>
        <h1 className="text-2xl font-bold">テスト版</h1>
      </header>

      <div className="flex">
        {isSidebarOpen && (
          <FilterSidebar
            channels={channels}
            selectedChannelIds={selectedChannelIds}
            onToggleChannel={toggleChannel}
            startDate={startDate}
            endDate={endDate}
            onChangeStartDate={setStartDate}
            onChangeEndDate={setEndDate}
            minViewCount={minViewCount}
            maxViewCount={maxViewCount}
            onChangeMinViewCount={setMinViewCount}
            onChangeMaxViewCount={setMaxViewCount}
            searchKeyword={searchInput}
            onChangeSearchKeyword={setSearchInput}
            sortOrder={sortOrder}
            onChangeSortOrder={setSortOrder}
          />
        )}

        <main className="flex-1 p-6">
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
                    <div className="relative group flex gap-2 mt-2">
                      {video.channels?.thumbnail_url ? (
                        <img
                          src={video.channels.thumbnail_url}
                          alt={video.channels.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 bg-gray-200"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full shrink-0 bg-gray-200" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm line-clamp-2">
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatYearMonth(video.published_at)} ・{" "}
                          {formatViewCount(video.view_count)}回視聴
                        </p>
                      </div>

                      {/* 0.3秒ホバーした後に表示される、正確な情報のカード */}
                      <div className="absolute top-0 left-0 right-0 z-30 bg-white border rounded-md shadow-lg p-3 opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-200">
                        <p className="font-semibold text-sm">{video.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {video.channels?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          投稿日:{" "}
                          {new Date(video.published_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          再生回数: {video.view_count?.toLocaleString()}
                        </p>
                      </div>
                    </div>
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
    </div>
  );
}
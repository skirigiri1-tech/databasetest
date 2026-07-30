"use client";

import { useState } from "react";

type Channel = {
  id: string;
  name: string;
};

export default function FilterSidebar({
  channels,
  selectedChannelIds,
  onToggleChannel,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}: {
  channels: Channel[];
  selectedChannelIds: string[];
  onToggleChannel: (channelId: string) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChannelSectionOpen, setIsChannelSectionOpen] = useState(true);
  const [isDateSectionOpen, setIsDateSectionOpen] = useState(true);

  if (!isSidebarOpen) {
    return (
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="p-3 text-sm text-gray-600 border-r h-screen sticky top-0 hover:bg-gray-100"
      >
        絞り込み ▶
      </button>
    );
  }

  return (
    <aside className="w-64 border-r p-4 shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">絞り込み</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-sm text-gray-500 p-2 rounded-md hover:bg-gray-100"
        >
          閉じる ◀
        </button>
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsChannelSectionOpen(!isChannelSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          投稿チャンネル
          <span>{isChannelSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isChannelSectionOpen && (
          <div className="flex flex-col gap-2">
            {channels.map((channel) => (
              <label
                key={channel.id}
                className="flex items-center gap-2 text-sm p-2 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedChannelIds.includes(channel.id)}
                  onChange={() => onToggleChannel(channel.id)}
                />
                {channel.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsDateSectionOpen(!isDateSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          投稿期間
          <span>{isDateSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isDateSectionOpen && (
  <div className="flex flex-col gap-2 px-2">
    <label className="text-sm text-gray-600 p-1 rounded-md hover:bg-gray-100">
      開始日
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChangeStartDate(e.target.value)}
        className="w-full border rounded-md p-1 mt-1 text-sm hover:bg-gray-100"
      />
    </label>
    <label className="text-sm text-gray-600 p-1 rounded-md hover:bg-gray-100">
      終了日
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChangeEndDate(e.target.value)}
        className="w-full border rounded-md p-1 mt-1 text-sm hover:bg-gray-100"
      />
    </label>
    {(startDate || endDate) && (
  <button
    onClick={() => {
      onChangeStartDate("");
      onChangeEndDate("");
    }}
    className="text-xs text-gray-500 mt-1 self-start p-1 rounded-md hover:bg-gray-100"
  >
    期間をクリア
  </button>
)}
  </div>
)}
      </div>
    </aside>
  );
}
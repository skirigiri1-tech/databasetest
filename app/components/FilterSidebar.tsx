"use client";

import { useState } from "react";

type Channel = {
  id: string;
  name: string;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2014 + 1 },
  (_, i) => CURRENT_YEAR - i
);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const VIEW_COUNT_OPTIONS = [
  { label: "100万", value: "1000000" },
  { label: "50万", value: "500000" },
  { label: "10万", value: "100000" },
  { label: "未設定", value: "" },
];

const SORT_OPTIONS = [
  { label: "新しい順", value: "newest" },
  { label: "古い順", value: "oldest" },
  { label: "再生回数順", value: "views" },
];

function parseDate(value: string) {
  if (!value) return { year: "", month: "", day: "" };
  const [year, month, day] = value.split("-");
  return { year, month, day };
}

function combineDate(year: string, month: string, day: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

function daysInMonth(year: string, month: string) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function DateSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { year, month, day } = parseDate(value);
  const dayOptions = Array.from(
    { length: daysInMonth(year, month) },
    (_, i) => i + 1
  );

  function update(newYear: string, newMonth: string, newDay: string) {
    onChange(combineDate(newYear, newMonth, newDay));
  }

  const selectClassName =
    "flex-1 border rounded-md p-1 pl-3 text-sm text-center appearance-none bg-white hover:bg-gray-100";

  return (
    <div className="text-sm text-gray-600">
      <p className="mb-1">{label}</p>
      <div className="flex gap-1">
        <select
          value={year}
          onChange={(e) => update(e.target.value, month, day)}
          className={selectClassName}
        >
          <option value="">年</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => update(year, e.target.value, day)}
          className={selectClassName}
        >
          <option value="">月</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={String(m).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={day}
          onChange={(e) => update(year, month, e.target.value)}
          className={selectClassName}
        >
          <option value="">日</option>
          {dayOptions.map((d) => (
            <option key={d} value={String(d).padStart(2, "0")}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ViewCountSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm text-gray-600">
      <p className="mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md p-1 text-sm text-center appearance-none bg-white hover:bg-gray-100"
      >
        {VIEW_COUNT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterSidebar({
  channels,
  selectedChannelIds,
  onToggleChannel,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  minViewCount,
  maxViewCount,
  onChangeMinViewCount,
  onChangeMaxViewCount,
  searchKeyword,
  onChangeSearchKeyword,
  sortOrder,
  onChangeSortOrder,
}: {
  channels: Channel[];
  selectedChannelIds: string[];
  onToggleChannel: (channelId: string) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  minViewCount: string;
  maxViewCount: string;
  onChangeMinViewCount: (value: string) => void;
  onChangeMaxViewCount: (value: string) => void;
  searchKeyword: string;
  onChangeSearchKeyword: (value: string) => void;
  sortOrder: string;
  onChangeSortOrder: (value: string) => void;
}) {
  const [isSortSectionOpen, setIsSortSectionOpen] = useState(true);
  const [isSearchSectionOpen, setIsSearchSectionOpen] = useState(true);
  const [isChannelSectionOpen, setIsChannelSectionOpen] = useState(true);
  const [isDateSectionOpen, setIsDateSectionOpen] = useState(true);
  const [isViewCountSectionOpen, setIsViewCountSectionOpen] = useState(true);

  return (
    <aside className="w-64 border-r p-4 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsSortSectionOpen(!isSortSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          並べ替え
          <span>{isSortSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isSortSectionOpen && (
          <div className="px-2">
            <select
              value={sortOrder}
              onChange={(e) => onChangeSortOrder(e.target.value)}
              className="w-full border rounded-md p-1 text-sm text-center appearance-none bg-white hover:bg-gray-100"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsSearchSectionOpen(!isSearchSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          文字検索
          <span>{isSearchSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isSearchSectionOpen && (
          <div className="px-2">
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => onChangeSearchKeyword(e.target.value)}
                placeholder="タイトルを検索"
                className="w-full border rounded-md p-2 pr-8 text-sm hover:bg-gray-100 focus:bg-white"
              />
              <button
                onClick={() => onChangeSearchKeyword("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}
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
          <div className="flex flex-col gap-3 px-2">
            <DateSelector label="開始日" value={startDate} onChange={onChangeStartDate} />
            <DateSelector label="終了日" value={endDate} onChange={onChangeEndDate} />
            <button
              onClick={() => {
                onChangeStartDate("2014-01-01");
                onChangeEndDate("");
              }}
              className="text-xs text-gray-500 mt-1 self-start p-1 rounded-md hover:bg-gray-100"
            >
              期間をクリア
            </button>
          </div>
        )}
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsViewCountSectionOpen(!isViewCountSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          再生回数
          <span>{isViewCountSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isViewCountSectionOpen && (
          <div className="flex flex-col gap-3 px-2">
            <ViewCountSelector
              label="最大値"
              value={maxViewCount}
              onChange={onChangeMaxViewCount}
            />
            <ViewCountSelector
              label="最小値"
              value={minViewCount}
              onChange={onChangeMinViewCount}
            />
            <button
              onClick={() => {
                onChangeMinViewCount("");
                onChangeMaxViewCount("");
              }}
              className="text-xs text-gray-500 mt-1 self-start p-1 rounded-md hover:bg-gray-100"
            >
              再生回数をクリア
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
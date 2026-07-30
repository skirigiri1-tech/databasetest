"use client";

import { useState } from "react";

type Channel = {
  id: string;
  name: string;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2014 + 1 },
  (_, i) => 2014 + i
);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const VIEW_COUNT_OPTIONS = [
  { label: "100万", value: "1000000" },
  { label: "50万", value: "500000" }, 
  { label: "10万", value: "100000" },  
  { label: "未設定", value: "" },

 


];

// "2024-03-05" のような文字列を { year, month, day } に分解する
function parseDate(value: string) {
  if (!value) return { year: "", month: "", day: "" };
  const [year, month, day] = value.split("-");
  return { year, month, day };
}

// year, month, day から "2024-03-05" のような文字列を組み立てる
function combineDate(year: string, month: string, day: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

// 指定した年・月の日数を求める(2月28/29日などのズレを防ぐため)
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
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChannelSectionOpen, setIsChannelSectionOpen] = useState(true);
  const [isDateSectionOpen, setIsDateSectionOpen] = useState(true);
  const [isViewCountSectionOpen, setIsViewCountSectionOpen] = useState(true);

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
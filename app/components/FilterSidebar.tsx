"use client";

import { useState } from "react";

type Channel = { id: string; name: string };
type Genre = { id: string; name: string };
type Member = { id: string; name: string };
type Game = { id: string; name: string };

export const UNSPECIFIED_ID = "unspecified-participants";

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

import { useEffect } from "react";

function DateSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [local, setLocal] = useState(() => parseDate(value));

  useEffect(() => {
    setLocal(parseDate(value));
  }, [value]);

  const { year, month, day } = local;
  const dayOptions = Array.from(
    { length: daysInMonth(year, month) },
    (_, i) => i + 1
  );

  function update(newYear: string, newMonth: string, newDay: string) {
    setLocal({ year: newYear, month: newMonth, day: newDay });
    const combined = combineDate(newYear, newMonth, newDay);
    if (combined) {
      onChange(combined);
    }
  }

  const selectClassName =
    "flex-1 border rounded-md p-1 pl-3 text-sm text-center appearance-none bg-white hover:bg-gray-100";

  return (
    <div className="text-sm text-gray-600">
      <p className="mb-1">{label}</p>
      <div className="flex gap-1">
        <select value={year} onChange={(e) => update(e.target.value, month, day)} className={selectClassName}>
          <option value="">年</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => update(year, e.target.value, day)} className={selectClassName}>
          <option value="">月</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={String(m).padStart(2, "0")}>{m}</option>
          ))}
        </select>
        <select value={day} onChange={(e) => update(year, month, e.target.value)} className={selectClassName}>
          <option value="">日</option>
          {dayOptions.map((d) => (
            <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
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
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ButtonList({
  items,
  selectedIds,
  onToggle,
}: {
  items: { id: string; name: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-2">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`px-3 py-1 rounded-full text-sm border ${
              isSelected
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

function MemberButtonList({
  items,
  includeIds,
  excludeIds,
  onCycle,
}: {
  items: { id: string; name: string }[];
  includeIds: string[];
  excludeIds: string[];
  onCycle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-2">
      {items.map((item) => {
        const isInclude = includeIds.includes(item.id);
        const isExclude = excludeIds.includes(item.id);
        const colorClass = isInclude
          ? "bg-green-500 text-white border-green-500"
          : isExclude
          ? "bg-red-500 text-white border-red-500"
          : "bg-white text-gray-700 hover:bg-gray-100";
        return (
          <button
            key={item.id}
            onClick={() => onCycle(item.id)}
            className={`px-3 py-1 rounded-full text-sm border ${colorClass}`}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterSidebar({
  isOpen,
  channels,
  selectedChannelIds,
  onToggleChannel,
  genres,
  selectedGenreIds,
  onToggleGenre,
  members,
  memberIncludeIds,
  memberExcludeIds,
  onCycleMember,
  games,
  selectedGameIds,
  onToggleGame,
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
  isOpen: boolean;
  channels: Channel[];
  selectedChannelIds: string[];
  onToggleChannel: (channelId: string) => void;
  genres: Genre[];
  selectedGenreIds: string[];
  onToggleGenre: (id: string) => void;
  members: Member[];
  memberIncludeIds: string[];
  memberExcludeIds: string[];
  onCycleMember: (id: string) => void;
  games: Game[];
  selectedGameIds: string[];
  onToggleGame: (id: string) => void;
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
const [isChannelSectionOpen, setIsChannelSectionOpen] = useState(true);
const [isGenreSectionOpen, setIsGenreSectionOpen] = useState(true);
const [isMemberSectionOpen, setIsMemberSectionOpen] = useState(true);
const [isGameSectionOpen, setIsGameSectionOpen] = useState(true);
const [isDateSectionOpen, setIsDateSectionOpen] = useState(true);
const [isViewCountSectionOpen, setIsViewCountSectionOpen] = useState(true);
  const memberItems = [{ id: UNSPECIFIED_ID, name: "参加勢" }, ...members];

return (
  <aside
    className={`w-64 border-r p-4 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain ${
      isOpen ? "" : "hidden"
    }`}
  >
      <div className="border-b pb-3 mb-3">
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => onChangeSortOrder(e.target.value)}
            className="w-full border rounded-md p-2 pr-8 text-sm text-center appearance-none bg-white hover:bg-gray-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">∨</span>
        </div>
      </div>

      <div className="border-b pb-3 mb-3">
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

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsChannelSectionOpen(!isChannelSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          投稿チャンネル
          <span>{isChannelSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isChannelSectionOpen && (
  <ButtonList items={channels} selectedIds={selectedChannelIds} onToggle={onToggleChannel} />
)}
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsGenreSectionOpen(!isGenreSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          ジャンル
          <span>{isGenreSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isGenreSectionOpen && (
          <ButtonList items={genres} selectedIds={selectedGenreIds} onToggle={onToggleGenre} />
        )}
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsMemberSectionOpen(!isMemberSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          出演者
          <span>{isMemberSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isMemberSectionOpen && (
          <>
            <p className="text-xs text-gray-400 mb-2 px-2">
              クリックで 含む(緑) → 除外(赤) → 未選択 と切り替わります
            </p>
            <MemberButtonList
              items={memberItems}
              includeIds={memberIncludeIds}
              excludeIds={memberExcludeIds}
              onCycle={onCycleMember}
            />
          </>
        )}
      </div>

      <div className="border-b pb-3 mb-3">
        <button
          onClick={() => setIsGameSectionOpen(!isGameSectionOpen)}
          className="w-full flex items-center justify-between font-semibold mb-2 p-2 rounded-md hover:bg-gray-100"
        >
          ゲーム
          <span>{isGameSectionOpen ? "▲" : "▼"}</span>
        </button>

        {isGameSectionOpen && (
          <ButtonList items={games} selectedIds={selectedGameIds} onToggle={onToggleGame} />
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
            <ViewCountSelector label="最大値" value={maxViewCount} onChange={onChangeMaxViewCount} />
            <ViewCountSelector label="最小値" value={minViewCount} onChange={onChangeMinViewCount} />
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
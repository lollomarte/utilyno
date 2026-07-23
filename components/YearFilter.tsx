"use client";

export type YearFilterValue = "" | string;

export function YearFilter({
  years,
  value,
  onChange,
}: {
  years: string[];
  value: YearFilterValue;
  onChange: (value: YearFilterValue) => void;
}) {
  const options: { value: YearFilterValue; label: string }[] = [
    { value: "", label: "Tutte" },
    ...years.map((y) => ({ value: y, label: y })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((o) => (
        <button
          key={o.value || "tutte"}
          type="button"
          onClick={() => onChange(o.value)}
          className={`tap px-3 py-1.5 text-sm rounded-full border transition-colors ${
            value === o.value
              ? "bg-accent text-[#06210f] border-accent"
              : "border-line text-muted hover:text-ink hover:border-line-strong"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

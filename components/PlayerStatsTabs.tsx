"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDateShort } from "@/lib/format";
import type { AttackStats, RendimentoStats, ContinuitaStats } from "@/lib/playerProfileStats";

type TabKey = "attacco" | "squadra" | "continuita";

const tabs: { key: TabKey; label: string }[] = [
  { key: "attacco", label: "Attacco" },
  { key: "squadra", label: "Squadra" },
  { key: "continuita", label: "Continuità" },
];

function monthLabel(meseKey: string): string {
  const [y, m] = meseKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function PlayerStatsTabs({
  attacco,
  squadra,
  continuita,
}: {
  attacco: AttackStats;
  squadra: RendimentoStats;
  continuita: ContinuitaStats;
}) {
  const [tab, setTab] = useState<TabKey>("attacco");

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex gap-1 rounded-full border border-line p-1 w-fit mx-auto mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`tap px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              tab === t.key ? "bg-accent text-[#06210f]" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "attacco" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <MiniStat label="Gol squadra fatti" value={attacco.golSquadraTotali} />
            <MiniStat label="Gol squadra subiti" value={attacco.golSubitiTotali} />
            <MiniStat label="Differenza reti" value={attacco.differenzaReti} signed />
            <MiniStat label="Media fatti/partita" value={attacco.mediaGolSquadra} decimals={2} />
            <MiniStat label="Media subiti/partita" value={attacco.mediaGolSubiti} decimals={2} />
          </div>
          {(attacco.miglioreAttacco || attacco.peggioreDifesa) && (
            <div className="flex flex-col gap-2">
              {attacco.miglioreAttacco && (
                <RecordRow
                  label="Miglior attacco di squadra"
                  value={`${attacco.miglioreAttacco.golSquadra} gol`}
                  matchId={attacco.miglioreAttacco.matchId}
                  data={attacco.miglioreAttacco.data}
                />
              )}
              {attacco.peggioreDifesa && (
                <RecordRow
                  label="Più gol subiti dalla squadra"
                  value={`${attacco.peggioreDifesa.golSubiti} gol`}
                  matchId={attacco.peggioreDifesa.matchId}
                  data={attacco.peggioreDifesa.data}
                />
              )}
            </div>
          )}
        </div>
      )}

      {tab === "squadra" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2.5">
            <MiniStat label="Vittorie" value={squadra.vittorie} />
            <MiniStat label="Pareggi" value={squadra.pareggi} />
            <MiniStat label="Sconfitte" value={squadra.sconfitte} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat label="% vittorie" value={squadra.percentualeVittorie} suffix="%" />
            <MiniStat label="% partite MVP" value={squadra.percentualeMvp} suffix="%" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <StreakStat
              label="Striscia vittorie"
              current={squadra.strisciaVittorieAttuale}
              record={squadra.strisciaVittorieRecord}
            />
            <StreakStat
              label="Imbattibilità"
              current={squadra.strisciaImbattibilitaAttuale}
              record={squadra.strisciaImbattibilitaRecord}
            />
          </div>
          <MiniStat label="MVP totali" value={squadra.mvpTotali} />
        </div>
      )}

      {tab === "continuita" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat label="% presenza" value={continuita.percentualePresenza} suffix="%" />
            <StreakStat
              label="Presenze consecutive"
              current={continuita.strisciaPresenzeAttuale}
              record={continuita.strisciaPresenzeRecord}
            />
          </div>
          {continuita.migliorMese && (
            <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
              <p className="font-display text-lg font-bold tabular-nums">{continuita.migliorMese.presenze}</p>
              <p className="text-xs text-muted capitalize">
                presenze in {monthLabel(continuita.migliorMese.meseKey)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  decimals = 0,
  suffix = "",
  signed = false,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  signed?: boolean;
}) {
  const formatted = value.toFixed(decimals);
  const display = signed && value > 0 ? `+${formatted}` : formatted;
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
      <p className="font-display text-lg font-bold tabular-nums">
        {display}
        {suffix}
      </p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function StreakStat({ label, current, record }: { label: string; current: number; record: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
      <div className="flex items-center justify-center gap-3">
        <div>
          <p className="font-display text-lg font-bold tabular-nums">{current}</p>
          <p className="text-[10px] text-muted">attuale</p>
        </div>
        <div className="w-px h-6 bg-line" />
        <div>
          <p className="font-display text-lg font-bold tabular-nums text-accent">{record}</p>
          <p className="text-[10px] text-muted">record</p>
        </div>
      </div>
      <p className="text-[11px] text-muted mt-1.5">{label}</p>
    </div>
  );
}

function RecordRow({
  label,
  value,
  matchId,
  data,
}: {
  label: string;
  value: string;
  matchId: string;
  data: string;
}) {
  return (
    <Link
      href={`/risultati/${matchId}`}
      className="tap flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 hover:border-line-strong text-sm"
    >
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-display font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted">{formatDateShort(data)}</span>
      </span>
    </Link>
  );
}

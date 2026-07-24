import { Children } from "react";
import { getRecordsPageData } from "@/lib/data/records";
import { RecordsBanner } from "@/components/RecordsBanner";
import { RecordCard } from "@/components/RecordCard";
import { EmptyState } from "@/components/EmptyState";
import { formatDateShort } from "@/lib/format";

export default async function RecordPage() {
  const data = await getRecordsPageData();

  if (data.groupTotals.totalMatches === 0) {
    return (
      <EmptyState>
        Nessuna partita disputata ancora: i record arrivano dopo il primo calciotto ⚽
      </EmptyState>
    );
  }

  const {
    groupTotals,
    currentYearVsRecord,
    recordGoliPartita,
    mvpStreak,
    winStreak,
    unbeatenStreak,
    attendanceStreak,
    decano,
    fedele,
    biggestTotalGoalsMatch,
    biggestBlowout,
    goleadaWinners,
    goleadaLosers,
    bestGoalMonth,
    mostFrequentTeammates,
    mostFrequentOpponents,
  } = data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="sr-only">Record</h1>
        <RecordsBanner totals={groupTotals} yearComparison={currentYearVsRecord} />
      </div>

      <Section title="Record individuali — singola partita">
        {recordGoliPartita && (
          <RecordCard
            icon="🎯"
            title="Più gol in una singola partita"
            value={recordGoliPartita.gol}
            rows={recordGoliPartita.entries.map((e) => ({
              holders: [e.player],
              href: `/risultati/${e.matchId}`,
              label: formatDateShort(e.data),
            }))}
          />
        )}
        {mvpStreak && (
          <RecordCard
            icon="⭐"
            title="Striscia di MVP consecutivi più lunga"
            value={mvpStreak.value}
            rows={[{ holders: mvpStreak.holders }]}
          />
        )}
      </Section>

      <Section title="Record individuali — strisce e continuità">
        {winStreak && (
          <RecordCard
            icon="🔥"
            title="Striscia di vittorie consecutive più lunga"
            value={winStreak.value}
            rows={[{ holders: winStreak.holders }]}
          />
        )}
        {attendanceStreak && (
          <RecordCard
            icon="📅"
            title="Striscia di presenze consecutive più lunga"
            value={attendanceStreak.value}
            rows={[{ holders: attendanceStreak.holders }]}
          />
        )}
        {unbeatenStreak && (
          <RecordCard
            icon="🛡️"
            title="Striscia di imbattibilità più lunga"
            value={unbeatenStreak.value}
            rows={[{ holders: unbeatenStreak.holders }]}
          />
        )}
        {decano && (
          <RecordCard
            icon="👴"
            title="Il Decano — più presenze totali"
            value={decano.value}
            rows={[{ holders: decano.holders }]}
          />
        )}
        {fedele && (
          <RecordCard
            icon="❤️"
            title="Il più fedele — % presenza più alta"
            value={fedele.value}
            suffix="%"
            decimals={1}
            rows={[{ holders: fedele.holders }]}
            note={`Presenze da quando ha debuttato, minimo ${fedele.minPresenze} partite giocate.`}
          />
        )}
      </Section>

      <Section title="Record di squadra/partita">
        {biggestTotalGoalsMatch && (
          <RecordCard
            icon="🥅"
            title="Partita con più gol totali di sempre"
            value={biggestTotalGoalsMatch.value}
            rows={biggestTotalGoalsMatch.matches.map((m) => ({
              href: `/risultati/${m.matchId}`,
              label: `${formatDateShort(m.data)} · ${m.golBianca}–${m.golNera}`,
            }))}
          />
        )}
        {biggestBlowout && (
          <RecordCard
            icon="💥"
            title="Goleada più larga di sempre"
            value={biggestBlowout.value}
            rows={biggestBlowout.matches.map((m) => ({
              href: `/risultati/${m.matchId}`,
              label: `${formatDateShort(m.data)} · ${m.golBianca}–${m.golNera}`,
            }))}
          />
        )}
        {goleadaWinners && (
          <RecordCard
            icon="😎"
            title="Più goleade vinte"
            value={goleadaWinners.value}
            rows={[{ holders: goleadaWinners.holders }]}
          />
        )}
        {goleadaLosers && (
          <RecordCard
            icon="😬"
            title="Più goleade subite"
            value={goleadaLosers.value}
            accent={false}
            rows={[{ holders: goleadaLosers.holders }]}
          />
        )}
      </Section>

      <Section title="Curiosità">
        {bestGoalMonth && (
          <RecordCard
            icon="📆"
            title="Mese con più gol segnati dal gruppo"
            value={bestGoalMonth.value}
            rows={bestGoalMonth.months.map((m) => ({ label: m.label }))}
          />
        )}
        {mostFrequentTeammates && (
          <RecordCard
            icon="🤝"
            title="La coppia che ha giocato più volte insieme"
            value={mostFrequentTeammates.value}
            rows={mostFrequentTeammates.pairs.map((p) => ({ holders: [p.a, p.b] }))}
          />
        )}
        {mostFrequentOpponents && (
          <RecordCard
            icon="⚔️"
            title="La coppia più spesso avversaria"
            value={mostFrequentOpponents.value}
            rows={mostFrequentOpponents.pairs.map((p) => ({ holders: [p.a, p.b] }))}
          />
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const cards = Children.toArray(children);
  if (cards.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-lg font-bold mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{cards}</div>
    </section>
  );
}

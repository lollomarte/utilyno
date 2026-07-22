import { TabNav } from "@/components/TabNav";

const tabs = [
  { href: "/classifiche/marcatori", label: "Marcatori" },
  { href: "/classifiche/vittorie", label: "Vittorie" },
  { href: "/classifiche/presenze", label: "Presenze" },
  { href: "/classifiche/mvp", label: "MVP" },
  { href: "/classifiche/record", label: "Record" },
];

export default function ClassificheLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Classifiche</h1>
      <TabNav tabs={tabs} />
      {children}
    </div>
  );
}

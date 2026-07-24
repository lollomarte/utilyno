import { TabNav } from "@/components/TabNav";

const tabs = [
  { href: "/gioco", label: "Gioca" },
  { href: "/gioco/classifica", label: "Classifica" },
];

export default function GiocoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Chi vale di più?</h1>
      <TabNav tabs={tabs} />
      {children}
    </div>
  );
}

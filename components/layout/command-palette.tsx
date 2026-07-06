"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { getNavIcon } from "@/components/layout/nav-icons";
import type { NavItem } from "@/components/layout/sidebar";

interface CommandPaletteContextValue {
  open: () => void;
}
const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

/**
 * Elenca solo le voci di navigazione già assegnate al ruolo corrente
 * (le stesse di Sidebar/TabBar): nessuna azione o rotta nuova, e
 * l'autorizzazione resta comunque quella imposta lato server da ogni
 * layout — qui è solo una scorciatoia di navigazione.
 */
export function CommandPaletteProvider({ navItems, children }: { navItems: NavItem[]; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <CommandPaletteContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <div className="fixed inset-0 bg-ink/40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <Command
            label="Comandi rapidi"
            shouldFilter
            className="animate-page-in relative w-full max-w-lg overflow-hidden rounded-card bg-surface shadow-elevated motion-reduce:animate-none"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-subtle" strokeWidth={2} aria-hidden="true" />
              <Command.Input
                autoFocus
                placeholder="Vai a…"
                className="h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-sm text-ink-subtle">Nessun risultato.</Command.Empty>
              <Command.Group
                heading="Vai a"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-ink-subtle"
              >
                {navItems.map((item) => {
                  const Icon = getNavIcon(item.href);
                  return (
                    <Command.Item
                      key={item.href}
                      value={item.label}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2 text-sm text-ink data-[selected=true]:bg-surface-sunken"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} aria-hidden="true" />
                      {item.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}

export function CommandPaletteTrigger() {
  const { open } = useCommandPalette();
  return (
    <button
      type="button"
      onClick={open}
      className="hidden items-center gap-1.5 rounded-control border border-border px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors duration-[var(--duration-micro)] ease-[var(--ease-loqo)] hover:bg-surface-sunken hover:text-ink md:flex"
    >
      <Search className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      <span>Cerca</span>
      <kbd className="rounded border border-border bg-surface-sunken px-1 font-sans text-[10px]">Ctrl K</kbd>
    </button>
  );
}

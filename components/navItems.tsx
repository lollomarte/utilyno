export interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (active) => (
      <path
        d="M4 11.5 12 5l8 6.5M6 10v9h5v-5h2v5h5v-9"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/classifiche/marcatori",
    label: "Classifiche",
    icon: (active) => (
      <path
        d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/risultati",
    label: "Risultati",
    icon: (active) => (
      <path
        d="M4 5h16v15H4zM4 9h16M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/mercato",
    label: "Mercato",
    icon: (active) => (
      <path
        d="M4 17 9.5 11.5 13.5 15 20 8M20 8h-4.5M20 8v4.5"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/top8",
    label: "Top 8",
    icon: (active) => (
      <path
        d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 3.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/record",
    label: "Record",
    icon: (active) => (
      <path
        d="M7 4h10v2a5 5 0 0 1-10 0V4ZM5 6H3v1a4 4 0 0 0 4 4M19 6h2v1a4 4 0 0 1-4 4M12 15v3M8 21h8"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/head-to-head",
    label: "H2H",
    icon: (active) => (
      <path
        d="M9 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM15 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-3 2.4-5 5-5s5 2 5 5M10 20c0-3 2.4-5 5-5s5 2 5 5"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const section = "/" + href.split("/")[1];
  return pathname.startsWith(section);
}

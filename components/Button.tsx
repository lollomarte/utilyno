import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-bright",
  secondary: "border border-line-strong text-ink bg-surface-2 hover:bg-surface-3",
  ghost: "text-muted hover:text-ink hover:bg-surface-3",
};

const base =
  "tap inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold px-4 py-2.5 min-h-11 disabled:opacity-50 disabled:pointer-events-none transition-colors";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variantClass[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string }) {
  return <Link href={href} className={`${base} ${variantClass[variant]} ${className}`} {...props} />;
}

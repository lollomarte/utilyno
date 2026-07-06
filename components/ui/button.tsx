import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-slate-400",
  secondary: "bg-white text-ink ring-1 ring-inset ring-border hover:bg-surface-muted",
  danger: "bg-danger text-white hover:opacity-90 disabled:bg-red-300",
  ghost: "text-ink-muted hover:bg-surface-sunken",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Solo la variante primary porta "Il Timbro" (vedi globals.css): è l'unica
 * superficie davvero primaria della UI. Le altre varianti restano quiete —
 * solo un cambio di colore, senza scala al press — per disciplina d'uso
 * della firma visiva (DESIGN_PLAN.md §4).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "touch-target inline-flex items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-transition)] ease-[var(--ease-loqo)] disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          variant === "primary" && "timbro",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

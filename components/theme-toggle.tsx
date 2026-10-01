"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, type MouseEvent } from "react";

type Origin = { x: number; y: number };

/**
 * Switch light/dark with the new theme spreading out as a circle from `origin`
 * (the button that was pressed, or the screen centre).
 *
 * Uses the View Transitions API: the browser snapshots the old page, we swap
 * the class, and the new snapshot is revealed through a growing clip-path.
 * Browsers without it — or visitors who prefer reduced motion — just switch.
 */
export function useThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();

  return useCallback(
    (origin?: Origin) => {
      const next = resolvedTheme === "dark" ? "light" : "dark";
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!document.startViewTransition || reduced) {
        setTheme(next);
        return;
      }

      const { x, y } = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const transition = document.startViewTransition(() => {
        // next-themes applies its class in an effect, which lands after the
        // browser takes the "new" snapshot. Apply it here so the snapshot is
        // already themed; next-themes then re-applies the same class.
        const root = document.documentElement;
        root.classList.toggle("dark", next === "dark");
        root.classList.toggle("light", next === "light");
        root.style.colorScheme = next;
        setTheme(next);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 650,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [resolvedTheme, setTheme]
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const switchTheme = useThemeSwitch();

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    switchTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  // The theme isn't known on the server, so pick the icon with CSS off the
  // `dark` class rather than from state — no flash, no hydration mismatch.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle dark mode"
      data-cursor-text="Switch theme"
      className={`block transition-colors hover:text-brand ${className}`}
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  );
}

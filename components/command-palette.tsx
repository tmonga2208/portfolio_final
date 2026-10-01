"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Camera,
  Code2,
  Copy,
  CornerDownLeft,
  Github,
  Layers,
  Linkedin,
  Mail,
  Map as MapIcon,
  Music,
  Search,
  SunMoon,
  User,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PLAYER_TOGGLE_EVENT } from "@/components/player";
import { useThemeSwitch } from "@/components/theme-toggle";
import { copyEmail, EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "command-palette:open";

/** Open the palette from a button elsewhere on the page. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Command = {
  id: string;
  group: "Go to" | "Actions" | "Elsewhere";
  label: string;
  icon: LucideIcon;
  /** Extra words that should match the search, beyond the label. */
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const switchTheme = useThemeSwitch();

  // ⌘K / Ctrl+K toggles from anywhere; other components open it via the event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActive(0);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const commands = useMemo<Command[]>(() => {
    // Section links work from the library page too, by routing home first.
    const goTo = (id: string) => () => {
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/#${id}`);
      }
    };
    const external = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");

    return [
      { id: "about", group: "Go to", label: "About", icon: User, run: goTo("about") },
      { id: "experience", group: "Go to", label: "Experience", icon: Briefcase, keywords: "work history jobs", run: goTo("experience") },
      { id: "work", group: "Go to", label: "Selected work", icon: Layers, keywords: "clients", run: goTo("work") },
      { id: "projects", group: "Go to", label: "Projects", icon: Code2, keywords: "built side", run: goTo("projects") },
      { id: "stack", group: "Go to", label: "Stack", icon: Layers, keywords: "tools tech skills", run: goTo("stack") },
      { id: "travel", group: "Go to", label: "Travel", icon: MapIcon, keywords: "trips map places", run: goTo("travel") },
      { id: "gallery", group: "Go to", label: "Gallery", icon: Camera, keywords: "photos moments", run: goTo("gallery") },
      { id: "contact", group: "Go to", label: "Contact", icon: Mail, keywords: "hire email", run: goTo("contact") },
      { id: "library", group: "Go to", label: "Library", icon: BookOpen, keywords: "books reading", run: () => router.push("/library") },

      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        icon: Copy,
        keywords: EMAIL,
        run: async () => {
          if (!(await copyEmail())) window.location.href = `mailto:${EMAIL}`;
        },
      },
      { id: "theme", group: "Actions", label: "Toggle dark mode", icon: SunMoon, keywords: "theme light dark", run: () => switchTheme() },
      {
        id: "music",
        group: "Actions",
        label: "Play / pause music",
        icon: Music,
        keywords: "spotify song player",
        run: () => window.dispatchEvent(new Event(PLAYER_TOGGLE_EVENT)),
      },

      { id: "github", group: "Elsewhere", label: "GitHub", icon: Github, keywords: "code repos", run: external(GITHUB_URL) },
      { id: "linkedin", group: "Elsewhere", label: "LinkedIn", icon: Linkedin, run: external(LINKEDIN_URL) },
    ];
  }, [pathname, router, switchTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  };

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    changeOpen(false);
    // Let the dialog close (and give focus back) before scrolling or navigating.
    requestAnimationFrame(() => command.run());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  };

  let lastGroup: string | null = null;

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[130] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onKeyDown={onKeyDown}
          aria-describedby={undefined}
          className="fixed left-1/2 top-[18vh] z-[131] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background font-sans shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Jump to a section, copy my email, switch theme…"
              role="combobox"
              aria-expanded
              aria-controls="command-list"
              aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
              ESC
            </kbd>
          </div>

          <div ref={listRef} id="command-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                Nothing matches “{query}”.
              </p>
            )}

            {results.map((command, i) => {
              const header = command.group !== lastGroup ? command.group : null;
              lastGroup = command.group;
              const Icon = command.icon;
              const selected = i === active;
              return (
                <div key={command.id}>
                  {header && (
                    <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {header}
                    </p>
                  )}
                  <div
                    id={`command-${command.id}`}
                    data-index={i}
                    role="option"
                    aria-selected={selected}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(command)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      selected ? "bg-brand text-brand-foreground" : "text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
                    <span className="flex-1">{command.label}</span>
                    {selected &&
                      (command.group === "Go to" ? (
                        <ArrowRight className="size-4 opacity-70" />
                      ) : (
                        <CornerDownLeft className="size-4 opacity-70" />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>↑↓ to move · ↵ to select</span>
            <span>⌘K to toggle</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

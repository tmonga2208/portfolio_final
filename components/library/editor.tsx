"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BOOK_STATUSES, type Book, type BookStatus } from "@/types/library";

interface Candidate {
  title: string;
  author: string;
  coverUrl: string;
}

interface Notice {
  tone: "ok" | "error";
  text: string;
}

const LABEL = "text-xs uppercase tracking-[0.25em] text-muted-foreground";
const SELECT =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
  return data as T;
}

const send = <T,>(url: string, body: unknown) =>
  api<T>(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function LibraryLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return <p className="text-muted-foreground">The library editor isn&apos;t set up on this deployment.</p>;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await send("/api/library/session", { password });
      router.refresh();
    } catch (cause) {
      setError((cause as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="font-crimson text-4xl font-bold text-brand">Library editor</h1>
      <label className="flex flex-col gap-2">
        <span className={LABEL}>Password</span>
        <Input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy || !password}>
        {busy && <Loader2 className="animate-spin" />}
        Log in
      </Button>
    </form>
  );
}

/** One search result. Hosts answer a missing cover with a 1px image, so those hide themselves. */
function CoverChoice({
  candidate,
  picked,
  onPick,
}: {
  candidate: Candidate;
  picked: boolean;
  onPick: () => void;
}) {
  const [usable, setUsable] = useState(true);
  if (!usable) return null;

  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      title={`${candidate.title}: ${candidate.author}`}
      className={cn(
        "relative w-24 shrink-0 overflow-hidden rounded-md border-2 border-transparent text-left outline-none transition-opacity focus-visible:ring-[3px] focus-visible:ring-ring/50",
        picked ? "border-brand" : "opacity-80 hover:opacity-100"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote candidates, shown once and never optimised */}
      <img
        src={candidate.coverUrl}
        alt={candidate.title}
        loading="lazy"
        className="aspect-2/3 w-full bg-muted object-cover"
        onError={() => setUsable(false)}
        onLoad={(e) => e.currentTarget.naturalWidth < 100 && setUsable(false)}
      />
      {picked && (
        <span className="absolute right-1 top-1 rounded-full bg-brand p-0.5 text-brand-foreground">
          <Check className="size-3.5" />
        </span>
      )}
    </button>
  );
}

function AddBook({
  series,
  disabled,
  onAdd,
}: {
  series: string[];
  disabled: boolean;
  onAdd: (book: Candidate & { series: string; status: BookStatus }) => Promise<boolean>;
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [shelf, setShelf] = useState("");
  const [status, setStatus] = useState<BookStatus>("reading");
  const [error, setError] = useState("");

  async function search(event: FormEvent) {
    event.preventDefault();
    setSearching(true);
    setError("");
    try {
      const data = await api<{ results: Candidate[] }>(`/api/library/search?q=${encodeURIComponent(query)}`);
      setResults(data.results);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSearching(false);
    }
  }

  function pick(candidate: Candidate) {
    setPicked(candidate);
    setTitle(candidate.title);
    setAuthor(candidate.author);
  }

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!picked) return;
    const added = await onAdd({ title, author, coverUrl: picked.coverUrl, series: shelf, status });
    if (!added) return;
    setQuery("");
    setResults(null);
    setPicked(null);
    setShelf("");
  }

  return (
    <section className="rounded-2xl border border-border p-5 md:p-6">
      <h2 className={LABEL}>Add a book</h2>
      <form onSubmit={search} className="mt-4 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, or title and author"
          aria-label="Search for a book"
        />
        <Button type="submit" variant="outline" disabled={searching || query.trim().length < 2}>
          {searching ? <Loader2 className="animate-spin" /> : <Search />}
          Search
        </Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

      {results && (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground">
            {results.length ? "Pick the cover you want." : "Nothing found. Try adding the author."}
          </p>
          <div className="scrollbar-hide -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 md:-mx-6 md:px-6">
            {results.map((candidate) => (
              <CoverChoice
                key={candidate.coverUrl}
                candidate={candidate}
                picked={picked?.coverUrl === candidate.coverUrl}
                onPick={() => pick(candidate)}
              />
            ))}
          </div>
        </div>
      )}

      {picked && (
        <form onSubmit={add} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={LABEL}>Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL}>Author</span>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} required maxLength={120} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL}>Series (optional)</span>
            <Input
              value={shelf}
              onChange={(e) => setShelf(e.target.value)}
              list="library-series"
              maxLength={120}
              placeholder="Leave empty for a standalone"
            />
            <datalist id="library-series">
              {series.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL}>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)} className={SELECT}>
              {BOOK_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={disabled} className="sm:col-span-2">
            {disabled && <Loader2 className="animate-spin" />}
            Add to the shelf
          </Button>
        </form>
      )}
    </section>
  );
}

function BookRow({
  book,
  disabled,
  onStatus,
  onRemove,
}: {
  book: Book;
  disabled: boolean;
  onStatus: (status: BookStatus) => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-crimson text-lg font-semibold leading-tight">{book.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {book.author}
          {book.series && ` · ${book.series}`}
        </p>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-sm">
          Remove it?
          <Button size="sm" variant="destructive" disabled={disabled} onClick={onRemove}>
            Remove
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Keep
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <select
            value={book.status}
            disabled={disabled}
            onChange={(e) => onStatus(e.target.value as BookStatus)}
            aria-label={`Status of ${book.title}`}
            className={SELECT}
          >
            {BOOK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${book.title}`}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </li>
  );
}

interface Saved {
  books: Book[];
  commit: { message: string; files: string[] };
  dryRun: boolean;
}

export function LibraryEditor() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    api<{ books: Book[] }>("/api/library/books")
      .then((data) => setBooks(data.books))
      .catch((cause: Error) => setNotice({ tone: "error", text: cause.message }));
  }, []);

  const series = useMemo(
    () => Array.from(new Set((books ?? []).flatMap((b) => b.series ?? []))),
    [books]
  );
  // Whatever is being read first, then the newest additions.
  const ordered = useMemo(
    () =>
      [...(books ?? [])].sort(
        (a, b) => Number(b.status === "reading") - Number(a.status === "reading") || b.id - a.id
      ),
    [books]
  );

  async function save(edit: object): Promise<boolean> {
    setSaving(true);
    setNotice(null);
    try {
      const saved = await send<Saved>("/api/library/books", edit);
      setBooks(saved.books);
      setNotice({
        tone: "ok",
        text: saved.dryRun
          ? `Dry run, nothing saved. Would commit "${saved.commit.message}" touching ${saved.commit.files.join(", ")}.`
          : "Saved. The site is rebuilding and will show it in about a minute.",
      });
      return true;
    } catch (cause) {
      setNotice({ tone: "error", text: (cause as Error).message });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function logOut() {
    await api("/api/library/session", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-crimson text-4xl font-bold text-brand">Library editor</h1>
        <button onClick={logOut} className="link-underline text-sm text-muted-foreground">
          Log out
        </button>
      </div>

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            notice.tone === "error" ? "border-destructive/40 text-destructive" : "border-brand/30 text-brand"
          )}
        >
          {notice.text}
        </p>
      )}

      <AddBook series={series} disabled={saving} onAdd={(book) => save({ op: "add", ...book })} />

      <section>
        <h2 className={LABEL}>On the shelf{books && ` · ${books.length}`}</h2>
        {books ? (
          <ul className="mt-2 divide-y divide-border">
            {ordered.map((book) => (
              <BookRow
                key={book.id}
                book={book}
                disabled={saving}
                onStatus={(status) => save({ op: "status", id: book.id, status })}
                onRemove={() => save({ op: "remove", id: book.id })}
              />
            ))}
          </ul>
        ) : (
          !notice && <p className="mt-4 text-sm text-muted-foreground">Loading the shelf…</p>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 inline-block rounded-full border border-cardhaus-ink/10 px-3 py-1 text-xs uppercase tracking-widest text-cardhaus-ink/60">
        Coming soon
      </span>
      <h1 className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
        Cardhaus
      </h1>
      <p className="mt-6 max-w-xl text-lg text-cardhaus-ink/70">
        A home for trading card collectors. Buy, sell, and trade with people
        who care about the cards as much as you do.
      </p>
      <div className="mt-10 flex gap-3">
        <a
          href="#"
          className="rounded-md bg-cardhaus-ink px-5 py-2.5 text-sm font-medium text-cardhaus-paper transition hover:opacity-90"
        >
          Join the waitlist
        </a>
        <a
          href="#"
          className="rounded-md border border-cardhaus-ink/15 px-5 py-2.5 text-sm font-medium text-cardhaus-ink transition hover:bg-cardhaus-ink/5"
        >
          Learn more
        </a>
      </div>
    </main>
  );
}

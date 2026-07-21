import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-text">Page Not Found</h2>
      <p className="mt-4 text-text/70 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-3 py-2"
        >
          &larr; Home
        </Link>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1 text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-3 py-2"
        >
          View Projects
        </Link>
      </div>
    </main>
  );
}

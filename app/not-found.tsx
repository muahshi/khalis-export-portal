import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <p className="text-xs uppercase tracking-widest2 text-gold">404</p>
      <h1 className="mt-4 font-display text-3xl uppercase tracking-wide">Page not found</h1>
      <p className="mt-4 text-stone-400">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/"
          className="border border-gold px-6 py-3 text-sm uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900"
        >
          Return home
        </Link>
        <Link
          href="/products"
          className="border border-charcoal-700 px-6 py-3 text-sm uppercase tracking-wide text-stone-200 hover:border-stone-200"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}

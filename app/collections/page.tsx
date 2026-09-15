import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { Collection } from "@/types/domain";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse Khalis Perfumes collections for B2B export.",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const supabase = getSupabaseAnonServerClient();
  const { data: collections } = await supabase.from("collections").select("*").order("name");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Collections</h1>
      <p className="mt-6 text-stone-400">
        Browse the export catalogue by collection.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {((collections as Collection[]) ?? []).map((c) => (
          <li key={c.id}>
            <Link
              href={`/collections/${c.slug}`}
              className="block border border-charcoal-700 px-5 py-4 transition-colors hover:border-gold"
            >
              <span className="font-display uppercase tracking-wide">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

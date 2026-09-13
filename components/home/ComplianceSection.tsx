import type { Certification } from "@/types/domain";

/** Renders only certifications that are both VERIFIED and is_public. */
export function ComplianceSection({ certifications }: { certifications: Certification[] }) {
  const publicVerified = certifications.filter(
    (c) => c.verification_status === "VERIFIED" && c.is_public
  );

  return (
    <section className="border-b border-charcoal-700 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-2xl uppercase tracking-wide">Compliance</h2>
        {publicVerified.length > 0 ? (
          <ul className="mt-6 space-y-2">
            {publicVerified.map((c) => (
              <li key={c.id} className="text-stone-200">
                {c.name} {c.issuing_body && <span className="text-stone-400">— {c.issuing_body}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-stone-400">Certifications — pending verification.</p>
        )}
      </div>
    </section>
  );
}

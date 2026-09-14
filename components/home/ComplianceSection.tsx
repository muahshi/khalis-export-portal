import Image from "next/image";
import type { Certification } from "@/types/domain";
import { images } from "@/config/images";
import { Reveal } from "@/components/ui/Reveal";

const DOC_CATEGORIES = [
  "Safety Data",
  "Certificate of Analysis",
  "Certificate of Origin",
  "Export Documentation",
];

/** Renders only certifications that are both VERIFIED and is_public. */
export function ComplianceSection({ certifications }: { certifications: Certification[] }) {
  const publicVerified = certifications.filter(
    (c) => c.verification_status === "VERIFIED" && c.is_public
  );

  return (
    <section className="relative isolate overflow-hidden border-b border-charcoal-700 px-6 py-20">
      <Image
        src={images.compliance.documents}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/60 to-charcoal-900/15" />
      <Reveal className="relative z-10 mx-auto max-w-4xl">
        <h2 className="section-heading font-display uppercase tracking-wide">Compliance</h2>
        {publicVerified.length > 0 ? (
          <ul className="mt-6 space-y-2">
            {publicVerified.map((c) => (
              <li key={c.id} className="text-stone-200">
                {c.name} {c.issuing_body && <span className="text-stone-400">— {c.issuing_body}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="mt-4 text-base text-stone-300">Certifications — pending verification.</p>
            <ul className="mt-6 flex flex-wrap gap-3">
              {DOC_CATEGORIES.map((d) => (
                <li key={d} className="border border-stone-200/20 bg-charcoal-900/40 px-4 py-2 text-sm text-stone-200 backdrop-blur-sm">
                  {d}
                </li>
              ))}
            </ul>
          </>
        )}
      </Reveal>
    </section>
  );
}

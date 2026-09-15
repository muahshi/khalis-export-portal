"use client";
import { useState } from "react";
import type { BusinessType, PublicProduct, RfqSubmission } from "@/types/domain";

const BUSINESS_TYPES: BusinessType[] = [
  "DISTRIBUTOR",
  "WHOLESALER",
  "RETAILER",
  "IMPORTER",
  "PRIVATE_LABEL",
  "FRAGRANCE_BRAND",
  "OTHER",
];

/**
 * RFQ form architecture (brief §13). Submits to /api/rfq — a Route Handler using
 * the service-role client server-side; this component never talks to Supabase
 * directly, so no client-writable path to the rfqs table exists.
 */
export function RFQForm({ requestedProduct }: { requestedProduct?: PublicProduct | null }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const payload: Partial<RfqSubmission> = {
      full_name: String(formData.get("full_name") ?? ""),
      company_name: String(formData.get("company_name") ?? ""),
      country: String(formData.get("country") ?? ""),
      business_type: formData.get("business_type") as RfqSubmission["business_type"],
      email: String(formData.get("email") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? "") || undefined,
      message: String(formData.get("message") ?? "") || undefined,
      products: requestedProduct ? [{ product_id: requestedProduct.id }] : [],
    };

    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-stone-200">
        Thank you — your RFQ has been received. Our export team will follow up shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
      {requestedProduct && (
        <div className="sm:col-span-2 border border-charcoal-700 bg-charcoal-900 px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-stone-500">Requesting a quote for</p>
          <p className="mt-1 text-stone-100">{requestedProduct.name}</p>
        </div>
      )}
      <Field label="Full Name" name="full_name" required />
      <Field label="Company Name" name="company_name" required />
      <Field label="Country" name="country" required />
      <div>
        <label className="text-xs uppercase tracking-wide text-stone-400" htmlFor="business_type">
          Business Type
        </label>
        <select
          id="business_type"
          name="business_type"
          required
          className="mt-2 w-full border border-charcoal-700 bg-charcoal-900 px-4 py-3 text-stone-50"
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <Field label="Email" name="email" type="email" required />
      <Field label="WhatsApp" name="whatsapp" />
      <div className="sm:col-span-2">
        <label className="text-xs uppercase tracking-wide text-stone-400" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-2 w-full border border-charcoal-700 bg-charcoal-900 px-4 py-3 text-stone-50"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="sm:col-span-2 border border-gold px-6 py-3 text-sm uppercase tracking-wide text-gold hover:bg-gold hover:text-charcoal-900 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit RFQ"}
      </button>

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-400">
          Something went wrong. Please try again or contact us on WhatsApp.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-stone-400" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-charcoal-700 bg-charcoal-900 px-4 py-3 text-stone-50"
      />
    </div>
  );
}

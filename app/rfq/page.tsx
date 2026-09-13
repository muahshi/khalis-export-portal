import type { Metadata } from "next";
import { RFQForm } from "@/components/rfq/RFQForm";

export const metadata: Metadata = {
  title: "Request an RFQ",
  description: "Submit your quantity, target market, and packaging requirements to Khalis Perfumes' export team.",
};

export default function RfqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase tracking-wide">Request an RFQ</h1>
      <p className="mt-4 text-stone-400">
        Tell us about your business and requirements. Our export team will follow up with a
        tailored quotation.
      </p>
      <div className="mt-10">
        <RFQForm />
      </div>
    </div>
  );
}

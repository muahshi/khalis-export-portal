import "server-only";

/**
 * Abstraction over Groq. Phase 1: interface + stub only — no autonomous AI
 * sales (brief §18). AI must never invent prices, MOQ, certificates,
 * production capacity, lead times, or shipping commitments — it may only
 * summarize/classify verified database content passed in by the caller.
 */
export interface LeadClassification {
  priority: "LOW" | "MEDIUM" | "HIGH" | "ENTERPRISE";
  reasoning: string;
}

export interface AIService {
  detectLanguage(text: string): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
  classifyLead(rfqSummary: string): Promise<LeadClassification>;
  summarizeRfq(rfqSummary: string): Promise<string>;
}

class StubAIService implements AIService {
  async detectLanguage(): Promise<string> {
    return "en"; // Phase 2: real Groq call
  }
  async translate(text: string): Promise<string> {
    return text; // Phase 2: real Groq call
  }
  async classifyLead(): Promise<LeadClassification> {
    return { priority: "MEDIUM", reasoning: "Phase 1 stub — default classification." };
  }
  async summarizeRfq(rfqSummary: string): Promise<string> {
    return rfqSummary; // Phase 2: real Groq call
  }
}

export function getAIService(): AIService {
  // Phase 2: instantiate a Groq-backed implementation using process.env.GROQ_API_KEY
  return new StubAIService();
}

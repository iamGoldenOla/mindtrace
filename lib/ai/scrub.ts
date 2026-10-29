// Scrub free text before it enters a model prompt: names cannot be detected
// reliably by regex, so this removes contact details and long digit strings
// while prompts carry only the learner code, never names or schools.
export function scrubFreeText(text: string): string {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[contact removed]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[contact removed]")
    .replace(/\b\d{5,}\b/g, "[number removed]")
    .slice(0, 1000);
}

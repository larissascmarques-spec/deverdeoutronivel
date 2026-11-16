import type { AnswerKey, AnswerKeyEntry } from "../../types/contracts";
import { IntegrationError } from "../errors";

export function parseAnswerKey(value: unknown): AnswerKey | null {
  if (value === null || value === undefined) return null;
  const fail = (): never => {
    throw new IntegrationError(
      "O gabarito precisa de conferência antes de ser exibido.",
      "request_failed",
    );
  };
  if (
    typeof value !== "object" ||
    !("entries" in value) ||
    !Array.isArray(value.entries) ||
    value.entries.length === 0
  )
    return fail();
  const seen = new Set<string>();
  const entries: AnswerKeyEntry[] = value.entries.map((raw: unknown) => {
    if (!raw || typeof raw !== "object") return fail();
    const entry = raw as Record<string, unknown>;
    for (const key of [
      "questionId",
      "questionLabel",
      "answer",
      "explanation",
    ]) {
      if (typeof entry[key] !== "string" || !(entry[key] as string).trim())
        return fail();
    }
    const id = entry.questionId as string;
    if (seen.has(id) || typeof entry.openEnded !== "boolean") return fail();
    seen.add(id);
    if (
      entry.steps !== undefined &&
      (!Array.isArray(entry.steps) ||
        !entry.steps.every((s) => typeof s === "string" && s.trim()))
    )
      return fail();
    if (
      entry.openEnded &&
      (typeof entry.acceptanceCriteria !== "string" ||
        !entry.acceptanceCriteria.trim())
    )
      return fail();
    return {
      questionId: id,
      questionLabel: entry.questionLabel as string,
      answer: entry.answer as string,
      explanation: entry.explanation as string,
      openEnded: entry.openEnded,
      steps: entry.steps as string[] | undefined,
      acceptanceCriteria: entry.acceptanceCriteria as string | undefined,
    };
  });
  return { entries };
}

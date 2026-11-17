import { GENERATION_STEPS, type GenerationJob } from "../../types/contracts";
import type { GenerationService } from "../interfaces";
import { emptyFiles, findJob, upsertJob, type DemoOutcome } from "./store";

const DEMO_OUTCOME_KEY = "dever-outro-nivel:demo-next-outcome";
const inFlight = new Set<string>();
const timers = new Map<string, number[]>();

export function setDemoOutcome(outcome: DemoOutcome): void {
  sessionStorage.setItem(DEMO_OUTCOME_KEY, outcome);
}

export function peekDemoOutcome(): DemoOutcome {
  const value = sessionStorage.getItem(DEMO_OUTCOME_KEY);
  if (value === "failed" || value === "needs_review" || value === "completed") {
    return value;
  }
  return "completed";
}

function nowIso(): string {
  return new Date().toISOString();
}

function clearTimers(id: string): void {
  const ids = timers.get(id) ?? [];
  ids.forEach((timer) => window.clearTimeout(timer));
  timers.delete(id);
}

function runSimulatedPipeline(jobId: string, outcome: DemoOutcome): void {
  if (inFlight.has(jobId)) return;
  inFlight.add(jobId);
  clearTimers(jobId);

  const scheduled: number[] = [];
  GENERATION_STEPS.forEach((step, index) => {
    const timer = window.setTimeout(
      () => {
        const current = findJob(jobId);
        if (!current) return;
        upsertJob({
          ...current,
          status: "processing",
          currentStep: step,
          updatedAt: nowIso(),
        });
      },
      700 * (index + 1),
    );
    scheduled.push(timer);
  });

  const finish = window.setTimeout(
    () => {
      const current = findJob(jobId);
      if (!current) return;

      const finished: GenerationJob = {
        ...current,
        currentStep: "organizing_files",
        updatedAt: nowIso(),
        pages: [],
        files: emptyFiles(current.request.subjectId),
        simulated: true,
        status:
          outcome === "failed"
            ? "failed"
            : outcome === "needs_review"
              ? "needs_review"
              : "completed",
        errorMessage:
          outcome === "failed"
            ? "Não foi possível concluir esta demonstração. Suas escolhas foram guardadas para você tentar de novo."
            : null,
      };

      upsertJob(finished);
      inFlight.delete(jobId);
      timers.delete(jobId);
    },
    700 * (GENERATION_STEPS.length + 1),
  );

  scheduled.push(finish);
  timers.set(jobId, scheduled);
}

export const generationDemo: GenerationService = {
  async createRequest(request) {
    const outcome = peekDemoOutcome();
    const createdAt = nowIso();
    const job: GenerationJob = {
      id: crypto.randomUUID(),
      request,
      status: "awaiting",
      currentStep: null,
      createdAt,
      updatedAt: createdAt,
      errorMessage: null,
      pages: [],
      files: emptyFiles(request.subjectId),
      simulated: true,
    };
    upsertJob(job);
    runSimulatedPipeline(job.id, outcome);
    return job;
  },

  async getJob(id) {
    const job = findJob(id);
    if (
      job &&
      (job.status === "awaiting" || job.status === "processing") &&
      !inFlight.has(id)
    ) {
      runSimulatedPipeline(id, peekDemoOutcome());
    }
    return job;
  },

  async retry(jobId) {
    const existing = findJob(jobId);
    if (!existing) {
      throw new Error("Pedido não encontrado.");
    }
    if (inFlight.has(jobId)) {
      return existing;
    }
    const outcome = peekDemoOutcome();
    const restarted: GenerationJob = {
      ...existing,
      status: "awaiting",
      currentStep: null,
      updatedAt: nowIso(),
      errorMessage: null,
      pages: [],
      files: emptyFiles(existing.request.subjectId),
      simulated: true,
    };
    upsertJob(restarted);
    runSimulatedPipeline(jobId, outcome);
    return restarted;
  },
};

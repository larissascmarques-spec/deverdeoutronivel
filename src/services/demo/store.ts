import type {
  ActivityFile,
  GenerationJob,
  LibraryItem,
} from "../../types/contracts";
import { SUBJECT_LABELS } from "../../types/contracts";

const JOBS_KEY = "dever-outro-nivel:demo-jobs";

export type DemoOutcome = "completed" | "failed" | "needs_review";

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function loadJobs(): GenerationJob[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(JOBS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GenerationJob[]) : [];
  } catch {
    return [];
  }
}

export function saveJobs(jobs: GenerationJob[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export function upsertJob(job: GenerationJob): GenerationJob {
  const jobs = loadJobs().filter((item) => item.id !== job.id);
  jobs.unshift(job);
  saveJobs(jobs);
  return job;
}

export function findJob(id: string): GenerationJob | null {
  return loadJobs().find((job) => job.id === id) ?? null;
}

export function toLibraryItem(job: GenerationJob): LibraryItem {
  return {
    id: job.id,
    title: job.request.topicLabel,
    year: job.request.year,
    subjectId: job.request.subjectId,
    subjectName: SUBJECT_LABELS[job.request.subjectId],
    createdAt: job.createdAt,
    status: job.status,
    simulated: true,
    files: job.files,
  };
}

export function emptyFiles(
  subjectId: GenerationJob["request"]["subjectId"],
): ActivityFile[] {
  const files: ActivityFile[] = [
    {
      id: "child",
      kind: "child_activity",
      label: "Atividade da criança",
      available: false,
      url: null,
    },
    {
      id: "guide",
      kind: "mother_guide",
      label: "Guia da mãe",
      available: false,
      url: null,
    },
  ];

  if (subjectId === "matematica") {
    files.push({
      id: "calc",
      kind: "calculation_sheet",
      label: "Folha de cálculo",
      available: false,
      url: null,
    });
  }

  return files;
}

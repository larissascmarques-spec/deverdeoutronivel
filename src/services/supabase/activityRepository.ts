import type {
  ActivityFile,
  GenerationJob,
  GenerationRequest,
  GenerationStatus,
  GenerationStep,
  LibraryItem,
} from "../../types/contracts";
import { SUBJECT_LABELS } from "../../types/contracts";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { parseAnswerKey } from "./parseAnswerKey";
import { IntegrationError } from "../errors";

export interface StoredFile {
  id: string;
  kind: ActivityFile["kind"];
  object_path: string;
}
export interface StoredActivity {
  id: string;
  request: GenerationRequest;
  status: GenerationStatus;
  current_step: GenerationStep | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
  files?: StoredFile[];
}
const fileLabels: Record<ActivityFile["kind"], string> = {
  child_activity: "Atividade da criança",
  mother_guide: "Guia da mãe",
  calculation_sheet: "Folha de cálculo",
  answer_key: "Gabarito",
};
export async function authenticatedClient() {
  const client = await getSupabaseClient();
  if (!client)
    throw new IntegrationError(
      "A conexão com sua conta ainda não foi configurada.",
      "not_configured",
    );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new IntegrationError(
      "Entre na sua conta para consultar suas atividades.",
      "request_failed",
    );
  return client;
}
export async function signedFile(
  path: string,
  download = false,
): Promise<string> {
  const client = await getSupabaseClient();
  if (!client)
    throw new IntegrationError(
      "A conexão ainda não foi configurada.",
      "not_configured",
    );
  const { data, error } = await client.storage
    .from("dever-activities")
    .createSignedUrl(path, 3600, { download });
  if (error || !data?.signedUrl)
    throw new IntegrationError(
      "Não foi possível abrir o arquivo. Tente novamente.",
      "request_failed",
    );
  return data.signedUrl;
}
export function mapLibraryItem(row: StoredActivity): LibraryItem {
  return {
    id: row.id,
    title: row.request.topicLabel,
    year: row.request.year,
    subjectId: row.request.subjectId,
    subjectName: SUBJECT_LABELS[row.request.subjectId],
    createdAt: row.created_at,
    status: row.status,
    simulated: false,
    files: (row.files ?? []).map((file) => ({
      id: file.id,
      kind: file.kind,
      label: fileLabels[file.kind],
      available: row.status === "completed",
      url: null,
    })),
  };
}
export async function readActivity(id: string): Promise<GenerationJob | null> {
  const client = await authenticatedClient();
  const { data, error } = await client
    .from("don_activities")
    .select("*, files:don_activity_files(*)")
    .eq("id", id)
    .maybeSingle();
  if (error)
    throw new IntegrationError(
      "Não foi possível consultar esta atividade.",
      "request_failed",
    );
  if (!data) return null;
  const row = data as StoredActivity;
  const job: GenerationJob = {
    id: row.id,
    request: row.request,
    status: row.status,
    currentStep: row.current_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    errorMessage: row.error_message,
    simulated: false,
    files: [],
    pages: [],
    answerKey: null,
  };
  if (row.status !== "completed") return job;
  const [pages, key] = await Promise.all([
    client
      .from("don_activity_pages")
      .select("*")
      .eq("activity_id", id)
      .order("page_number"),
    client
      .from("don_answer_keys")
      .select("content")
      .eq("activity_id", id)
      .maybeSingle(),
  ]);
  if (pages.error || key.error)
    throw new IntegrationError(
      "Não foi possível carregar o material. Tente abrir novamente.",
      "request_failed",
    );
  job.files = await Promise.all(
    (row.files ?? []).map(async (file) => ({
      id: file.id,
      kind: file.kind,
      label: fileLabels[file.kind],
      available: true,
      url: await signedFile(file.object_path, true),
    })),
  );
  job.pages = await Promise.all(
    (pages.data ?? []).map(async (page) => ({
      id: page.id,
      pageNumber: page.page_number,
      width: page.width,
      height: page.height,
      imageUrl: await signedFile(page.object_path),
    })),
  );
  job.answerKey = parseAnswerKey(key.data?.content);
  return job;
}

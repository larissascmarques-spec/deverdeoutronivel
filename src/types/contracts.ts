export type SchoolYear = 1 | 2 | 3 | 4 | 5;

export type SubjectId =
  "lingua-portuguesa" | "matematica" | "ciencias" | "historia" | "geografia";

export type Difficulty = "essencial" | "intermediario" | "desafiador";

export type PageCount = 1 | 3 | 5;

export type GenerationStatus =
  "awaiting" | "processing" | "completed" | "failed" | "needs_review";

export type GenerationStep =
  | "preparing_content"
  | "checking_answers"
  | "creating_illustrated_pages"
  | "organizing_files";

export type FileKind =
  "child_activity" | "mother_guide" | "calculation_sheet" | "answer_key";

export interface SubjectOption {
  id: SubjectId;
  name: string;
}

export interface TopicSuggestion {
  id: string;
  year: SchoolYear;
  subjectId: SubjectId;
  label: string;
}

export interface GenerationRequest {
  year: SchoolYear;
  subjectId: SubjectId;
  topicId: string | null;
  topicLabel: string;
  difficulty: Difficulty;
  pageCount: PageCount;
  extraContext: string | null;
  visualReferenceVersion: string;
}

export interface ActivityFile {
  id: string;
  kind: FileKind;
  label: string;
  available: boolean;
  url: string | null;
}

export interface ActivityPage {
  id: string;
  pageNumber: number;
  imageUrl: string | null;
  width: number;
  height: number;
}

export interface AnswerKeyEntry {
  questionId: string;
  questionLabel: string;
  answer: string;
  explanation: string;
  openEnded: boolean;
  steps?: string[];
  acceptanceCriteria?: string;
}

export interface AnswerKey {
  entries: AnswerKeyEntry[];
}

export interface GenerationJob {
  answerKey?: AnswerKey | null;
  id: string;
  request: GenerationRequest;
  status: GenerationStatus;
  currentStep: GenerationStep | null;
  createdAt: string;
  updatedAt: string;
  errorMessage: string | null;
  pages: ActivityPage[];
  files: ActivityFile[];
  simulated: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  year: SchoolYear;
  subjectId: SubjectId;
  subjectName: string;
  createdAt: string;
  status: GenerationStatus;
  simulated: boolean;
  files: ActivityFile[];
}

export interface UserSession {
  authenticated: boolean;
  userId: string | null;
}

export const GENERATION_STEPS: GenerationStep[] = [
  "preparing_content",
  "checking_answers",
  "creating_illustrated_pages",
  "organizing_files",
];

export const STATUS_LABELS: Record<GenerationStatus, string> = {
  awaiting: "Aguardando",
  processing: "Em preparação",
  completed: "Pronta",
  failed: "Não foi possível gerar",
  needs_review: "Precisa de conferência",
};

export const STEP_LABELS: Record<GenerationStep, string> = {
  preparing_content: "Preparando o conteúdo.",
  checking_answers: "Conferindo as respostas.",
  creating_illustrated_pages: "Criando as páginas ilustradas.",
  organizing_files: "Organizando os arquivos.",
};

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  "lingua-portuguesa": "Língua Portuguesa",
  matematica: "Matemática",
  ciencias: "Ciências",
  historia: "História",
  geografia: "Geografia",
};

export const YEAR_LABELS: Record<SchoolYear, string> = {
  1: "1º ano",
  2: "2º ano",
  3: "3º ano",
  4: "4º ano",
  5: "5º ano",
};

export const DIFFICULTY_OPTIONS: {
  id: Difficulty;
  title: string;
  description: string;
}[] = [
  {
    id: "essencial",
    title: "Essencial",
    description: "Para começar e ganhar confiança.",
  },
  {
    id: "intermediario",
    title: "Intermediário",
    description: "Para praticar e pensar um pouco mais.",
  },
  {
    id: "desafiador",
    title: "Desafiador",
    description: "Para aprofundar o assunto.",
  },
];

import type {
  GenerationJob,
  GenerationRequest,
  LibraryItem,
  SchoolYear,
  SubjectId,
  SubjectOption,
  TopicSuggestion,
  UserSession,
} from '../types/contracts'

export interface CatalogService {
  listYears(): Promise<SchoolYear[]>
  listSubjects(): Promise<SubjectOption[]>
  searchTopics(input: {
    year: SchoolYear
    subjectId: SubjectId
    query: string
  }): Promise<TopicSuggestion[]>
}

export interface GenerationService {
  createRequest(request: GenerationRequest): Promise<GenerationJob>
  getJob(id: string): Promise<GenerationJob | null>
  retry(jobId: string): Promise<GenerationJob>
}

export interface LibraryService {
  listItems(query?: string): Promise<LibraryItem[]>
  getItem(id: string): Promise<LibraryItem | null>
}

export interface SessionService {
  getSession(): Promise<UserSession>
}

export interface AppServices {
  catalog: CatalogService
  generation: GenerationService
  library: LibraryService
  session: SessionService
}

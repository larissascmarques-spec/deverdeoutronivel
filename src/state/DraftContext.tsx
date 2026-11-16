import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Difficulty,
  PageCount,
  SchoolYear,
  SubjectId,
} from '../types/contracts'

const DRAFT_KEY = 'dever-outro-nivel:draft'

export interface ActivityDraft {
  year: SchoolYear | null
  subjectId: SubjectId | null
  topicId: string | null
  topicQuery: string
  difficulty: Difficulty | null
  pageCount: PageCount
  extraContext: string
  extraOpen: boolean
}

const emptyDraft: ActivityDraft = {
  year: null,
  subjectId: null,
  topicId: null,
  topicQuery: '',
  difficulty: null,
  pageCount: 1,
  extraContext: '',
  extraOpen: false,
}

function loadDraft(): ActivityDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft
    return { ...emptyDraft, ...(JSON.parse(raw) as ActivityDraft) }
  } catch {
    return emptyDraft
  }
}

interface DraftContextValue {
  draft: ActivityDraft
  setDraft: (next: ActivityDraft | ((current: ActivityDraft) => ActivityDraft)) => void
  resetDraft: () => void
}

const DraftContext = createContext<DraftContextValue | null>(null)

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<ActivityDraft>(loadDraft)

  const value = useMemo<DraftContextValue>(
    () => ({
      draft,
      setDraft(next) {
        setDraftState((current) => {
          const resolved = typeof next === 'function' ? next(current) : next
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(resolved))
          return resolved
        })
      },
      resetDraft() {
        sessionStorage.removeItem(DRAFT_KEY)
        setDraftState(emptyDraft)
      },
    }),
    [draft],
  )

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useDraft() {
  const context = useContext(DraftContext)
  if (!context) {
    throw new Error('useDraft precisa estar dentro de DraftProvider')
  }
  return context
}

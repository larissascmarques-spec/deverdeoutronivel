import type {
  SchoolYear,
  SubjectOption,
  TopicSuggestion,
} from '../types/contracts'

export const SUBJECTS: SubjectOption[] = [
  { id: 'lingua-portuguesa', name: 'Língua Portuguesa' },
  { id: 'matematica', name: 'Matemática' },
  { id: 'ciencias', name: 'Ciências' },
  { id: 'historia', name: 'História' },
  { id: 'geografia', name: 'Geografia' },
]

export const YEARS: SchoolYear[] = [1, 2, 3, 4, 5]

export const PAGE_COUNT_OPTIONS = [1, 3, 5] as const

/**
 * Lista curta e demonstrativa. Sem códigos BNCC.
 * Palavras que uma mãe reconhece no caderno da criança.
 */
export const TOPIC_SUGGESTIONS: TopicSuggestion[] = [
  { id: 'lp-1-leitura', year: 1, subjectId: 'lingua-portuguesa', label: 'Leitura de palavras e frases' },
  { id: 'lp-1-escrita', year: 1, subjectId: 'lingua-portuguesa', label: 'Escrita do nome e de palavras' },
  { id: 'lp-2-interpretacao', year: 2, subjectId: 'lingua-portuguesa', label: 'Interpretação de texto' },
  { id: 'lp-2-pontuacao', year: 2, subjectId: 'lingua-portuguesa', label: 'Pontuação' },
  { id: 'lp-3-interpretacao', year: 3, subjectId: 'lingua-portuguesa', label: 'Interpretação de texto' },
  { id: 'lp-3-substantivos', year: 3, subjectId: 'lingua-portuguesa', label: 'Substantivos' },
  { id: 'lp-4-paragrafo', year: 4, subjectId: 'lingua-portuguesa', label: 'Produção de parágrafo' },
  { id: 'lp-4-verbos', year: 4, subjectId: 'lingua-portuguesa', label: 'Verbos' },
  { id: 'lp-5-texto', year: 5, subjectId: 'lingua-portuguesa', label: 'Interpretação de texto' },
  { id: 'lp-5-advérbios', year: 5, subjectId: 'lingua-portuguesa', label: 'Advérbios' },

  { id: 'mat-1-adicao', year: 1, subjectId: 'matematica', label: 'Adição e subtração' },
  { id: 'mat-1-contagem', year: 1, subjectId: 'matematica', label: 'Contagem e números' },
  { id: 'mat-2-adicao', year: 2, subjectId: 'matematica', label: 'Adição e subtração' },
  { id: 'mat-2-medidas', year: 2, subjectId: 'matematica', label: 'Medidas de tempo' },
  { id: 'mat-3-problemas', year: 3, subjectId: 'matematica', label: 'Adição e subtração' },
  { id: 'mat-3-tabuada', year: 3, subjectId: 'matematica', label: 'Tabuada' },
  { id: 'mat-4-multiplicacao', year: 4, subjectId: 'matematica', label: 'Multiplicação e divisão' },
  { id: 'mat-4-fracoes', year: 4, subjectId: 'matematica', label: 'Frações' },
  { id: 'mat-5-problemas', year: 5, subjectId: 'matematica', label: 'Problemas com as quatro operações' },
  { id: 'mat-5-fracoes', year: 5, subjectId: 'matematica', label: 'Frações e decimais' },

  { id: 'cie-1-corpo', year: 1, subjectId: 'ciencias', label: 'Corpo humano' },
  { id: 'cie-1-seres', year: 1, subjectId: 'ciencias', label: 'Seres vivos' },
  { id: 'cie-2-plantas', year: 2, subjectId: 'ciencias', label: 'Plantas' },
  { id: 'cie-2-agua', year: 2, subjectId: 'ciencias', label: 'Água' },
  { id: 'cie-3-solar', year: 3, subjectId: 'ciencias', label: 'Sistema solar' },
  { id: 'cie-3-alimentacao', year: 3, subjectId: 'ciencias', label: 'Alimentação' },
  { id: 'cie-4-cadeias', year: 4, subjectId: 'ciencias', label: 'Cadeias alimentares' },
  { id: 'cie-4-materia', year: 4, subjectId: 'ciencias', label: 'Matéria e energia' },
  { id: 'cie-5-sistema-solar', year: 5, subjectId: 'ciencias', label: 'Sistema solar' },
  { id: 'cie-5-corpo', year: 5, subjectId: 'ciencias', label: 'Sistemas do corpo humano' },

  { id: 'his-1-familia', year: 1, subjectId: 'historia', label: 'Minha família e minha escola' },
  { id: 'his-2-comunidade', year: 2, subjectId: 'historia', label: 'A vida na comunidade' },
  { id: 'his-3-indigenas', year: 3, subjectId: 'historia', label: 'Povos indígenas' },
  { id: 'his-4-brasil', year: 4, subjectId: 'historia', label: 'Chegada dos portugueses' },
  { id: 'his-5-independencia', year: 5, subjectId: 'historia', label: 'Independência do Brasil' },

  { id: 'geo-1-lugar', year: 1, subjectId: 'geografia', label: 'Meu lugar: casa e escola' },
  { id: 'geo-2-paisagens', year: 2, subjectId: 'geografia', label: 'Paisagens' },
  { id: 'geo-3-mapas', year: 3, subjectId: 'geografia', label: 'Mapas' },
  { id: 'geo-4-clima', year: 4, subjectId: 'geografia', label: 'Clima e tempo' },
  { id: 'geo-5-agua', year: 5, subjectId: 'geografia', label: 'Água no planeta' },
]

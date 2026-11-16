import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApprovedReference } from '../components/visual/ApprovedReference'
import { A4PageFrame } from '../components/visual/A4PageFrame'
import { getServices } from '../services'
import { isIntegrationError } from '../services/errors'
import {
  STATUS_LABELS,
  SUBJECT_LABELS,
  YEAR_LABELS,
  type ActivityFile,
  type GenerationJob,
} from '../types/contracts'

function FileButton({ file }: { file: ActivityFile }) {
  const enabled = file.available && Boolean(file.url)
  return (
    <button
      className="primary"
      type="button"
      disabled={!enabled}
      onClick={() => {
        if (file.url) window.open(file.url, '_blank', 'noopener,noreferrer')
      }}
    >
      {file.kind === 'child_activity'
        ? 'Baixar atividade'
        : file.kind === 'mother_guide'
          ? 'Baixar guia da mãe'
          : 'Folha de cálculo'}
    </button>
  )
}

export function ResultadoPage() {
  const { id } = useParams()
  const [job, setJob] = useState<GenerationJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!id) return
    getServices()
      .generation.getJob(id)
      .then(setJob)
      .catch((loadError: unknown) => {
        setError(
          isIntegrationError(loadError)
            ? loadError.message
            : 'Não foi possível abrir este resultado.',
        )
      })
  }, [id])

  const page = job?.pages[pageIndex] ?? null
  const hasFiles = useMemo(
    () => Boolean(job?.files.some((file) => file.available && file.url)),
    [job],
  )

  if (error) {
    return <p className="alert">{error}</p>
  }

  if (!job) {
    return <p className="lede">Carregando resultado…</p>
  }

  return (
    <section>
      <h1 className="page-title">{job.request.topicLabel}</h1>
      <p className="lede">
        {YEAR_LABELS[job.request.year]} · {SUBJECT_LABELS[job.request.subjectId]} ·{' '}
        {STATUS_LABELS[job.status]}
      </p>

      {job.simulated ? (
        <p className="note" style={{ marginTop: '1rem' }}>
          Demonstração: não houve geração real nem aprovação pedagógica. Os
          botões de download ficam indisponíveis enquanto não existirem arquivos.
        </p>
      ) : null}

      <div className="stack">
        <div>
          <A4PageFrame
            src={page?.imageUrl}
            alt={page ? `Prévia da folha ${page.pageNumber}` : 'Prévia da atividade'}
            emptyText="A prévia da atividade aparecerá aqui quando o arquivo estiver pronto. Esta área não usa a folha de referência como se fosse o seu pedido."
          />
          {job.pages.length > 1 ? (
            <div className="preview-actions">
              <button
                className="secondary"
                type="button"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
              >
                Folha anterior
              </button>
              <button
                className="secondary"
                type="button"
                disabled={pageIndex >= job.pages.length - 1}
                onClick={() =>
                  setPageIndex((index) => Math.min(job.pages.length - 1, index + 1))
                }
              >
                Próxima folha
              </button>
            </div>
          ) : null}
          {page?.imageUrl ? (
            <div className="actions">
              <button className="secondary" type="button" onClick={() => setLightbox(true)}>
                Ampliar visualização
              </button>
            </div>
          ) : null}
        </div>

        <div className="actions">
          {job.files
            .filter((file) => file.kind !== 'calculation_sheet')
            .map((file) => (
              <FileButton key={file.id} file={file} />
            ))}
          {job.request.subjectId === 'matematica'
            ? job.files
                .filter((file) => file.kind === 'calculation_sheet')
                .map((file) => <FileButton key={file.id} file={file} />)
            : null}
          {!hasFiles ? (
            <p className="hint">
              Os arquivos da criança e o guia da mãe serão separados. O guia
              trará respostas comentadas, o que a criança está aprendendo, como
              ajudar sem entregar a resposta, sinais de que vale praticar mais,
              materiais e tempo estimado.
            </p>
          ) : null}
          <Link className="secondary" to="/" style={{ display: 'grid', placeItems: 'center' }}>
            Montar outra atividade
          </Link>
        </div>

        <ApprovedReference defaultOpen={job.simulated} />
      </div>

      {lightbox && page?.imageUrl ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Prévia ampliada">
          <button className="lightbox-close" type="button" onClick={() => setLightbox(false)}>
            Fechar
          </button>
          <img src={page.imageUrl} alt={`Folha ${page.pageNumber} ampliada`} />
        </div>
      ) : null}
    </section>
  )
}

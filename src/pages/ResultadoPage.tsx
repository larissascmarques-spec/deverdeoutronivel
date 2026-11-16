import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { A4PageFrame } from "../components/visual/A4PageFrame";
import { ImageDialog } from "../components/ui/ImageDialog";
import { Icon } from "../components/ui/Icon";
import { getServices } from "../services";
import { isIntegrationError } from "../services/errors";
import {
  DIFFICULTY_OPTIONS,
  STATUS_LABELS,
  SUBJECT_LABELS,
  YEAR_LABELS,
  type ActivityFile,
  type GenerationJob,
} from "../types/contracts";

function FileButton({ file }: { file: ActivityFile }) {
  const enabled = file.available && Boolean(file.url);
  return (
    <button
      className="primary"
      type="button"
      disabled={!enabled}
      onClick={() => {
        if (file.url) window.open(file.url, "_blank", "noopener,noreferrer");
      }}
    >
      {file.kind === "child_activity"
        ? "Baixar atividade"
        : file.kind === "mother_guide"
          ? "Baixar guia da mãe"
          : "Folha de cálculo"}
    </button>
  );
}

export function ResultadoPage() {
  const { id } = useParams();
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setJob(null);
    setError(null);
    setPageIndex(0);
    getServices()
      .generation.getJob(id)
      .then((result) => {
        if (cancelled) return;
        if (!result)
          setError("Este pedido não foi encontrado neste navegador.");
        else setJob(result);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(
          isIntegrationError(loadError)
            ? loadError.message
            : "Não foi possível abrir este resultado.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const page = job?.pages[pageIndex] ?? null;
  const hasFiles = useMemo(
    () => Boolean(job?.files.some((file) => file.available && file.url)),
    [job],
  );

  if (error) {
    return (
      <section>
        <h1 className="page-title">Não foi possível abrir o pedido</h1>
        <p className="alert" role="alert" style={{ marginTop: 20 }}>
          {error}
        </p>
        <Link className="secondary" to="/atividades" style={{ marginTop: 20 }}>
          Voltar às minhas atividades
        </Link>
      </section>
    );
  }

  if (!job) {
    return <p className="lede">Carregando resultado…</p>;
  }

  return (
    <section>
      <p className="eyebrow">SEU PEDIDO</p>
      <h1 className="page-title">{job.request.topicLabel}</h1>
      <p className="lede">
        {YEAR_LABELS[job.request.year]} ·{" "}
        {SUBJECT_LABELS[job.request.subjectId]} ·{" "}
        {job.simulated && job.status === "completed"
          ? "Teste concluído"
          : STATUS_LABELS[job.status]}
      </p>

      <div className="job-summary">
        <span className="badge">
          {job.request.pageCount}{" "}
          {job.request.pageCount === 1 ? "folha" : "folhas"}
        </span>
        <span className="badge">
          {
            DIFFICULTY_OPTIONS.find(
              (option) => option.id === job.request.difficulty,
            )?.title
          }
        </span>
      </div>
      {job.simulated ? (
        <p className="note" style={{ marginTop: "1rem" }}>
          Demonstração: não houve geração real nem aprovação pedagógica. Os
          botões de download ficam indisponíveis enquanto não existirem
          arquivos.
        </p>
      ) : null}

      <div className="result-layout">
        <div className="result-panel">
          {page?.imageUrl ? (
            <>
              <A4PageFrame
                src={page?.imageUrl}
                alt={
                  page
                    ? `Prévia da folha ${page.pageNumber}`
                    : "Prévia da atividade"
                }
                emptyText="A prévia da atividade aparecerá aqui quando o arquivo estiver pronto. Esta área não usa a folha de referência como se fosse o seu pedido."
              />
              {job.pages.length > 1 ? (
                <div className="preview-actions">
                  <button
                    className="secondary"
                    type="button"
                    disabled={pageIndex === 0}
                    onClick={() =>
                      setPageIndex((index) => Math.max(0, index - 1))
                    }
                  >
                    Folha anterior
                  </button>
                  <button
                    className="secondary"
                    type="button"
                    disabled={pageIndex >= job.pages.length - 1}
                    onClick={() =>
                      setPageIndex((index) =>
                        Math.min(job.pages.length - 1, index + 1),
                      )
                    }
                  >
                    Próxima folha
                  </button>
                </div>
              ) : null}
              {page?.imageUrl ? (
                <div className="actions">
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => setLightbox(true)}
                  >
                    Ampliar visualização
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <span className="empty-icon">
                <Icon name="book" size={30} />
              </span>
              <h2>
                {job.simulated
                  ? "Seu teste foi registrado."
                  : "Seu material está em preparação."}
              </h2>
              <p className="meta">
                {job.simulated
                  ? "Você percorreu o fluxo do aplicativo. Quando a IA estiver conectada, a atividade ilustrada aparecerá aqui."
                  : "A prévia aparecerá quando o material estiver disponível."}
              </p>
            </>
          )}
          <div className="actions">
            {job.files
              .filter((file) => file.kind !== "calculation_sheet")
              .map((file) => (
                <FileButton key={file.id} file={file} />
              ))}
            {job.request.subjectId === "matematica"
              ? job.files
                  .filter((file) => file.kind === "calculation_sheet")
                  .map((file) => <FileButton key={file.id} file={file} />)
              : null}
            {!hasFiles ? (
              <p className="hint">
                Os arquivos da criança e o guia da mãe serão separados. O guia
                trará respostas comentadas, o que a criança está aprendendo,
                como ajudar sem entregar a resposta, sinais de que vale praticar
                mais, materiais e tempo estimado.
              </p>
            ) : null}
            <Link
              className="secondary"
              to="/"
              style={{ display: "grid", placeItems: "center" }}
            >
              Montar outra atividade
            </Link>
          </div>
        </div>

      </div>

      {lightbox && page?.imageUrl ? (
        <ImageDialog
          src={page.imageUrl}
          title={`Folha ${page.pageNumber} ampliada`}
          onClose={() => setLightbox(false)}
        />
      ) : null}
    </section>
  );
}

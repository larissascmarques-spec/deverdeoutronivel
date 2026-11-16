import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getServices } from "../services";
import { isIntegrationError } from "../services/errors";
import {
  GENERATION_STEPS,
  STATUS_LABELS,
  STEP_LABELS,
  YEAR_LABELS,
  SUBJECT_LABELS,
  type GenerationJob,
  type GenerationStep,
} from "../types/contracts";

function stepState(current: GenerationStep | null, step: GenerationStep) {
  if (!current) return "";
  const currentIndex = GENERATION_STEPS.indexOf(current);
  const stepIndex = GENERATION_STEPS.indexOf(step);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";
  return "";
}

export function GeracaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setJob(null);
    setError(null);

    async function load() {
      if (!id) return;
      try {
        const next = await getServices().generation.getJob(id);
        if (cancelled) return;
        if (!next) {
          setError("Este pedido não foi encontrado neste navegador.");
          return;
        }
        setJob(next);
        if (next?.status === "completed") {
          navigate(`/resultado/${next.id}`, { replace: true });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            isIntegrationError(loadError)
              ? loadError.message
              : "Não foi possível acompanhar este pedido.",
          );
        }
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 700);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id, navigate]);

  async function handleRetry() {
    if (!job || retrying) return;
    setRetrying(true);
    try {
      const next = await getServices().generation.retry(job.id);
      setJob(next);
      setError(null);
    } catch (retryError) {
      setError(
        isIntegrationError(retryError)
          ? retryError.message
          : "Não foi possível tentar de novo.",
      );
    } finally {
      setRetrying(false);
    }
  }

  if (error && !job) {
    return (
      <section>
        <h1 className="page-title">Não foi possível acompanhar</h1>
        <p className="alert" style={{ marginTop: "1rem" }}>
          {error}
        </p>
        <div className="actions">
          <Link
            className="primary"
            to="/"
            style={{ display: "grid", placeItems: "center" }}
          >
            Voltar para o pedido
          </Link>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section>
        <h1 className="page-title">Estamos preparando suas atividades.</h1>
        <p className="lede">Buscando o andamento do pedido.</p>
      </section>
    );
  }

  return (
    <section>
      <p className="eyebrow">ACOMPANHE SEU PEDIDO</p>
      <h1 className="page-title">
        {job.simulated
          ? "Vamos testar o passo a passo."
          : "Estamos preparando suas atividades."}
      </h1>
      <p className="lede">
        {YEAR_LABELS[job.request.year]} ·{" "}
        {SUBJECT_LABELS[job.request.subjectId]} · {job.request.topicLabel}
      </p>

      {job.simulated ? (
        <p className="note" style={{ marginTop: "1rem" }}>
          Etapas simuladas para demonstração. Nenhum conteúdo está sendo gerado
          de verdade.
        </p>
      ) : null}

      <div className="generation-panel" aria-live="polite">
        <p className="meta" style={{ marginTop: "1rem" }}>
          Situação: {STATUS_LABELS[job.status]}
        </p>

        <ol className="status-list">
          {GENERATION_STEPS.map((step) => (
            <li
              key={step}
              className={`status-item ${stepState(job.currentStep, step)}`}
            >
              <span className="dot" aria-hidden="true" />
              <span>{STEP_LABELS[step]}</span>
            </li>
          ))}
        </ol>

        {error ? (
          <p className="alert" role="alert">
            {error}
          </p>
        ) : null}
        {job.status === "failed" ? (
          <div className="stack">
            <p className="alert">
              {job.errorMessage ?? "Não foi possível gerar esta atividade."}
            </p>
            <button
              className="primary"
              type="button"
              onClick={() => void handleRetry()}
              disabled={retrying}
            >
              {retrying ? "Tentando de novo…" : "Tentar de novo"}
            </button>
            <Link
              className="secondary"
              to="/"
              style={{ display: "grid", placeItems: "center" }}
            >
              Editar o pedido
            </Link>
          </div>
        ) : null}

        {job.status === "needs_review" ? (
          <div className="stack">
            <p className="note">
              O material ainda precisa de conferência. Os arquivos ficam
              disponíveis depois dessa etapa. Nada é considerado pronto só
              porque foi gerado.
            </p>
            <Link
              className="primary"
              to={`/resultado/${job.id}`}
              style={{ display: "grid", placeItems: "center" }}
            >
              Ver o pedido
            </Link>
            <Link
              className="secondary"
              to="/"
              style={{ display: "grid", placeItems: "center" }}
            >
              Montar outra atividade
            </Link>
          </div>
        ) : null}
        <div className="actions">
          <Link className="secondary" to="/atividades">
            Acompanhar em Minhas atividades
          </Link>
        </div>
      </div>
    </section>
  );
}

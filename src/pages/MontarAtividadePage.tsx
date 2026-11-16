import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { VISUAL_REFERENCE_VERSION } from "../config/visualReference";
import { PAGE_COUNT_OPTIONS } from "../data/demoCatalog";
import { getServices } from "../services";
import { isDemoMode } from "../config/env";
import { useDraft } from "../state/DraftContext";
import {
  DIFFICULTY_OPTIONS,
  YEAR_LABELS,
  type Difficulty,
  type GenerationRequest,
  type PageCount,
  type SchoolYear,
  type SubjectId,
  type SubjectOption,
  type TopicSuggestion,
} from "../types/contracts";
import { setDemoOutcome } from "../services/demo/generationDemo";
import { Icon } from "../components/ui/Icon";
import { isIntegrationError } from "../services/errors";

interface FieldErrors {
  year?: string;
  subjectId?: string;
  topic?: string;
  difficulty?: string;
}

export function MontarAtividadePage() {
  const { draft, setDraft } = useDraft();
  const navigate = useNavigate();
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoOutcome, setOutcomeState] = useState<
    "completed" | "failed" | "needs_review"
  >("completed");
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const catalog = getServices().catalog;
    Promise.all([catalog.listYears(), catalog.listSubjects()])
      .then(([nextYears, nextSubjects]) => {
        if (cancelled) return;
        setYears(nextYears);
        setSubjects(nextSubjects);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFormError(
            isIntegrationError(error)
              ? error.message
              : "Não foi possível carregar o catálogo.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draft.year || !draft.subjectId) {
      setTopics([]);
      return;
    }

    let cancelled = false;
    getServices()
      .catalog.searchTopics({
        year: draft.year,
        subjectId: draft.subjectId,
        query: draft.topicQuery,
      })
      .then((result) => {
        if (!cancelled) setTopics(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFormError(
            isIntegrationError(error)
              ? error.message
              : "Não foi possível carregar os assuntos.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [draft.year, draft.subjectId, draft.topicQuery]);

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === draft.topicId) ?? null,
    [topics, draft.topicId],
  );

  function update<K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K],
  ) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "year" || key === "subjectId") {
        next.topicId = null;
        next.topicQuery = "";
      }
      return next;
    });
    setFormError(null);
    setErrors((current) => ({
      ...current,
      [key === "topicQuery" ? "topic" : key]: undefined,
    }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!draft.year) next.year = "Escolha o ano escolar.";
    if (!draft.subjectId) next.subjectId = "Escolha a matéria.";
    if (!draft.topicId && draft.topicQuery.trim().length < 3) {
      next.topic =
        "Escolha um assunto da lista ou escreva o que a criança está estudando.";
    }
    if (!draft.difficulty) next.difficulty = "Escolha a dificuldade.";
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Complete os campos indicados abaixo para continuar.");
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            '[data-invalid="true"] button, [aria-invalid="true"]',
          )
          ?.focus(),
      );
      return;
    }

    const request: GenerationRequest = {
      year: draft.year as SchoolYear,
      subjectId: draft.subjectId as SubjectId,
      topicId: draft.topicId,
      topicLabel: selectedTopic?.label ?? draft.topicQuery.trim(),
      difficulty: draft.difficulty as Difficulty,
      pageCount: draft.pageCount,
      extraContext: draft.extraContext.trim() || null,
      visualReferenceVersion: VISUAL_REFERENCE_VERSION,
    };

    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);

    try {
      if (isDemoMode()) {
        setDemoOutcome(demoOutcome);
      }
      const job = await getServices().generation.createRequest(request);
      navigate(`/geracao/${job.id}`);
    } catch (error) {
      setFormError(
        isIntegrationError(error)
          ? error.message
          : "Não foi possível enviar o pedido. Tente de novo.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">ESTUDAR EM CASA, DO SEU JEITO</p>
        <h1 className="page-title">O que seu filho está estudando?</h1>
        <p className="lede">
          Você escolhe o assunto. Seu filho pratica no papel.
        </p>
      </div>
      <div className="builder-layout">
        <form className="builder-form" onSubmit={handleSubmit} noValidate>
          <div className="stack form-stack">
            <fieldset className="field" data-invalid={Boolean(errors.year)}>
              <legend>
                <span className="step-number">1</span> Em que ano ele está?
              </legend>
              <div className="choice-grid five">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className="choice"
                    aria-pressed={draft.year === year}
                    onClick={() => update("year", year)}
                  >
                    {YEAR_LABELS[year]}
                  </button>
                ))}
              </div>
              {errors.year ? (
                <p className="field-error">{errors.year}</p>
              ) : null}
            </fieldset>

            <fieldset
              className="field"
              data-invalid={Boolean(errors.subjectId)}
            >
              <legend>
                <span className="step-number">2</span> Qual é a matéria?
              </legend>
              <div className="choice-grid">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    className="choice"
                    aria-pressed={draft.subjectId === subject.id}
                    onClick={() => update("subjectId", subject.id)}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
              {errors.subjectId ? (
                <p className="field-error">{errors.subjectId}</p>
              ) : null}
            </fieldset>

            <div className="field">
              <label className="field-label" htmlFor="assunto">
                <span className="step-number">3</span> O que vamos praticar?
              </label>
              <input
                id="assunto"
                maxLength={120}
                aria-invalid={Boolean(errors.topic)}
                aria-describedby="assunto-ajuda"
                className="input"
                value={draft.topicQuery}
                onChange={(event) => {
                  update("topicQuery", event.target.value);
                  setDraft((current) => ({ ...current, topicId: null }));
                }}
                placeholder="Ex.: adição e subtração"
                autoComplete="off"
                disabled={!draft.year || !draft.subjectId}
              />
              {!draft.year || !draft.subjectId ? (
                <p className="hint" id="assunto-ajuda">
                  Escolha o ano e a matéria para ver sugestões.
                </p>
              ) : (
                <p className="hint" id="assunto-ajuda">
                  Toque numa sugestão ou escreva o assunto se ele não aparecer
                  na lista.
                </p>
              )}
              {topics.length > 0 ? (
                <div
                  className="suggestions"
                  role="group"
                  aria-label="Sugestões de assunto"
                >
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className="suggestion"
                      aria-pressed={draft.topicId === topic.id}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          topicId: topic.id,
                          topicQuery: topic.label,
                        }))
                      }
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {draft.topicQuery.trim().length >= 3 && !draft.topicId ? (
                <p className="hint">
                  Vamos usar o assunto que você escreveu: “
                  {draft.topicQuery.trim()}”.
                </p>
              ) : null}
              {errors.topic ? (
                <p className="field-error">{errors.topic}</p>
              ) : null}
            </div>

            <fieldset
              className="field"
              data-invalid={Boolean(errors.difficulty)}
            >
              <legend>
                <span className="step-number">4</span> Qual é o momento dele?
              </legend>
              <div className="difficulty-grid">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="option-card"
                    aria-pressed={draft.difficulty === option.id}
                    onClick={() => update("difficulty", option.id)}
                  >
                    <strong>{option.title}</strong>
                    <small>{option.description}</small>
                  </button>
                ))}
              </div>
              {errors.difficulty ? (
                <p className="field-error">{errors.difficulty}</p>
              ) : null}
            </fieldset>

            <fieldset className="field">
              <legend>
                <span className="step-number">5</span> Quantas folhas você quer?
              </legend>
              <div className="choice-grid five">
                {PAGE_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    className="choice"
                    aria-pressed={draft.pageCount === count}
                    onClick={() => update("pageCount", count as PageCount)}
                  >
                    {count} {count === 1 ? "folha" : "folhas"}
                  </button>
                ))}
              </div>
              <p className="hint">
                Cada folha é uma atividade completa. Ela pode ter várias
                perguntas.
              </p>
            </fieldset>

            <details
              className="details"
              open={draft.extraOpen}
              onToggle={(event) =>
                update("extraOpen", (event.target as HTMLDetailsElement).open)
              }
            >
              <summary>Quer explicar melhor o que ele está estudando?</summary>
              <label className="field-label" htmlFor="contexto">
                Observação opcional
              </label>
              <textarea
                id="contexto"
                className="textarea"
                maxLength={280}
                value={draft.extraContext}
                onChange={(event) => update("extraContext", event.target.value)}
                placeholder="Ex.: a professora pediu contas com reagrupamento."
              />
              <p className="hint counter">
                {draft.extraContext.length}/280 caracteres
              </p>
            </details>

            {formError ? (
              <p className="alert" role="alert">
                {formError}
              </p>
            ) : null}

            <button className="primary" type="submit" disabled={submitting}>
              {submitting
                ? "Enviando pedido…"
                : isDemoMode()
                  ? "Testar geração de atividade"
                  : "Gerar minhas atividades"}{" "}
              <Icon name="arrow" />
            </button>

            <p className="hint submit-note">
              {isDemoMode()
                ? "Teste gratuito desta prévia. Nenhuma atividade será gerada."
                : "Atividade da criança e guia da mãe em arquivos separados."}
            </p>

            {isDemoMode() ? (
              <details className="details">
                <summary>Opções da demonstração</summary>
                <p className="hint">
                  Use só para ver os estados da tela. Isso não gera atividade
                  real.
                </p>
                <div className="choice-grid" style={{ marginTop: "0.7rem" }}>
                  {(
                    [
                      ["completed", "Concluído sem arquivos"],
                      ["failed", "Falhou"],
                      ["needs_review", "Precisa de revisão"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className="choice"
                      aria-pressed={demoOutcome === value}
                      onClick={() => setOutcomeState(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </form>

      </div>
    </section>
  );
}

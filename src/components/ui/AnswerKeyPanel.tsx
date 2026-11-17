import type { AnswerKey } from "../../types/contracts";

export function AnswerKeyPanel({
  answerKey,
  simulated,
}: {
  answerKey?: AnswerKey | null;
  simulated: boolean;
}) {
  return (
    <details className="answer-key-panel">
      <summary>
        Ver gabarito <span aria-hidden="true">⌄</span>
      </summary>
      {answerKey?.entries.length ? (
        <div className="answer-key-content">
          <p className="hint">
            Respostas para quem acompanha a criança. A atividade para imprimir
            continua sem o gabarito.
          </p>
          <ol className="answer-key-list">
            {answerKey.entries.map((entry) => (
              <li key={entry.questionId}>
                <h3>{entry.questionLabel}</h3>
                <p>
                  <strong>
                    {entry.openEnded ? "Exemplo de resposta:" : "Resposta:"}
                  </strong>{" "}
                  {entry.answer}
                </p>
                <p>{entry.explanation}</p>
                {entry.steps?.length ? (
                  <ol>
                    {entry.steps.map((step, index) => (
                      <li key={`${entry.questionId}-${index}`}>{step}</li>
                    ))}
                  </ol>
                ) : null}
                {entry.acceptanceCriteria ? (
                  <p>
                    <strong>O que observar:</strong> {entry.acceptanceCriteria}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="answer-key-content">
          <p className="meta">
            {simulated
              ? "Na demonstração não há respostas geradas. O gabarito da sua atividade aparecerá aqui quando a geração e a revisão estiverem conectadas."
              : "O gabarito será liberado junto com a atividade, depois da conferência das respostas."}
          </p>
        </div>
      )}
    </details>
  );
}

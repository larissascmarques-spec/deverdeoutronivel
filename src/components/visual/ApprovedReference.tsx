import { useState } from "react";
import { VISUAL_REFERENCE_PATH } from "../../config/visualReference";
import { ImageDialog } from "../ui/ImageDialog";

export function ApprovedReference({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const content = (
    <>
      <button
        type="button"
        className="reference-image-button"
        onClick={() => setOpen(true)}
        aria-label="Ampliar modelo aprovado de atividade"
      >
        <img
          src={VISUAL_REFERENCE_PATH}
          alt="Modelo aprovado: atividade de Matemática com fotografias de cookies, blocos numerados e destaques azul-marinho e laranja"
        />
        <span>Ampliar modelo ↗</span>
      </button>
      <p className="hint reference-disclaimer">
        Exemplo do estilo visual. Este modelo não é uma atividade gerada para o
        seu pedido.
      </p>
    </>
  );
  return (
    <>
      {defaultOpen ? (
        <div className="reference-content">{content}</div>
      ) : (
        <details className="details">
          <summary>Ver modelo de atividade</summary>
          {content}
        </details>
      )}
      {open && (
        <ImageDialog
          src={VISUAL_REFERENCE_PATH}
          title="Modelo aprovado de atividade"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

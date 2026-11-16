import { useState } from 'react'
import {
  VISUAL_REFERENCE_PATH,
  VISUAL_REFERENCE_VERSION,
} from '../../config/visualReference'
import { A4PageFrame } from './A4PageFrame'

interface ApprovedReferenceProps {
  defaultOpen?: boolean
}

export function ApprovedReference({ defaultOpen = false }: ApprovedReferenceProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <details className="details" open={defaultOpen}>
        <summary>Referência visual aprovada</summary>
        <div className="stack" style={{ marginTop: '0.7rem' }}>
          <p className="hint">
            Este é o modelo da folha ilustrada que a IA deverá seguir. Não é o
            resultado de um pedido seu e o conteúdo pedagógico desta imagem não
            está automaticamente validado. Tema e assunto das atividades reais
            vão variar.
          </p>
          <p className="hint">Versão do modelo: {VISUAL_REFERENCE_VERSION}</p>
          <A4PageFrame
            src={VISUAL_REFERENCE_PATH}
            alt="Modelo aprovado de folha ilustrada em formato A4"
            emptyText="A referência visual não foi encontrada."
          />
          <button className="secondary" type="button" onClick={() => setOpen(true)}>
            Ampliar visualização
          </button>
        </div>
      </details>

      {open ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Folha de referência">
          <button className="lightbox-close" type="button" onClick={() => setOpen(false)}>
            Fechar
          </button>
          <img
            src={VISUAL_REFERENCE_PATH}
            alt="Modelo aprovado de folha ilustrada, em tamanho ampliado"
          />
        </div>
      ) : null}
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getServices } from '../services'
import { isIntegrationError } from '../services/errors'
import {
  STATUS_LABELS,
  YEAR_LABELS,
  type LibraryItem,
} from '../types/contracts'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function MinhasAtividadesPage() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<LibraryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getServices()
        .library.listItems(query)
        .then(setItems)
        .catch((loadError: unknown) => {
          setError(
            isIntegrationError(loadError)
              ? loadError.message
              : 'Não foi possível abrir suas atividades.',
          )
        })
    }, 200)

    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <section>
      <h1 className="page-title">Minhas atividades</h1>
      <p className="lede">Encontre o material que você já pediu para imprimir.</p>

      <div className="field" style={{ marginTop: '1.2rem' }}>
        <label className="field-label" htmlFor="busca">
          Buscar
        </label>
        <input
          id="busca"
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Assunto, matéria ou ano"
        />
      </div>

      {error ? <p className="alert" style={{ marginTop: '1rem' }}>{error}</p> : null}

      {items.length === 0 && !error && query.trim() ? (
        <p className="hint" style={{ marginTop: '1rem' }}>
          Nenhuma atividade encontrada para essa busca.
        </p>
      ) : null}

      {items.length === 0 && !error && !query.trim() ? (
        <div className="empty">
          <p>Suas atividades aparecerão aqui depois da primeira geração.</p>
          <Link className="primary" to="/" style={{ display: 'grid', placeItems: 'center', maxWidth: 22 * 16 }}>
            Montar minha primeira atividade
          </Link>
        </div>
      ) : items.length > 0 ? (
        <div className="card-list">
          {items.map((item) => {
            const href =
              item.status === 'processing' || item.status === 'awaiting'
                ? `/geracao/${item.id}`
                : `/resultado/${item.id}`
            const available = item.files.filter((file) => file.available).length

            return (
              <Link key={item.id} className="card" to={href}>
                <strong>{item.title}</strong>
                <p className="meta">
                  {YEAR_LABELS[item.year]} · {item.subjectName} · {formatDate(item.createdAt)}
                </p>
                <span className="badge">{STATUS_LABELS[item.status]}</span>
                {item.simulated ? <span className="badge sim">Simulado</span> : null}
                <p className="hint">
                  {available > 0
                    ? `${available} arquivo(s) disponível(is)`
                    : 'Ainda sem arquivos para baixar'}
                </p>
              </Link>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isDemoMode } from "../config/env";
import { Icon } from "../components/ui/Icon";
import { getServices } from "../services";
import { isIntegrationError } from "../services/errors";
import {
  STATUS_LABELS,
  YEAR_LABELS,
  type LibraryItem,
} from "../types/contracts";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
  }).format(date);
}

export function MinhasAtividadesPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      getServices()
        .library.listItems(query)
        .then((result) => {
          if (!cancelled) setItems(result);
        })
        .catch((loadError: unknown) => {
          if (cancelled) return;
          setError(
            isIntegrationError(loadError)
              ? loadError.message
              : "Não foi possível abrir suas atividades.",
          );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <section>
      <p className="eyebrow">TUDO NO MESMO LUGAR</p>
      <h1 className="page-title">Minhas atividades</h1>
      <p className="lede">
        Suas atividades ficam aqui para consultar e baixar novamente.
      </p>

      <div className="field search-wrap" style={{ marginTop: "1.2rem" }}>
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

      {loading ? (
        <p role="status" className="hint" style={{ marginTop: 20 }}>
          Buscando suas atividades…
        </p>
      ) : null}
      {error ? (
        <p className="alert" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}

      {items.length === 0 && !loading && !error && query.trim() ? (
        <p className="hint" style={{ marginTop: "1rem" }}>
          Nenhuma atividade encontrada para essa busca.
        </p>
      ) : null}

      {items.length === 0 && !loading && !error && !query.trim() ? (
        <div className="empty">
          <span className="empty-icon">
            <Icon name="folder" size={30} />
          </span>
          <h2>A primeira atividade começa aqui.</h2>
          <p>
            Escolha o que seu filho está estudando. Seus pedidos ficam guardados
            neste espaço.
          </p>
          <Link
            className="primary"
            to="/"
            style={{ display: "grid", placeItems: "center", maxWidth: 22 * 16 }}
          >
            Montar minha primeira atividade
          </Link>
        </div>
      ) : items.length > 0 ? (
        <div className="card-list">
          {items.map((item) => {
            const href =
              item.status === "processing" ||
              item.status === "awaiting" ||
              item.status === "failed" ||
              item.status === "needs_review"
                ? `/geracao/${item.id}`
                : `/resultado/${item.id}`;
            const available = item.files.filter(
              (file) => file.available,
            ).length;

            return (
              <Link key={item.id} className="card" to={href}>
                <strong>{item.title}</strong>
                <p className="meta">
                  {YEAR_LABELS[item.year]} · {item.subjectName}
                  <br />
                  <time dateTime={item.createdAt}>Pedido em {formatDate(item.createdAt)}</time>
                </p>
                <div className="badges">
                  <span className="badge">
                    {item.simulated && item.status === "completed"
                      ? "Teste concluído"
                      : STATUS_LABELS[item.status]}
                  </span>
                  {item.simulated ? (
                    <span className="badge sim">Demonstração</span>
                  ) : null}
                </div>
                <p className="hint">
                  {available > 0
                    ? `${available} arquivo(s) disponível(is)`
                    : "Ainda sem arquivos para baixar"}
                </p>
              </Link>
            );
          })}
        </div>
      ) : null}
      {isDemoMode() ? (
        <p className="footer-note">
          Na demonstração, os pedidos são salvos apenas neste navegador.
        </p>
      ) : null}
    </section>
  );
}

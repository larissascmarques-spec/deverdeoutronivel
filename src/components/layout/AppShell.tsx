import { useEffect, useRef } from "react";
import { Icon } from "../ui/Icon";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getAppMode, isSupabaseConfigured } from "../../config/env";
import { DemoBanner } from "./DemoBanner";

export function AppShell() {
  const mode = getAppMode();
  const configured = isSupabaseConfigured();
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  const montarAtivo =
    location.pathname === "/" ||
    location.pathname.startsWith("/geracao") ||
    location.pathname.startsWith("/resultado");

  if (mode === "production" && !configured) {
    return (
      <div className="block-error">
        <div className="stack" style={{ maxWidth: 26 * 16 }}>
          <h1 className="page-title">Não foi possível conectar</h1>
          <p className="lede">
            O aplicativo está em modo de produção, mas o Supabase ainda não foi
            configurado. Isso não abre o modo demonstração automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="topbar">
        {mode === "demo" ? <DemoBanner /> : null}
        <div className="topbar-inner">
          <NavLink
            className="brand"
            to="/"
            aria-label="Dever de Outro Nível, início"
          >
            <span className="brand-symbol">
              <Icon name="book" size={25} />
            </span>
            <div>
              <strong>Dever de Outro Nível</strong>
              <span>Um jeito mais leve de estudar em casa.</span>
            </div>
          </NavLink>
          <NavLink className="school-tag" to="/minha-ia">Minha IA</NavLink>
        </div>
      </header>

      <main className="page" id="conteudo" ref={main} tabIndex={-1}>
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Principal">
        <div className="nav-inner">
          <NavLink to="/" className={`nav-link${montarAtivo ? " active" : ""}`}>
            <Icon name="plus" /> Montar atividade
          </NavLink>
          <NavLink
            to="/atividades"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon name="folder" /> Minhas atividades
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { getAppMode, isSupabaseConfigured } from '../../config/env'
import { DemoBanner } from './DemoBanner'

export function AppShell() {
  const mode = getAppMode()
  const configured = isSupabaseConfigured()
  const location = useLocation()
  const montarAtivo =
    location.pathname === '/' ||
    location.pathname.startsWith('/geracao') ||
    location.pathname.startsWith('/resultado')

  if (mode === 'production' && !configured) {
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
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        {mode === 'demo' ? <DemoBanner /> : null}
        <div className="topbar-inner">
          <div className="brand">
            <strong>Dever de Outro Nível</strong>
            <span>Atividades para imprimir, do 1º ao 5º ano</span>
          </div>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Principal">
        <div className="nav-inner">
          <NavLink
            to="/"
            className={`nav-link${montarAtivo ? ' active' : ''}`}
          >
            Montar atividade
          </NavLink>
          <NavLink
            to="/atividades"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Minhas atividades
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

import { MinhaIAPage } from './pages/MinhaIAPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DraftProvider } from './state/DraftContext'
import { GeracaoPage } from './pages/GeracaoPage'
import { MinhasAtividadesPage } from './pages/MinhasAtividadesPage'
import { MontarAtividadePage } from './pages/MontarAtividadePage'
import { ResultadoPage } from './pages/ResultadoPage'

export default function App() {
  return (
    <DraftProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/minha-ia" element={<MinhaIAPage />} />
          <Route path="/" element={<MontarAtividadePage />} />
          <Route path="/atividades" element={<MinhasAtividadesPage />} />
          <Route path="/geracao/:id" element={<GeracaoPage />} />
          <Route path="/resultado/:id" element={<ResultadoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DraftProvider>
  )
}

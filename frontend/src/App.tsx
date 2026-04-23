import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRolesWrap } from './auth/RequireAuth'
import { ROTA_ENTRAR } from './routes'
import { AppShell } from './layouts/AppShell'
import {
  AdminAlugueisPage,
  AdminClientesPage,
  AdminHistoricoPage,
  AdminOperacaoPage,
  AdminPagamentosPage,
  AdminQuartosPage,
  AdminReservasPage,
  AdminResidenciasPage,
} from './pages/admin/AdminTables'
import { CatalogoPage } from './pages/explorar/CatalogoPage'
import { QuartoDetalhePage } from './pages/explorar/QuartoDetalhePage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ReciboPage } from './pages/ReciboPage'
import {
  CliAlugueisPage,
  CliEstadiasPage,
  CliHistoricoPage,
  CliPagamentosPage,
  CliPerfilPage,
  CliReservasPage,
} from './pages/cli/CliPages'
import {
  PropAlugueisPage,
  PropMovimentacaoPage,
  PropPerfilPage,
  PropQuartosPage,
  PropReservasPage,
  PropResidenciasPage,
} from './pages/prop/PropPages'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to={ROTA_ENTRAR} replace />} />
      <Route path={ROTA_ENTRAR} element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<AppShell />}>
        <Route path="/explorar" element={<CatalogoPage />} />
        <Route path="/explorar/:id" element={<QuartoDetalhePage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/admin/clientes"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminClientesPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/residencias"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminResidenciasPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/quartos"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminQuartosPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/operacao"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminOperacaoPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/reservas"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminReservasPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/alugueis"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminAlugueisPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/pagamentos"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminPagamentosPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/admin/historico"
            element={
              <RequireRolesWrap roles={['ADMIN']}>
                <AdminHistoricoPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/prop/residencias"
            element={
              <RequireRolesWrap roles={['PROPRIETARIO']}>
                <PropResidenciasPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/prop/quartos"
            element={
              <RequireRolesWrap roles={['PROPRIETARIO']}>
                <PropQuartosPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/prop/movimentacao"
            element={
              <RequireRolesWrap roles={['PROPRIETARIO']}>
                <PropMovimentacaoPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/prop/reservas"
            element={
              <RequireRolesWrap roles={['PROPRIETARIO']}>
                <PropReservasPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/prop/alugueis"
            element={
              <RequireRolesWrap roles={['PROPRIETARIO']}>
                <PropAlugueisPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/prop/perfil"
            element={
              <RequireRolesWrap roles={['PROPRIETARIO']}>
                <PropPerfilPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/cli/perfil"
            element={
              <RequireRolesWrap roles={['CLIENTE']}>
                <CliPerfilPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/cli/estadias"
            element={
              <RequireRolesWrap roles={['CLIENTE']}>
                <CliEstadiasPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/cli/reservas"
            element={
              <RequireRolesWrap roles={['CLIENTE']}>
                <CliReservasPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/cli/alugueis"
            element={
              <RequireRolesWrap roles={['CLIENTE']}>
                <CliAlugueisPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/cli/pagamentos"
            element={
              <RequireRolesWrap roles={['CLIENTE']}>
                <CliPagamentosPage />
              </RequireRolesWrap>
            }
          />
          <Route
            path="/cli/historico"
            element={
              <RequireRolesWrap roles={['CLIENTE']}>
                <CliHistoricoPage />
              </RequireRolesWrap>
            }
          />
          <Route path="/recibo/:aluguelId" element={<ReciboPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/explorar" replace />} />
    </Routes>
  )
}

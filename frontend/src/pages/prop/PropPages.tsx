import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { http } from '../../api/http'
import type { Aluguel, PageResponse, Proprietario, Quarto, Reserva, Residencia } from '../../api/types'
import { getApiErrorMessage } from '../../auth/AuthContext'
import { useUi } from '../../components/feedback'
import { IconEdit, IconExternalLink, IconPlus, IconTrash } from '../../components/propQuartoIcons'
import {
  Button,
  CheckboxField,
  DataTable,
  EmptyState,
  Field,
  InlineNotice,
  LoadingState,
  Modal,
  PageHeader,
  SectionCard,
  SelectInput,
  StatusBadge,
  TextInput,
} from '../../components/ui'
import { PropFlowHint } from '../../components/PropFlowHint'
import { formatDateTime, formatMoney, roomTypeLabel, statusTone } from '../../utils/format'

export function PropResidenciasPage() {
  const { confirm, toast } = useUi()
  const [rows, setRows] = useState<Residencia[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    endereco: '',
    numero: '',
    bairro: '',
    cep: '',
    telefone: '',
    email: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data: me } = await http.get<Proprietario>('/api/proprietarios/perfil')
      const { data } = await http.get<PageResponse<Residencia>>(`/api/residencias/proprietario/${me.id}?size=100`)
      setRows(data.content)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function criar() {
    setErr(null)
    try {
      await http.post('/api/residencias', {
        endereco: form.endereco,
        numero: form.numero,
        bairro: form.bairro,
        cep: form.cep,
        telefone: form.telefone,
        email: form.email,
        proprietarioId: null,
      })
      setForm({
        endereco: '',
        numero: '',
        bairro: '',
        cep: '',
        telefone: '',
        email: '',
      })
      toast({
        kind: 'success',
        title: 'Residência criada',
        message: 'A nova unidade já está listada na sua área.',
      })
      setModalOpen(false)
      await load()
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Não foi possível criar a residência',
        message,
      })
    }
  }

  async function excluir(id: number) {
    const approved = await confirm({
      title: 'Excluir residência?',
      description: 'O cadastro será removido da sua área assim que a operação for confirmada.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await http.delete(`/api/residencias/${id}`)
      toast({
        kind: 'success',
        title: 'Residência excluída',
        message: 'O item foi removido com sucesso.',
      })
      await load()
    } catch (e) {
      toast({
        kind: 'error',
        title: 'Exclusão não concluída',
        message: getApiErrorMessage(e),
      })
    }
  }

  return (
    <div className="page">
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova residência"
        description="Cadastre o endereço completo. Depois vincule quartos em Meus quartos."
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={() => void criar()}>
              Criar residência
            </Button>
          </>
        }
      >
        <div className="modal-form-grid">
          <Field label="Endereço" className="full">
            <TextInput value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </Field>
          <Field label="Número">
            <TextInput value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          </Field>
          <Field label="Bairro">
            <TextInput value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
          </Field>
          <Field label="CEP">
            <TextInput value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          </Field>
          <Field label="Telefone" className="full">
            <TextInput value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </Field>
          <Field label="E-mail" className="full">
            <TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
      </Modal>

      <PageHeader
        eyebrow="Proprietário"
        title="Minhas residências"
        actions={
          <>
            <Button type="button" variant="primary" onClick={() => setModalOpen(true)}>
              Nova residência
            </Button>
            <Button variant="ghost" onClick={() => void load()}>
              Atualizar
            </Button>
          </>
        }
      />

      <PropFlowHint title="Fluxo sugerido">
        <ol className="prop-flow-hint__list">
          <li>Cadastre o imóvel e confira na tabela.</li>
          <li>
            Em <Link to="/prop/quartos">Meus quartos</Link>, publique cada quarto.
          </li>
          <li>Quartos ativos entram no catálogo.</li>
        </ol>
      </PropFlowHint>

      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar residências">
          {err}
        </InlineNotice>
      )}

      {loading ? (
        <LoadingState label="Carregando suas residências…" />
      ) : rows.length > 0 ? (
        <DataTable>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Endereço</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <div className="table-cell-stack">
                        <strong>
                          {r.endereco}, {r.numero}
                        </strong>
                        <span className="muted small">
                          {r.bairro} · CEP {r.cep}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span>{r.email}</span>
                        <span className="muted small">{r.telefone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="danger" onClick={() => void excluir(r.id)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Sem residências" description="Cadastre uma unidade." />
        </SectionCard>
      )}
    </div>
  )
}

function parseIntOpt(s: string): number | undefined {
  if (!s || s.trim() === '') return undefined
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? undefined : n
}

function parseDecOpt(s: string): string | undefined {
  if (!s || s.trim() === '') return undefined
  return s
}

const defaultQuartoForm = () => ({
  residenciaId: '',
  tipoQuarto: 'INDIVIDUAL',
  valorBaseDiaria: '120',
  possuiArCondicionado: true as boolean,
  possuiHidromassagem: false as boolean,
  ativo: true as boolean,
  numCamasSolteiro: '1',
  adicionalDiariaPorCamaExtra: '0',
  tipoCamaCasal: 'COMUM' as 'COMUM' | 'QUEEN_OU_KING',
  permiteBerco: false as boolean,
  taxaDiariaBerco: '0',
  adicionalConfortoCamaComum: '0',
  adicionalConfortoQueenKing: '0',
  famCamasSolteiro: '0',
  famCamaCasalComum: '0',
  famCamaCasalGrande: '0',
  famAmbientesDistintos: '0',
})

type QuartoFormState = ReturnType<typeof defaultQuartoForm>

function camposEspecificosQuarto(f: QuartoFormState) {
  if (f.tipoQuarto === 'INDIVIDUAL') {
    return {
      numCamasSolteiro: parseIntOpt(f.numCamasSolteiro),
      adicionalDiariaPorCamaExtra: parseDecOpt(f.adicionalDiariaPorCamaExtra),
    }
  }
  if (f.tipoQuarto === 'CASAL') {
    return {
      tipoCamaCasal: f.tipoCamaCasal,
      permiteBerco: f.permiteBerco,
      taxaDiariaBerco: parseDecOpt(f.taxaDiariaBerco),
      adicionalConfortoCamaComum: parseDecOpt(f.adicionalConfortoCamaComum),
      adicionalConfortoQueenKing: parseDecOpt(f.adicionalConfortoQueenKing),
    }
  }
  if (f.tipoQuarto === 'FAMILIA') {
    return {
      famCamasSolteiro: parseIntOpt(f.famCamasSolteiro),
      famCamaCasalComum: parseIntOpt(f.famCamaCasalComum),
      famCamaCasalGrande: parseIntOpt(f.famCamaCasalGrande),
      famAmbientesDistintos: parseIntOpt(f.famAmbientesDistintos),
    }
  }
  return {}
}

function formToQuartoCreateBody(f: QuartoFormState) {
  return {
    residenciaId: Number(f.residenciaId),
    tipoQuarto: f.tipoQuarto,
    valorBaseDiaria: f.valorBaseDiaria,
    possuiArCondicionado: f.possuiArCondicionado,
    possuiHidromassagem: f.possuiHidromassagem,
    ativo: f.ativo,
    ...camposEspecificosQuarto(f),
  }
}

function formToQuartoUpdateBody(f: QuartoFormState) {
  return {
    tipoQuarto: f.tipoQuarto,
    valorBaseDiaria: f.valorBaseDiaria,
    possuiArCondicionado: f.possuiArCondicionado,
    possuiHidromassagem: f.possuiHidromassagem,
    ativo: f.ativo,
    ...camposEspecificosQuarto(f),
  }
}

function quartoToEditForm(q: Quarto): QuartoFormState {
  return {
    residenciaId: '',
    tipoQuarto: q.tipoQuarto,
    valorBaseDiaria: String(q.valorBaseDiaria ?? ''),
    possuiArCondicionado: q.possuiArCondicionado,
    possuiHidromassagem: q.possuiHidromassagem,
    ativo: q.ativo,
    numCamasSolteiro: q.numCamasSolteiro != null ? String(q.numCamasSolteiro) : '1',
    adicionalDiariaPorCamaExtra: q.adicionalDiariaPorCamaExtra != null ? String(q.adicionalDiariaPorCamaExtra) : '0',
    tipoCamaCasal: (q.tipoCamaCasal as 'COMUM' | 'QUEEN_OU_KING') || 'COMUM',
    permiteBerco: !!q.permiteBerco,
    taxaDiariaBerco: q.taxaDiariaBerco != null ? String(q.taxaDiariaBerco) : '0',
    adicionalConfortoCamaComum: q.adicionalConfortoCamaComum != null ? String(q.adicionalConfortoCamaComum) : '0',
    adicionalConfortoQueenKing: q.adicionalConfortoQueenKing != null ? String(q.adicionalConfortoQueenKing) : '0',
    famCamasSolteiro: q.famCamasSolteiro != null ? String(q.famCamasSolteiro) : '0',
    famCamaCasalComum: q.famCamaCasalComum != null ? String(q.famCamaCasalComum) : '0',
    famCamaCasalGrande: q.famCamaCasalGrande != null ? String(q.famCamaCasalGrande) : '0',
    famAmbientesDistintos: q.famAmbientesDistintos != null ? String(q.famAmbientesDistintos) : '0',
  }
}

export function PropQuartosPage() {
  const { confirm, toast } = useUi()
  const [residencias, setResidencias] = useState<Residencia[]>([])
  const [rows, setRows] = useState<Quarto[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultQuartoForm)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<QuartoFormState>(defaultQuartoForm())
  const [fotosPendentes, setFotosPendentes] = useState<File[]>([])
  const fotosInputRef = useRef<HTMLInputElement>(null)

  const urlPreviews = useMemo(() => fotosPendentes.map((f) => URL.createObjectURL(f)), [fotosPendentes])
  useEffect(
    () => () => {
      urlPreviews.forEach((u) => URL.revokeObjectURL(u))
    },
    [urlPreviews],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data: me } = await http.get<Proprietario>('/api/proprietarios/perfil')
      const [{ data: residenciasData }, { data: quartosData }] = await Promise.all([
        http.get<PageResponse<Residencia>>(`/api/residencias/proprietario/${me.id}?size=100`),
        http.get<PageResponse<Quarto>>('/api/quartos?size=200'),
      ])
      setResidencias(residenciasData.content)
      setRows(quartosData.content)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const meusQuartos = useMemo(
    () => rows.filter((q) => residencias.some((r) => r.id === q.residenciaId)),
    [rows, residencias],
  )

  async function enviarImagens(quartoId: number, files: FileList | null) {
    if (!files?.length) return
    setErr(null)
    try {
      const fd = new FormData()
      Array.from(files).forEach((f) => fd.append('files', f))
      await http.post<Quarto>(`/api/quartos/${quartoId}/imagens`, fd)
      toast({
        kind: 'success',
        title: 'Imagens enviadas',
        message: 'As fotos foram associadas ao quarto.',
      })
      await load()
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Upload não concluído',
        message,
      })
    }
  }

  async function removerImagem(quartoId: number, imagemId: number) {
    setErr(null)
    try {
      await http.delete(`/api/quartos/${quartoId}/imagens/${imagemId}`)
      toast({
        kind: 'success',
        title: 'Imagem removida',
        message: 'A foto foi excluída do quarto.',
      })
      await load()
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Não foi possível remover',
        message,
      })
    }
  }

  function adicionarFotosFicheiros(fileList: FileList | null) {
    if (!fileList?.length) return
    const allow = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    const next = Array.from(fileList).filter(
      (f) => allow.has(f.type) || /\.(jpe?g|png|gif|webp)$/i.test(f.name),
    )
    if (next.length) {
      setFotosPendentes((p) => [...p, ...next])
    }
  }

  async function criar() {
    setErr(null)
    const nFotos = fotosPendentes.length
    try {
      const { data: criado } = await http.post<Quarto>('/api/quartos', formToQuartoCreateBody(form))
      if (nFotos) {
        const fd = new FormData()
        fotosPendentes.forEach((f) => fd.append('files', f))
        await http.post(`/api/quartos/${criado.id}/imagens`, fd)
      }
      if (fotosInputRef.current) fotosInputRef.current.value = ''
      setFotosPendentes([])
      toast({
        kind: 'success',
        title: 'Quarto criado',
        message: nFotos
          ? 'Quarto e imagens publicados. A 1.ª foto é a capa no catálogo.'
          : 'Quarto criado. Adicione fotos no card, abaixo.',
      })
      setModalOpen(false)
      setForm(defaultQuartoForm())
      await load()
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Não foi possível criar o quarto',
        message,
      })
    }
  }

  function openCreateModal() {
    setForm(defaultQuartoForm())
    setFotosPendentes([])
    if (fotosInputRef.current) fotosInputRef.current.value = ''
    setModalOpen(true)
  }

  function openEditModal(q: Quarto) {
    setEditingId(q.id)
    setEditForm(quartoToEditForm(q))
    setEditModalOpen(true)
  }

  async function salvarEdicao() {
    if (editingId == null) return
    setErr(null)
    try {
      await http.put<Quarto>(`/api/quartos/${editingId}`, formToQuartoUpdateBody(editForm))
      toast({
        kind: 'success',
        title: 'Quarto atualizado',
        message: 'As alterações foram salvas.',
      })
      setEditModalOpen(false)
      setEditingId(null)
      await load()
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Não foi possível salvar',
        message,
      })
    }
  }

  async function excluirQuarto(id: number) {
    const approved = await confirm({
      title: 'Excluir quarto?',
      description: 'Esta ação remove o quarto do sistema. Confirme para continuar.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })
    if (!approved) return
    setErr(null)
    try {
      await http.delete(`/api/quartos/${id}`)
      toast({
        kind: 'success',
        title: 'Quarto excluído',
        message: 'O cadastro foi removido.',
      })
      await load()
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Exclusão não concluída',
        message,
      })
    }
  }

  return (
    <div className="page">
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingId(null)
        }}
        title="Editar quarto"
        description="Tipo, diária e comodidades (a residência não pode ser alterada por esta API)."
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={() => void salvarEdicao()}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="stack" style={{ gap: '0.65rem' }}>
          <div className="modal-form-grid">
            <Field label="Tipo">
              <SelectInput value={editForm.tipoQuarto} onChange={(e) => setEditForm({ ...editForm, tipoQuarto: e.target.value })}>
                <option value="INDIVIDUAL">Individual</option>
                <option value="CASAL">Casal</option>
                <option value="FAMILIA">Família</option>
              </SelectInput>
            </Field>
            <Field label="Valor da diária (R$)">
              <TextInput
                value={editForm.valorBaseDiaria}
                onChange={(e) => setEditForm({ ...editForm, valorBaseDiaria: e.target.value })}
                inputMode="decimal"
              />
            </Field>
          </div>
          {editForm.tipoQuarto === 'INDIVIDUAL' && (
            <div className="modal-form-grid">
              <Field label="Camas (solteiro)">
                <TextInput
                  value={editForm.numCamasSolteiro}
                  onChange={(e) => setEditForm({ ...editForm, numCamasSolteiro: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Adicional R$/cama extra" hint="Além da primeira.">
                <TextInput
                  value={editForm.adicionalDiariaPorCamaExtra}
                  onChange={(e) => setEditForm({ ...editForm, adicionalDiariaPorCamaExtra: e.target.value })}
                  inputMode="decimal"
                />
              </Field>
            </div>
          )}
          {editForm.tipoQuarto === 'CASAL' && (
            <div className="stack" style={{ gap: '0.5rem' }}>
              <div className="modal-form-grid">
                <Field label="Cama" className="full">
                  <SelectInput
                    value={editForm.tipoCamaCasal}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        tipoCamaCasal: e.target.value as 'COMUM' | 'QUEEN_OU_KING',
                      })
                    }
                  >
                    <option value="COMUM">Casal comum</option>
                    <option value="QUEEN_OU_KING">Queen / King</option>
                  </SelectInput>
                </Field>
                <Field label="Adic. conforto comum (R$)">
                  <TextInput
                    value={editForm.adicionalConfortoCamaComum}
                    onChange={(e) => setEditForm({ ...editForm, adicionalConfortoCamaComum: e.target.value })}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Adic. conforto Queen/King (R$)">
                  <TextInput
                    value={editForm.adicionalConfortoQueenKing}
                    onChange={(e) => setEditForm({ ...editForm, adicionalConfortoQueenKing: e.target.value })}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Taxa berço (R$/dia)">
                  <TextInput
                    value={editForm.taxaDiariaBerco}
                    onChange={(e) => setEditForm({ ...editForm, taxaDiariaBerco: e.target.value })}
                    inputMode="decimal"
                  />
                </Field>
              </div>
              <CheckboxField
                label="Quarto pode oferecer berço (cliente opta no aluguel)"
                checked={editForm.permiteBerco}
                onChange={(checked) => setEditForm({ ...editForm, permiteBerco: checked })}
              />
            </div>
          )}
          {editForm.tipoQuarto === 'FAMILIA' && (
            <div className="modal-form-grid">
              <Field label="Camas solteiro">
                <TextInput
                  value={editForm.famCamasSolteiro}
                  onChange={(e) => setEditForm({ ...editForm, famCamasSolteiro: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Camas casal (comum)">
                <TextInput
                  value={editForm.famCamaCasalComum}
                  onChange={(e) => setEditForm({ ...editForm, famCamaCasalComum: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Camas casal King/Queen">
                <TextInput
                  value={editForm.famCamaCasalGrande}
                  onChange={(e) => setEditForm({ ...editForm, famCamaCasalGrande: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Ambientes distintos" className="full" hint="Estudo, home office, etc.">
                <TextInput
                  value={editForm.famAmbientesDistintos}
                  onChange={(e) => setEditForm({ ...editForm, famAmbientesDistintos: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
            </div>
          )}
          <div className="stack" style={{ gap: '0.45rem' }}>
            <CheckboxField
              label="Ar-condicionado"
              checked={editForm.possuiArCondicionado}
              onChange={(checked) => setEditForm({ ...editForm, possuiArCondicionado: checked })}
            />
            <CheckboxField
              label="Hidromassagem"
              checked={editForm.possuiHidromassagem}
              onChange={(checked) => setEditForm({ ...editForm, possuiHidromassagem: checked })}
            />
            <CheckboxField label="Quarto ativo" checked={editForm.ativo} onChange={(checked) => setEditForm({ ...editForm, ativo: checked })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo quarto"
        description="Fotos opcionais. A primeira imagem vira a capa no catálogo. Formatos: JPEG, PNG, WebP ou GIF."
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={() => void criar()} disabled={!form.residenciaId}>
              Criar quarto
            </Button>
          </>
        }
      >
        <div className="stack" style={{ gap: '0.65rem' }}>
          <Field label="Residência" className="full">
            <SelectInput value={form.residenciaId} onChange={(e) => setForm({ ...form, residenciaId: e.target.value })}>
              <option value="">Selecione uma residência</option>
              {residencias.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.endereco}, {r.numero}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="modal-form-grid">
            <Field label="Tipo">
              <SelectInput value={form.tipoQuarto} onChange={(e) => setForm({ ...form, tipoQuarto: e.target.value })}>
                <option value="INDIVIDUAL">Individual</option>
                <option value="CASAL">Casal</option>
                <option value="FAMILIA">Família</option>
              </SelectInput>
            </Field>
            <Field label="Valor da diária (R$)">
              <TextInput
                value={form.valorBaseDiaria}
                onChange={(e) => setForm({ ...form, valorBaseDiaria: e.target.value })}
                inputMode="decimal"
              />
            </Field>
          </div>
          {form.tipoQuarto === 'INDIVIDUAL' && (
            <div className="modal-form-grid">
              <Field label="Camas (solteiro)">
                <TextInput
                  value={form.numCamasSolteiro}
                  onChange={(e) => setForm({ ...form, numCamasSolteiro: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Adicional R$/cama extra" hint="Além da primeira.">
                <TextInput
                  value={form.adicionalDiariaPorCamaExtra}
                  onChange={(e) => setForm({ ...form, adicionalDiariaPorCamaExtra: e.target.value })}
                  inputMode="decimal"
                />
              </Field>
            </div>
          )}
          {form.tipoQuarto === 'CASAL' && (
            <div className="stack" style={{ gap: '0.5rem' }}>
              <div className="modal-form-grid">
                <Field label="Cama" className="full">
                  <SelectInput
                    value={form.tipoCamaCasal}
                    onChange={(e) =>
                      setForm({ ...form, tipoCamaCasal: e.target.value as 'COMUM' | 'QUEEN_OU_KING' })
                    }
                  >
                    <option value="COMUM">Casal comum</option>
                    <option value="QUEEN_OU_KING">Queen / King</option>
                  </SelectInput>
                </Field>
                <Field label="Adic. conforto comum (R$)">
                  <TextInput
                    value={form.adicionalConfortoCamaComum}
                    onChange={(e) => setForm({ ...form, adicionalConfortoCamaComum: e.target.value })}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Adic. conforto Queen/King (R$)">
                  <TextInput
                    value={form.adicionalConfortoQueenKing}
                    onChange={(e) => setForm({ ...form, adicionalConfortoQueenKing: e.target.value })}
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Taxa berço (R$/dia)">
                  <TextInput
                    value={form.taxaDiariaBerco}
                    onChange={(e) => setForm({ ...form, taxaDiariaBerco: e.target.value })}
                    inputMode="decimal"
                  />
                </Field>
              </div>
              <CheckboxField
                label="Quarto pode oferecer berço (cliente opta no aluguel)"
                checked={form.permiteBerco}
                onChange={(checked) => setForm({ ...form, permiteBerco: checked })}
              />
            </div>
          )}
          {form.tipoQuarto === 'FAMILIA' && (
            <div className="modal-form-grid">
              <Field label="Camas solteiro">
                <TextInput
                  value={form.famCamasSolteiro}
                  onChange={(e) => setForm({ ...form, famCamasSolteiro: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Camas casal (comum)">
                <TextInput
                  value={form.famCamaCasalComum}
                  onChange={(e) => setForm({ ...form, famCamaCasalComum: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Camas casal King/Queen">
                <TextInput
                  value={form.famCamaCasalGrande}
                  onChange={(e) => setForm({ ...form, famCamaCasalGrande: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Ambientes distintos" className="full" hint="Ex.: estudo, home office.">
                <TextInput
                  value={form.famAmbientesDistintos}
                  onChange={(e) => setForm({ ...form, famAmbientesDistintos: e.target.value })}
                  inputMode="numeric"
                />
              </Field>
            </div>
          )}
          <div className="prop-fotos-bloco full">
            <p className="prop-fotos-eyebrow">Fotos do quarto</p>
            <p className="prop-fotos-sub">
              <strong>1 ou várias</strong> imagens. A <span className="prop-fotos-cap">1.ª = capa</span> (principal) no
              catálogo. Arraste para a área ou use o botão.
            </p>
            <input
              ref={fotosInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="visually-hidden"
              onChange={(e) => {
                adicionarFotosFicheiros(e.target.files)
                e.target.value = ''
              }}
            />
            <div
              className="prop-fotos-zona"
              role="presentation"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                adicionarFotosFicheiros(e.dataTransfer.files)
              }}
            >
              <div className="prop-fotos-zona__inner">
                <div className="prop-fotos-icos" aria-hidden>
                  <div className="prop-fotos-ico prop-fotos-ico--1">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <div className="prop-fotos-ico prop-fotos-ico--2">
                    <Upload className="h-4 w-4" />
                  </div>
                </div>
                <p className="prop-fotos-zona__title">Adicionar fotos</p>
                <p className="prop-fotos-zona__meta">JPG, PNG, WebP ou GIF · várias de uma vez</p>
                <div className="prop-fotos-zona__actions">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => fotosInputRef.current?.click()}
                    className="prop-fotos-browse"
                  >
                    <span className="prop-fotos-browse__inner">
                      <ImagePlus className="h-4 w-4" aria-hidden />
                      Escolher ficheiros
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            {fotosPendentes.length > 0 && (
              <ul className="prop-fotos-grid" aria-label="Pré-visualização, ordem = envio; primeira = capa">
                {fotosPendentes.map((f, i) => (
                  <li key={`${f.name}-${f.size}-${f.lastModified}-${i}`} className="prop-fotos-tile">
                    {i === 0 && <span className="prop-fotos-badge">Capa</span>}
                    <img
                      className="prop-fotos-tile__img"
                      src={urlPreviews[i] ?? undefined}
                      alt={f.name}
                      width={160}
                      height={120}
                    />
                    <div className="prop-fotos-tile__foot">
                      <span className="prop-fotos-tile__name" title={f.name}>
                        {f.name}
                      </span>
                      <button
                        type="button"
                        className="prop-fotos-tile__rm"
                        title="Remover desta lista"
                        aria-label={`Remover ${f.name}`}
                        onClick={() => setFotosPendentes((p) => p.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="stack" style={{ gap: '0.45rem' }}>
            <CheckboxField
              label="Ar-condicionado"
              checked={form.possuiArCondicionado}
              onChange={(checked) => setForm({ ...form, possuiArCondicionado: checked })}
            />
            <CheckboxField
              label="Hidromassagem"
              checked={form.possuiHidromassagem}
              onChange={(checked) => setForm({ ...form, possuiHidromassagem: checked })}
            />
            <CheckboxField label="Quarto ativo" checked={form.ativo} onChange={(checked) => setForm({ ...form, ativo: checked })} />
          </div>
        </div>
      </Modal>

      <PageHeader
        eyebrow="Proprietário"
        title="Meus quartos"
        actions={
          <>
            <Button type="button" variant="primary" onClick={() => openCreateModal()}>
              Novo quarto
            </Button>
            <Button variant="ghost" onClick={() => void load()}>
              Atualizar
            </Button>
          </>
        }
      />

      <PropFlowHint title="Checklist rápido">
        <ol className="prop-flow-hint__list">
          <li>
            Cadastre a residência em <Link to="/prop/residencias">Residências</Link>.
          </li>
          <li>A primeira foto do quarto vira capa no catálogo.</li>
        </ol>
      </PropFlowHint>

      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar quartos">
          {err}
        </InlineNotice>
      )}

      {loading ? (
        <LoadingState label="Carregando seus quartos…" />
      ) : meusQuartos.length > 0 ? (
        <div className="prop-quarto-grid">
          {meusQuartos.map((q) => {
            const imgs = q.imagens ?? []
            const capa = imgs[0]
            return (
              <article key={q.id} className="prop-quarto-card surface-card">
                <div className="prop-quarto-card__visual">
                  {capa ? (
                    <img src={capa.url} alt="" loading="lazy" />
                  ) : (
                    <div className="prop-quarto-card__visual--empty">Sem foto</div>
                  )}
                </div>
                <div className="prop-quarto-card__body">
                  <div className="prop-quarto-card__head">
                    <div style={{ minWidth: 0 }}>
                      <h3>{roomTypeLabel(q.tipoQuarto)}</h3>
                      <p className="prop-quarto-card__addr">
                        {q.residenciaEndereco}, {q.residenciaNumero}
                      </p>
                      <p className="muted small" style={{ margin: '0.15rem 0 0' }}>
                        #{q.id} · Residência #{q.residenciaId}
                      </p>
                    </div>
                    <div className="prop-quarto-card__actions">
                      <Link className="icon-btn" to={`/explorar/${q.id}`} title="Ver no catálogo" aria-label="Ver no catálogo">
                        <IconExternalLink />
                      </Link>
                      <button type="button" className="icon-btn" title="Editar quarto" aria-label="Editar quarto" onClick={() => openEditModal(q)}>
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        title="Excluir quarto"
                        aria-label="Excluir quarto"
                        onClick={() => void excluirQuarto(q.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div className="prop-quarto-card__meta">
                    <span className="prop-quarto-card__price mono">{formatMoney(q.valorBaseDiaria)}</span>
                    <StatusBadge tone={q.ativo ? 'success' : 'warning'}>{q.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                  </div>
                  <div className="prop-quarto-card__tags">
                    <span className="prop-quarto-card__tag">{q.possuiArCondicionado ? 'Ar' : 'Sem ar'}</span>
                    <span className="prop-quarto-card__tag">{q.possuiHidromassagem ? 'Hidro' : 'Sem hidro'}</span>
                  </div>
                  <div className="prop-quarto-card__fotos">
                    <div className="prop-quarto-card__thumb-row">
                      {imgs.map((im) => (
                        <div key={im.id} className="quarto-foto-thumb-wrap">
                          <img className="table-thumb" src={im.url} alt="" loading="lazy" />
                          <button
                            type="button"
                            className="quarto-foto-remove"
                            title="Remover imagem"
                            aria-label="Remover imagem"
                            onClick={() => void removerImagem(q.id, im.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <label className="icon-btn prop-quarto-card__foto-add" title="Adicionar fotos" aria-label="Adicionar fotos">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="visually-hidden"
                          onChange={(e) => {
                            void enviarImagens(q.id, e.target.files)
                            e.target.value = ''
                          }}
                        />
                        <IconPlus />
                      </label>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <SectionCard>
          <EmptyState title="Sem quartos" description="Cadastre um quarto." />
        </SectionCard>
      )}
    </div>
  )
}

export function PropReservasPage() {
  return <Navigate to="/prop/movimentacao?aba=reservas" replace />
}

export function PropAlugueisPage() {
  return <Navigate to="/prop/movimentacao?aba=alugueis" replace />
}

export function PropMovimentacaoPage() {
  const { confirm, toast } = useUi()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'alugueis' ? 'alugueis' : 'reservas'
  const [resRows, setResRows] = useState<Reserva[]>([])
  const [alRows, setAlRows] = useState<Aluguel[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [res, al] = await Promise.all([
        http.get<PageResponse<Reserva>>('/api/reservas?size=100').then((r) => r.data.content),
        http.get<PageResponse<Aluguel>>('/api/alugueis?size=100').then((r) => r.data.content),
      ])
      setResRows(res)
      setAlRows(al)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function setAba(next: 'reservas' | 'alugueis') {
    setParams(next === 'reservas' ? { aba: 'reservas' } : { aba: 'alugueis' })
  }

  async function cancelarAluguel(id: number) {
    const approved = await confirm({
      title: 'Cancelar aluguel?',
      description: 'Cancela o aluguel.',
      confirmLabel: 'Cancelar aluguel',
      cancelLabel: 'Voltar',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await http.post(`/api/alugueis/${id}/cancelar`)
      toast({
        kind: 'success',
        title: 'Aluguel cancelado',
        message: 'A estadia foi cancelada com sucesso.',
      })
      await load()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Não foi possível cancelar',
        message: getApiErrorMessage(error),
      })
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Proprietário"
        title="Reservas e aluguéis"
        description="Acompanhe pedidos e contratos no mesmo painel."
        actions={<Button variant="ghost" onClick={() => void load()}>Atualizar</Button>}
      />

      <div className="tabs-inline" role="tablist" aria-label="Movimentação" style={{ marginBottom: '0.85rem' }}>
        <button type="button" role="tab" className={aba === 'reservas' ? 'is-active' : ''} onClick={() => setAba('reservas')}>
          Reservas
        </button>
        <button type="button" role="tab" className={aba === 'alugueis' ? 'is-active' : ''} onClick={() => setAba('alugueis')}>
          Aluguéis
        </button>
      </div>

      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar">
          {err}
        </InlineNotice>
      )}

      {loading ? (
        <LoadingState label="Carregando…" />
      ) : aba === 'reservas' ? (
        resRows.length > 0 ? (
          <DataTable>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Quarto</th>
                    <th>Status</th>
                    <th>Período</th>
                  </tr>
                </thead>
                <tbody>
                  {resRows.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.clienteNome}</td>
                      <td>{roomTypeLabel(r.tipoQuarto)}</td>
                      <td>
                        <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
                      </td>
                      <td>
                        <div className="table-cell-stack">
                          <span>{formatDateTime(r.dataHoraEntrada)}</span>
                          <span className="muted small">{formatDateTime(r.dataHoraSaida)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataTable>
        ) : (
          <SectionCard>
            <EmptyState title="Nenhuma reserva encontrada" description="Vazio." />
          </SectionCard>
        )
      ) : alRows.length > 0 ? (
        <DataTable>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alRows.map((a) => (
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td>{a.clienteNome}</td>
                    <td>
                      <StatusBadge tone={statusTone(a.status)}>{a.status}</StatusBadge>
                    </td>
                    <td>{formatMoney(a.valorTotal)}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="btn link" to={`/recibo/${a.id}`}>
                          Abrir recibo
                        </Link>
                        {a.status === 'ATIVO' ? (
                          <Button type="button" variant="secondary" onClick={() => void cancelarAluguel(a.id)}>
                            Cancelar
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Nenhum aluguel encontrado" description="Vazio." />
        </SectionCard>
      )}
    </div>
  )
}

export function PropPerfilPage() {
  const { toast } = useUi()
  const [p, setP] = useState<Proprietario | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    void http
      .get<Proprietario>('/api/proprietarios/perfil')
      .then(({ data }) => {
        setP(data)
        setNome(data.nome)
        setTelefone(data.telefone)
        setEmail(data.email)
      })
      .catch((error) => setErr(getApiErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  async function salvar() {
    setSaving(true)
    setErr(null)
    try {
      await http.put('/api/proprietarios/perfil', { nome, telefone, email })
      toast({
        kind: 'success',
        title: 'Perfil atualizado',
        message: 'Seus dados foram salvos com sucesso.',
      })
      setEditOpen(false)
    } catch (error) {
      const message = getApiErrorMessage(error)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Não foi possível salvar',
        message,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Carregando seu perfil…" />
      </div>
    )
  }

  if (!p) {
    return (
      <div className="page">
        <InlineNotice tone="danger" title="Perfil indisponível">
          {err ?? 'Não foi possível carregar seus dados.'}
        </InlineNotice>
      </div>
    )
  }

  return (
    <div className="page compact">
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar perfil"
        description="Os dados seguem o endpoint de perfil do proprietário."
        size="md"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" loading={saving} onClick={() => void salvar()}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </>
        }
      >
        <div className="modal-form-grid">
          <Field label="Nome">
            <TextInput value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field label="Telefone">
            <TextInput value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Field>
          <Field label="E-mail" className="full">
            <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <PageHeader
        eyebrow="Proprietário"
        title="Meu perfil"
        actions={
          <Button type="button" variant="secondary" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
        }
      />
      {err && (
        <InlineNotice tone="danger" title="Falha ao salvar">
          {err}
        </InlineNotice>
      )}
      <SectionCard className="minimal-pad" title="Visão geral">
        <dl className="profile-summary">
          <div>
            <dt>Nome</dt>
            <dd>{nome}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{telefone || '-'}</dd>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <dt>E-mail</dt>
            <dd>{email}</dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  )
}

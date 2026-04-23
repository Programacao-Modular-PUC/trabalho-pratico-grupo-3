package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.QuartoCreateRequest;
import com.noairnobnb.dto.request.QuartoUpdateRequest;
import com.noairnobnb.dto.response.OcupacaoCalendarioResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.QuartoResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.QuartoMapper;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.ReservaStatus;
import com.noairnobnb.model.enums.TipoCamaCasal;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.service.pricing.QuartoCapacidadeHospedes;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.QuartoRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.repository.ResidenciaRepository;
import com.noairnobnb.service.QuartoImagemService;
import com.noairnobnb.service.QuartoService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuartoServiceImpl implements QuartoService {
  private static final List<AluguelStatus> ALUGUEL_OCUPA = List.of(AluguelStatus.ATIVO, AluguelStatus.FINALIZADO);

  private final QuartoRepository quartoRepository;
  private final ResidenciaRepository residenciaRepository;
  private final ProprietarioRepository proprietarioRepository;
  private final ReservaRepository reservaRepository;
  private final AluguelRepository aluguelRepository;
  private final QuartoMapper quartoMapper;
  private final QuartoImagemService quartoImagemService;

  public QuartoServiceImpl(
      QuartoRepository quartoRepository,
      ResidenciaRepository residenciaRepository,
      ProprietarioRepository proprietarioRepository,
      ReservaRepository reservaRepository,
      AluguelRepository aluguelRepository,
      QuartoMapper quartoMapper,
      QuartoImagemService quartoImagemService) {
    this.quartoRepository = quartoRepository;
    this.residenciaRepository = residenciaRepository;
    this.proprietarioRepository = proprietarioRepository;
    this.reservaRepository = reservaRepository;
    this.aluguelRepository = aluguelRepository;
    this.quartoMapper = quartoMapper;
    this.quartoImagemService = quartoImagemService;
  }

  @Override
  @Transactional
  public QuartoResponse criar(QuartoCreateRequest request) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    var residencia =
        residenciaRepository
            .findFetchedById(request.residenciaId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESIDENCIA_NAO_ENCONTRADA", "Residência não encontrada"));
    assertEscritaResidencia(residencia.getProprietario().getId());

    var q = new Quarto();
    q.setResidencia(residencia);
    aplicarCreate(q, request);
    quartoRepository.save(q);
    return quartoMapper.toResponse(quartoRepository.findFetchedById(q.getId()).orElse(q));
  }

  private void aplicarCreate(Quarto q, QuartoCreateRequest r) {
    q.setTipoQuarto(r.tipoQuarto());
    q.setValorBaseDiaria(r.valorBaseDiaria());
    q.setPossuiArCondicionado(r.possuiArCondicionado());
    q.setPossuiHidromassagem(r.possuiHidromassagem());
    q.setAtivo(r.ativo());
    q.setNumCamasSolteiro(r.numCamasSolteiro());
    q.setAdicionalDiariaPorCamaExtra(r.adicionalDiariaPorCamaExtra());
    q.setTipoCamaCasal(r.tipoCamaCasal());
    q.setPermiteBerco(r.permiteBerco());
    q.setTaxaDiariaBerco(r.taxaDiariaBerco());
    q.setAdicionalConfortoCamaComum(r.adicionalConfortoCamaComum());
    q.setAdicionalConfortoQueenKing(r.adicionalConfortoQueenKing());
    q.setFamCamasSolteiro(r.famCamasSolteiro());
    q.setFamCamaCasalComum(r.famCamaCasalComum());
    q.setFamCamaCasalGrande(r.famCamaCasalGrande());
    q.setFamAmbientesDistintos(r.famAmbientesDistintos());
    limparCamposDeOutrosTipos(q);
    assertConfiguracaoQuartoValida(q);
  }

  private void aplicarUpdate(Quarto q, QuartoUpdateRequest r) {
    q.setTipoQuarto(r.tipoQuarto());
    q.setValorBaseDiaria(r.valorBaseDiaria());
    q.setPossuiArCondicionado(r.possuiArCondicionado());
    q.setPossuiHidromassagem(r.possuiHidromassagem());
    q.setAtivo(r.ativo());
    q.setNumCamasSolteiro(r.numCamasSolteiro());
    q.setAdicionalDiariaPorCamaExtra(r.adicionalDiariaPorCamaExtra());
    q.setTipoCamaCasal(r.tipoCamaCasal());
    q.setPermiteBerco(r.permiteBerco());
    q.setTaxaDiariaBerco(r.taxaDiariaBerco());
    q.setAdicionalConfortoCamaComum(r.adicionalConfortoCamaComum());
    q.setAdicionalConfortoQueenKing(r.adicionalConfortoQueenKing());
    q.setFamCamasSolteiro(r.famCamasSolteiro());
    q.setFamCamaCasalComum(r.famCamaCasalComum());
    q.setFamCamaCasalGrande(r.famCamaCasalGrande());
    q.setFamAmbientesDistintos(r.famAmbientesDistintos());
    limparCamposDeOutrosTipos(q);
    assertConfiguracaoQuartoValida(q);
  }

  /** Não reaproveita campos de outro tipo de quarto após o proprietário trocar o tipo. */
  private void limparCamposDeOutrosTipos(Quarto q) {
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      q.setTipoCamaCasal(null);
      q.setPermiteBerco(null);
      q.setTaxaDiariaBerco(null);
      q.setAdicionalConfortoCamaComum(null);
      q.setAdicionalConfortoQueenKing(null);
      q.setFamCamasSolteiro(null);
      q.setFamCamaCasalComum(null);
      q.setFamCamaCasalGrande(null);
      q.setFamAmbientesDistintos(null);
    } else if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      q.setNumCamasSolteiro(null);
      q.setAdicionalDiariaPorCamaExtra(null);
      q.setFamCamasSolteiro(null);
      q.setFamCamaCasalComum(null);
      q.setFamCamaCasalGrande(null);
      q.setFamAmbientesDistintos(null);
    } else {
      q.setNumCamasSolteiro(null);
      q.setAdicionalDiariaPorCamaExtra(null);
      q.setTipoCamaCasal(null);
      q.setPermiteBerco(null);
      q.setTaxaDiariaBerco(null);
      q.setAdicionalConfortoCamaComum(null);
      q.setAdicionalConfortoQueenKing(null);
    }
  }

  private void assertConfiguracaoQuartoValida(Quarto q) {
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      if (q.getNumCamasSolteiro() != null && q.getNumCamasSolteiro() < 1) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "CAMAS_INVALIDAS", "Número de camas de solteiro inválido");
      }
      if (q.getAdicionalDiariaPorCamaExtra() != null
          && q.getAdicionalDiariaPorCamaExtra().compareTo(BigDecimal.ZERO) < 0) {
        throw new BusinessException(
            HttpStatus.BAD_REQUEST, "ADICIONAL_CAMA_INVALIDO", "Adicional por cama extra não pode ser negativo");
      }
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      if (q.getPermiteBerco() == null) {
        q.setPermiteBerco(false);
      }
    }
    if (q.getTipoQuarto() == TipoQuarto.FAMILIA) {
      if (QuartoCapacidadeHospedes.capacidadeFamilia(q) < 1) {
        throw new BusinessException(
            HttpStatus.BAD_REQUEST,
            "FAMILIA_SEM_CAMAS",
            "Informe ao menos camas (solteiro, casal ou casal King/Queen) para compor a capacidade do quarto família.");
      }
      if (q.getFamAmbientesDistintos() != null && q.getFamAmbientesDistintos() < 0) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "AMBIENTES_INVALIDOS", "Quantidade de ambientes não pode ser negativa");
      }
    } else {
      if (q.getTipoQuarto() == TipoQuarto.CASAL
          && q.getTipoCamaCasal() == null) {
        q.setTipoCamaCasal(TipoCamaCasal.COMUM);
      }
    }
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<QuartoResponse> listar(
      Pageable pageable,
      Long residenciaId,
      TipoQuarto tipo,
      Boolean possuiArCondicionado,
      Boolean possuiHidromassagem,
      LocalDateTime disponivelDe,
      LocalDateTime disponivelAte) {
    if (!SecurityUtils.isAuthenticated()) {
      var page =
          disponivelDe != null && disponivelAte != null
              ? quartoRepository.findCatalogoDisponivelEntre(
                  residenciaId,
                  tipo,
                  possuiArCondicionado,
                  possuiHidromassagem,
                  null,
                  Boolean.TRUE,
                  disponivelDe,
                  disponivelAte,
                  ReservaStatus.ATIVA,
                  ALUGUEL_OCUPA,
                  pageable)
              : quartoRepository.findCatalogo(
                  residenciaId, tipo, possuiArCondicionado, possuiHidromassagem, null, Boolean.TRUE, pageable);
      return PageUtils.map(page, quartoMapper::toResponse);
    }
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO", "CLIENTE");
    Long proprietarioFiltro = null;
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      proprietarioFiltro = prop.getId();
    }
    boolean somenteAtivos = SecurityUtils.hasAny("CLIENTE");

    Page<Quarto> page;
    if (disponivelDe != null && disponivelAte != null) {
      page =
          quartoRepository.findCatalogoDisponivelEntre(
              residenciaId,
              tipo,
              possuiArCondicionado,
              possuiHidromassagem,
              proprietarioFiltro,
              somenteAtivos ? Boolean.TRUE : null,
              disponivelDe,
              disponivelAte,
              ReservaStatus.ATIVA,
              ALUGUEL_OCUPA,
              pageable);
    } else {
      page =
          quartoRepository.findCatalogo(
              residenciaId,
              tipo,
              possuiArCondicionado,
              possuiHidromassagem,
              proprietarioFiltro,
              somenteAtivos ? Boolean.TRUE : null,
              pageable);
    }
    return PageUtils.map(page, quartoMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public QuartoResponse buscarPorId(Long id) {
    var q =
        quartoRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    if (!SecurityUtils.isAuthenticated() && !q.isAtivo()) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado");
    }
    return quartoMapper.toResponse(q);
  }

  @Override
  @Transactional
  public QuartoResponse atualizar(Long id, QuartoUpdateRequest request) {
    var q =
        quartoRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    assertEscritaResidencia(q.getResidencia().getProprietario().getId());
    aplicarUpdate(q, request);
    quartoRepository.save(q);
    return quartoMapper.toResponse(quartoRepository.findFetchedById(id).orElse(q));
  }

  @Override
  @Transactional
  public void excluir(Long id) {
    var q =
        quartoRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    assertEscritaResidencia(q.getResidencia().getProprietario().getId());
    if (reservaRepository.existsByQuarto_Id(id) || aluguelRepository.existsByQuarto_Id(id)) {
      throw new BusinessException(HttpStatus.CONFLICT, "QUARTO_EM_USO", "Quarto possui reservas ou aluguéis vinculados");
    }
    quartoImagemService.removerTodasDoQuarto(id);
    quartoRepository.delete(q);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<QuartoResponse> listarPorResidencia(Long residenciaId, Pageable pageable) {
    if (!SecurityUtils.isAuthenticated()) {
      var page =
          quartoRepository.findCatalogo(residenciaId, null, null, null, null, Boolean.TRUE, pageable);
      return PageUtils.map(page, quartoMapper::toResponse);
    }
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO", "CLIENTE");
    var res =
        residenciaRepository
            .findFetchedById(residenciaId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESIDENCIA_NAO_ENCONTRADA", "Residência não encontrada"));
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!res.getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    boolean somenteAtivos = SecurityUtils.hasAny("CLIENTE");
    var page =
        quartoRepository.findCatalogo(
            residenciaId,
            null,
            null,
            null,
            null,
            somenteAtivos ? Boolean.TRUE : null,
            pageable);
    return PageUtils.map(page, quartoMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public OcupacaoCalendarioResponse ocupacaoCalendario(Long quartoId) {
    if (!quartoRepository.existsById(quartoId)) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado");
    }
    var dias = new TreeSet<LocalDate>();
    for (var row : reservaRepository.findIntervalosEntradaSaidaPorQuartoEStatus(quartoId, ReservaStatus.ATIVA)) {
      expandirDiasEntre(dias, (LocalDateTime) row[0], (LocalDateTime) row[1]);
    }
    for (var row :
        aluguelRepository.findIntervalosEntradaSaidaPorQuartoEStatusIn(
            quartoId, List.of(AluguelStatus.ATIVO, AluguelStatus.FINALIZADO))) {
      expandirDiasEntre(dias, (LocalDateTime) row[0], (LocalDateTime) row[1]);
    }
    return new OcupacaoCalendarioResponse(new ArrayList<>(dias));
  }

  private static void expandirDiasEntre(TreeSet<LocalDate> dias, LocalDateTime inicio, LocalDateTime fim) {
    if (inicio == null || fim == null || !fim.isAfter(inicio)) {
      return;
    }
    var d = inicio.toLocalDate();
    var fimDia = fim.toLocalDate();
    while (d.isBefore(fimDia)) {
      dias.add(d);
      d = d.plusDays(1);
    }
  }

  private void assertEscritaResidencia(Long proprietarioIdDaResidencia) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return;
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!proprietarioIdDaResidencia.equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return;
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }
}

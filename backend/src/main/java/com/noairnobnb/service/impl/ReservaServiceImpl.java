package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.ReservaCreateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ReservaResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.ReservaMapper;
import com.noairnobnb.model.entity.Reserva;
import com.noairnobnb.model.enums.ReservaStatus;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.QuartoRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.service.DisponibilidadeService;
import com.noairnobnb.service.DailyCalculatorService;
import com.noairnobnb.service.HospedagemCotacaoFactory;
import com.noairnobnb.service.HospedagemValorService;
import com.noairnobnb.service.ReservaService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaServiceImpl implements ReservaService {

  /** Mesma referência que o utilizador vê no <input type="datetime-local"> em pt-BR (horário de Brasília). */
  private static final ZoneId FUSO_NEGOCIO = ZoneId.of("America/Sao_Paulo");
  private final ClienteRepository clienteRepository;
  private final ProprietarioRepository proprietarioRepository;
  private final QuartoRepository quartoRepository;
  private final ReservaRepository reservaRepository;
  private final DisponibilidadeService disponibilidadeService;
  private final DailyCalculatorService dailyCalculatorService;
  private final HospedagemValorService hospedagemValorService;
  private final HospedagemCotacaoFactory hospedagemCotacaoFactory;
  private final ReservaMapper reservaMapper;

  public ReservaServiceImpl(
      ClienteRepository clienteRepository,
      ProprietarioRepository proprietarioRepository,
      QuartoRepository quartoRepository,
      ReservaRepository reservaRepository,
      DisponibilidadeService disponibilidadeService,
      DailyCalculatorService dailyCalculatorService,
      HospedagemValorService hospedagemValorService,
      HospedagemCotacaoFactory hospedagemCotacaoFactory,
      ReservaMapper reservaMapper) {
    this.clienteRepository = clienteRepository;
    this.proprietarioRepository = proprietarioRepository;
    this.quartoRepository = quartoRepository;
    this.reservaRepository = reservaRepository;
    this.disponibilidadeService = disponibilidadeService;
    this.dailyCalculatorService = dailyCalculatorService;
    this.hospedagemValorService = hospedagemValorService;
    this.hospedagemCotacaoFactory = hospedagemCotacaoFactory;
    this.reservaMapper = reservaMapper;
  }

  @Override
  @Transactional
  public ReservaResponse criarParaClienteLogado(ReservaCreateRequest request) {
    var principal = SecurityUtils.requireUser();
    var cliente =
        clienteRepository
            .findByUsuarioId(principal.getUserId())
            .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));

    var quarto =
        quartoRepository
            .findFetchedById(request.quartoId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    if (!quarto.isAtivo()) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "QUARTO_INATIVO", "Quarto inativo");
    }

    var agora = LocalDateTime.now(FUSO_NEGOCIO);
    if (!request.dataHoraEntrada().isAfter(agora)) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "RESERVA_DEVE_SER_FUTURA", "A entrada deve ser no futuro (horário de Brasília).");
    }
    if (!request.dataHoraSaida().isAfter(request.dataHoraEntrada())) {
      throw new BusinessException(
          HttpStatus.BAD_REQUEST, "PERIODO_INVALIDO", "dataHoraSaida deve ser posterior a dataHoraEntrada");
    }

    disponibilidadeService.assertPeriodoLivreParaReserva(
        quarto.getId(), request.dataHoraEntrada(), request.dataHoraSaida(), null);

    var diarias = dailyCalculatorService.calcularNumeroDiarias(request.dataHoraEntrada(), request.dataHoraSaida());
    var cot =
        hospedagemCotacaoFactory.criar(
            quarto, request.numeroHospedes(), request.solicitaBerco());
    var valorPrevisto = hospedagemValorService.calcularValorTotal(quarto, diarias, cot);

    var reserva = new Reserva();
    reserva.setCliente(cliente);
    reserva.setQuarto(quarto);
    reserva.setDataHoraEntrada(request.dataHoraEntrada());
    reserva.setDataHoraSaida(request.dataHoraSaida());
    reserva.setStatus(ReservaStatus.ATIVA);
    reserva.setValorPrevisto(valorPrevisto);
if (quarto.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
    reserva.setNumeroHospedes(null);
    if (Boolean.TRUE.equals(cot.solicitaBerco())) {
        throw new BusinessException(
            HttpStatus.BAD_REQUEST,
            "BERCO_NAO_PERMITIDO",
            "Quarto individual não permite berço");
    }
    reserva.setSolicitaBerco(false);
} else {
    reserva.setNumeroHospedes(cot.numeroHospedes());
    reserva.setSolicitaBerco(cot.solicitaBerco());
}
    reservaRepository.save(reserva);

    var saved = reservaRepository.findFetchedById(reserva.getId()).orElse(reserva);
    return reservaMapper.toResponse(saved);
  }

  @Override
  @Transactional
  public ReservaResponse cancelar(Long reservaId) {
    var principal = SecurityUtils.requireUser();
    var cliente =
        clienteRepository
            .findByUsuarioId(principal.getUserId())
            .orElse(null);

    var reserva =
        reservaRepository
            .findFetchedById(reservaId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESERVA_NAO_ENCONTRADA", "Reserva não encontrada"));

    if (SecurityUtils.hasAny("ADMIN")) {
      // admin pode cancelar qualquer reserva ativa
    } else {
      if (cliente == null || !reserva.getCliente().getId().equals(cliente.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "RESERVA_NAO_PERTENCE", "Reserva não pertence ao cliente");
      }
    }
    if (reserva.getStatus() != ReservaStatus.ATIVA) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "RESERVA_NAO_ATIVA", "Reserva não está ativa");
    }

    reserva.setStatus(ReservaStatus.CANCELADA);
    reservaRepository.save(reserva);

    var saved = reservaRepository.findFetchedById(reserva.getId()).orElse(reserva);
    return reservaMapper.toResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ReservaResponse> listar(Pageable pageable) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return PageUtils.map(reservaRepository.findAllFetched(pageable), reservaMapper::toResponse);
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      return PageUtils.map(
          reservaRepository.findAllFetchedByProprietarioId(prop.getId(), pageable), reservaMapper::toResponse);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      return PageUtils.map(reservaRepository.findAllFetchedByClienteId(cliente.getId(), pageable), reservaMapper::toResponse);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  @Override
  @Transactional(readOnly = true)
  public ReservaResponse buscarPorId(Long id) {
    var reserva =
        reservaRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESERVA_NAO_ENCONTRADA", "Reserva não encontrada"));

    if (SecurityUtils.hasAny("ADMIN")) {
      return reservaMapper.toResponse(reserva);
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!reserva.getQuarto().getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return reservaMapper.toResponse(reserva);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!reserva.getCliente().getId().equals(cliente.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return reservaMapper.toResponse(reserva);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ReservaResponse> listarPorCliente(Long clienteId, Pageable pageable) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO", "CLIENTE");
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var me =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!me.getId().equals(clienteId)) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    return PageUtils.map(reservaRepository.findAllFetchedByClienteId(clienteId, pageable), reservaMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ReservaResponse> listarPorQuarto(Long quartoId, Pageable pageable) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO", "CLIENTE");
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      var quarto =
          quartoRepository
              .findFetchedById(quartoId)
              .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
      if (!quarto.getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    return PageUtils.map(reservaRepository.findAllFetchedByQuartoId(quartoId, pageable), reservaMapper::toResponse);
  }
}

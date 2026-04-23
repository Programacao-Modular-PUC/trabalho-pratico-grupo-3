package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.AluguelCreateAdminRequest;
import com.noairnobnb.dto.request.AluguelCreateClienteRequest;
import com.noairnobnb.dto.request.AluguelFinalizarRequest;
import com.noairnobnb.dto.response.AluguelResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.AluguelMapper;
import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Aluguel;
import com.noairnobnb.model.entity.Cliente;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.PagamentoRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.QuartoRepository;
import com.noairnobnb.service.AluguelService;
import com.noairnobnb.service.DailyCalculatorService;
import com.noairnobnb.service.DisponibilidadeService;
import com.noairnobnb.service.HospedagemCotacaoFactory;
import com.noairnobnb.service.HospedagemValorService;
import com.noairnobnb.service.PagamentoService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AluguelServiceImpl implements AluguelService {
  private final ClienteRepository clienteRepository;
  private final ProprietarioRepository proprietarioRepository;
  private final QuartoRepository quartoRepository;
  private final AluguelRepository aluguelRepository;
  private final PagamentoRepository pagamentoRepository;
  private final DisponibilidadeService disponibilidadeService;
  private final DailyCalculatorService dailyCalculatorService;
  private final HospedagemValorService hospedagemValorService;
  private final HospedagemCotacaoFactory hospedagemCotacaoFactory;
  private final PagamentoService pagamentoService;
  private final AluguelMapper aluguelMapper;

  public AluguelServiceImpl(
      ClienteRepository clienteRepository,
      ProprietarioRepository proprietarioRepository,
      QuartoRepository quartoRepository,
      AluguelRepository aluguelRepository,
      PagamentoRepository pagamentoRepository,
      DisponibilidadeService disponibilidadeService,
      DailyCalculatorService dailyCalculatorService,
      HospedagemValorService hospedagemValorService,
      HospedagemCotacaoFactory hospedagemCotacaoFactory,
      PagamentoService pagamentoService,
      AluguelMapper aluguelMapper) {
    this.clienteRepository = clienteRepository;
    this.proprietarioRepository = proprietarioRepository;
    this.quartoRepository = quartoRepository;
    this.aluguelRepository = aluguelRepository;
    this.pagamentoRepository = pagamentoRepository;
    this.disponibilidadeService = disponibilidadeService;
    this.dailyCalculatorService = dailyCalculatorService;
    this.hospedagemValorService = hospedagemValorService;
    this.hospedagemCotacaoFactory = hospedagemCotacaoFactory;
    this.pagamentoService = pagamentoService;
    this.aluguelMapper = aluguelMapper;
  }

  @Override
  @Transactional
  public AluguelResponse criarParaClienteLogado(AluguelCreateClienteRequest request) {
    var principal = SecurityUtils.requireUser();
    var cliente =
        clienteRepository
            .findByUsuarioId(principal.getUserId())
            .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));

    var quarto =
        quartoRepository
            .findFetchedById(request.quartoId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    var cot =
        hospedagemCotacaoFactory.criar(
            quarto, request.numeroHospedes(), request.solicitaBerco());
    return criarInterno(cliente, quarto, request.dataHoraEntrada(), request.dataHoraSaida(), cot);
  }

  @Override
  @Transactional
  public AluguelResponse criarAdmin(AluguelCreateAdminRequest request) {
    SecurityUtils.requireAny("ADMIN");
    var cliente =
        clienteRepository
            .findById(request.clienteId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
    var quarto =
        quartoRepository
            .findFetchedById(request.quartoId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    var cot =
        hospedagemCotacaoFactory.criar(
            quarto, request.numeroHospedes(), request.solicitaBerco());
    return criarInterno(cliente, quarto, request.dataHoraEntrada(), request.dataHoraSaida(), cot);
  }

  @Override
  @Transactional
  public AluguelResponse finalizar(Long aluguelId, AluguelFinalizarRequest request) {
    var aluguel =
        aluguelRepository
            .findFetchedById(aluguelId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ALUGUEL_NAO_ENCONTRADO", "Aluguel não encontrado"));

    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!aluguel.getCliente().getId().equals(cliente.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ALUGUEL_NAO_PERTENCE", "Aluguel não pertence ao cliente");
      }
    } else if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!aluguel.getQuarto().getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    } else if (!SecurityUtils.hasAny("ADMIN")) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
    }
    if (aluguel.getStatus() != AluguelStatus.ATIVO) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "ALUGUEL_NAO_ATIVO", "Aluguel não está ativo");
    }

    if (!request.dataHoraSaida().isAfter(aluguel.getDataHoraEntrada())) {
      throw new BusinessException(
          HttpStatus.BAD_REQUEST, "SAIDA_INVALIDA", "dataHoraSaida deve ser posterior à dataHoraEntrada do aluguel");
    }

    disponibilidadeService.assertPeriodoLivreParaAluguel(
        aluguel.getQuarto().getId(), aluguel.getDataHoraEntrada(), request.dataHoraSaida(), aluguel.getId());

    aluguel.setDataHoraSaida(request.dataHoraSaida());
    var diarias = dailyCalculatorService.calcularNumeroDiarias(aluguel.getDataHoraEntrada(), aluguel.getDataHoraSaida());
    var cot =
        hospedagemCotacaoFactory.paraAluguelExistente(
            aluguel.getQuarto(), aluguel.getNumeroHospedes(), aluguel.isSolicitaBerco());
    var valorTotal = hospedagemValorService.calcularValorTotal(aluguel.getQuarto(), diarias, cot);
    aluguel.setNumeroDiarias(diarias);
    aluguel.setValorTotal(valorTotal);
    aluguel.setStatus(AluguelStatus.FINALIZADO);
    aluguelRepository.save(aluguel);

    var pagamentoOpt = pagamentoRepository.findByAluguelId(aluguel.getId());
    if (pagamentoOpt.isPresent()) {
      var p = pagamentoOpt.get();
      p.setValor(valorTotal);
      pagamentoRepository.save(p);
    }

    var saved = aluguelRepository.findFetchedById(aluguel.getId()).orElse(aluguel);
    return aluguelMapper.toResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<AluguelResponse> listar(Pageable pageable) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return PageUtils.map(aluguelRepository.findAllFetched(pageable), aluguelMapper::toResponse);
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      return PageUtils.map(
          aluguelRepository.findAllFetchedByProprietarioId(prop.getId(), pageable), aluguelMapper::toResponse);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      return PageUtils.map(aluguelRepository.findAllFetchedByClienteId(cliente.getId(), pageable), aluguelMapper::toResponse);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  @Override
  @Transactional(readOnly = true)
  public AluguelResponse buscarPorId(Long id) {
    var aluguel =
        aluguelRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ALUGUEL_NAO_ENCONTRADO", "Aluguel não encontrado"));
    if (SecurityUtils.hasAny("ADMIN")) {
      return aluguelMapper.toResponse(aluguel);
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!aluguel.getQuarto().getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return aluguelMapper.toResponse(aluguel);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!aluguel.getCliente().getId().equals(cliente.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return aluguelMapper.toResponse(aluguel);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<AluguelResponse> listarPorCliente(Long clienteId, Pageable pageable) {
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
    return PageUtils.map(aluguelRepository.findAllFetchedByClienteId(clienteId, pageable), aluguelMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<AluguelResponse> listarPorQuarto(Long quartoId, Pageable pageable) {
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
    return PageUtils.map(aluguelRepository.findAllFetchedByQuartoId(quartoId, pageable), aluguelMapper::toResponse);
  }

  private AluguelResponse criarInterno(
      Cliente cliente, Quarto quarto, LocalDateTime entrada, LocalDateTime saida, HospedagemCotacao cotacao) {
    if (!quarto.isAtivo()) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "QUARTO_INATIVO", "Quarto inativo");
    }

    disponibilidadeService.assertPeriodoLivreParaAluguel(quarto.getId(), entrada, saida, null);

    var diarias = dailyCalculatorService.calcularNumeroDiarias(entrada, saida);
    var valorTotal = hospedagemValorService.calcularValorTotal(quarto, diarias, cotacao);

    var aluguel = new Aluguel();
    aluguel.setCliente(cliente);
    aluguel.setQuarto(quarto);
    aluguel.setDataHoraEntrada(entrada);
    aluguel.setDataHoraSaida(saida);
    aluguel.setNumeroDiarias(diarias);
    aluguel.setValorTotal(valorTotal);
    aluguel.setStatus(AluguelStatus.ATIVO);
    if (quarto.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      aluguel.setNumeroHospedes(null);
    } else {
      aluguel.setNumeroHospedes(cotacao.numeroHospedes());
    }
    aluguel.setSolicitaBerco(cotacao.solicitaBerco());
    aluguelRepository.save(aluguel);

    var pagamento = pagamentoService.criarPendenteParaAluguel(aluguel, FormaPagamento.PIX);
    aluguel.setPagamento(pagamento);

    var saved = aluguelRepository.findFetchedById(aluguel.getId()).orElse(aluguel);
    return aluguelMapper.toResponse(saved);
  }
}

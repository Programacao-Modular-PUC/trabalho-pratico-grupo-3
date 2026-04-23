package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.PagamentoUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.PagamentoResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.PagamentoMapper;
import com.noairnobnb.model.entity.Aluguel;
import com.noairnobnb.model.entity.Pagamento;
import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.PagamentoStatus;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.PagamentoRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.service.PagamentoService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagamentoServiceImpl implements PagamentoService {
  private final PagamentoRepository pagamentoRepository;
  private final PagamentoMapper pagamentoMapper;
  private final ProprietarioRepository proprietarioRepository;
  private final ClienteRepository clienteRepository;

  public PagamentoServiceImpl(
      PagamentoRepository pagamentoRepository,
      PagamentoMapper pagamentoMapper,
      ProprietarioRepository proprietarioRepository,
      ClienteRepository clienteRepository) {
    this.pagamentoRepository = pagamentoRepository;
    this.pagamentoMapper = pagamentoMapper;
    this.proprietarioRepository = proprietarioRepository;
    this.clienteRepository = clienteRepository;
  }

  @Override
  @Transactional
  public Pagamento criarPendenteParaAluguel(Aluguel aluguel, FormaPagamento formaPagamentoPadrao) {
    if (aluguel.getId() == null) {
      throw new IllegalStateException("Aluguel precisa estar persistido antes de criar pagamento");
    }
    if (pagamentoRepository.findByAluguelId(aluguel.getId()).isPresent()) {
      throw new BusinessException(HttpStatus.CONFLICT, "PAGAMENTO_JA_EXISTE", "Pagamento já existe para este aluguel");
    }

    var pagamento = new Pagamento();
    pagamento.setAluguel(aluguel);
    pagamento.setValor(aluguel.getValorTotal());
    pagamento.setStatus(PagamentoStatus.PENDENTE);
    pagamento.setFormaPagamento(formaPagamentoPadrao == null ? FormaPagamento.PIX : formaPagamentoPadrao);
    pagamento.setDataPagamento(null);
    return pagamentoRepository.save(pagamento);
  }

  @Override
  @Transactional
  public PagamentoResponse atualizar(Long pagamentoId, PagamentoUpdateRequest request) {
    var pagamento =
        pagamentoRepository
            .findFetchedById(pagamentoId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PAGAMENTO_NAO_ENCONTRADO", "Pagamento não encontrado"));
    assertAcessoPagamento(pagamento);

    pagamento.setStatus(request.status());
    pagamento.setFormaPagamento(request.formaPagamento());
    if (request.status() == PagamentoStatus.PAGO) {
      pagamento.setDataPagamento(java.time.LocalDateTime.now());
    } else if (request.status() == PagamentoStatus.PENDENTE) {
      pagamento.setDataPagamento(null);
    }

    pagamentoRepository.save(pagamento);
    var saved = pagamentoRepository.findFetchedById(pagamentoId).orElse(pagamento);
    return pagamentoMapper.toResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PagamentoResponse buscarPorId(Long id) {
    var pagamento =
        pagamentoRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PAGAMENTO_NAO_ENCONTRADO", "Pagamento não encontrado"));
    assertAcessoPagamento(pagamento);
    return pagamentoMapper.toResponse(pagamento);
  }

  @Override
  @Transactional(readOnly = true)
  public PagamentoResponse buscarPorAluguelId(Long aluguelId) {
    var pagamento =
        pagamentoRepository
            .findFetchedByAluguelId(aluguelId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PAGAMENTO_NAO_ENCONTRADO", "Pagamento não encontrado"));
    assertAcessoPagamento(pagamento);
    return pagamentoMapper.toResponse(pagamento);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<PagamentoResponse> listar(Pageable pageable) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return PageUtils.map(pagamentoRepository.findAllFetched(pageable), pagamentoMapper::toResponse);
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      return PageUtils.map(
          pagamentoRepository.findAllFetchedByProprietarioId(prop.getId(), pageable), pagamentoMapper::toResponse);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      return PageUtils.map(pagamentoRepository.findAllFetchedByClienteId(cliente.getId(), pageable), pagamentoMapper::toResponse);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  private void assertAcessoPagamento(Pagamento pagamento) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return;
    }
    var principal = SecurityUtils.requireUser();
    if (SecurityUtils.hasAny("CLIENTE")) {
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!pagamento.getAluguel().getCliente().getId().equals(cliente.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return;
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!pagamento.getAluguel().getQuarto().getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return;
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }
}

package com.noairnobnb.service.impl;

import com.noairnobnb.dto.response.ReciboResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.service.ReciboService;
import com.noairnobnb.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReciboServiceImpl implements ReciboService {
  private final AluguelRepository aluguelRepository;
  private final ClienteRepository clienteRepository;
  private final ProprietarioRepository proprietarioRepository;

  public ReciboServiceImpl(
      AluguelRepository aluguelRepository,
      ClienteRepository clienteRepository,
      ProprietarioRepository proprietarioRepository) {
    this.aluguelRepository = aluguelRepository;
    this.clienteRepository = clienteRepository;
    this.proprietarioRepository = proprietarioRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public ReciboResponse gerarPorAluguelId(Long aluguelId) {
    var principal = SecurityUtils.requireUser();
    var aluguel =
        aluguelRepository
            .findFetchedById(aluguelId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ALUGUEL_NAO_ENCONTRADO", "Aluguel não encontrado"));

    if (SecurityUtils.hasAny("ADMIN")) {
      // ok
    } else if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!aluguel.getQuarto().getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    } else if (SecurityUtils.hasAny("CLIENTE")) {
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!aluguel.getCliente().getId().equals(cliente.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ALUGUEL_NAO_PERTENCE", "Aluguel não pertence ao cliente");
      }
    } else {
      throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
    }

    var pagamento = aluguel.getPagamento();
    if (pagamento == null) {
      throw new BusinessException(HttpStatus.CONFLICT, "PAGAMENTO_AUSENTE", "Pagamento não encontrado para o aluguel");
    }

    var res = aluguel.getQuarto().getResidencia();
    return new ReciboResponse(
        aluguel.getId(),
        aluguel.getDataHoraEntrada(),
        aluguel.getDataHoraSaida(),
        aluguel.getNumeroDiarias(),
        aluguel.getNumeroHospedes(),
        aluguel.isSolicitaBerco(),
        aluguel.getValorTotal(),
        aluguel.getCliente().getId(),
        aluguel.getCliente().getNome(),
        aluguel.getCliente().getEmail(),
        aluguel.getQuarto().getId(),
        aluguel.getQuarto().getTipoQuarto(),
        aluguel.getQuarto().isPossuiArCondicionado(),
        aluguel.getQuarto().isPossuiHidromassagem(),
        res.getId(),
        res.getEndereco(),
        res.getNumero(),
        res.getBairro(),
        res.getCep(),
        pagamento.getId(),
        pagamento.getValor(),
        pagamento.getStatus(),
        pagamento.getFormaPagamento());
  }
}

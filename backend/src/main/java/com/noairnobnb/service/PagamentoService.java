package com.noairnobnb.service;

import com.noairnobnb.dto.request.PagamentoUpdateRequest;
import com.noairnobnb.dto.response.PagamentoResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.model.entity.Aluguel;
import com.noairnobnb.model.entity.Pagamento;
import com.noairnobnb.model.enums.FormaPagamento;
import org.springframework.data.domain.Pageable;

public interface PagamentoService {
  Pagamento criarPendenteParaAluguel(Aluguel aluguel, FormaPagamento formaPagamentoPadrao);

  PagamentoResponse atualizar(Long pagamentoId, PagamentoUpdateRequest request);

  PagamentoResponse buscarPorId(Long id);

  PagamentoResponse buscarPorAluguelId(Long aluguelId);

  PageResponse<PagamentoResponse> listar(Pageable pageable);
}

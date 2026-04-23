package com.noairnobnb.service;

import com.noairnobnb.dto.request.ReservaCreateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ReservaResponse;
import org.springframework.data.domain.Pageable;

public interface ReservaService {
  ReservaResponse criarParaClienteLogado(ReservaCreateRequest request);

  ReservaResponse cancelar(Long reservaId);

  PageResponse<ReservaResponse> listar(Pageable pageable);

  ReservaResponse buscarPorId(Long id);

  PageResponse<ReservaResponse> listarPorCliente(Long clienteId, Pageable pageable);

  PageResponse<ReservaResponse> listarPorQuarto(Long quartoId, Pageable pageable);
}

package com.noairnobnb.service;

import com.noairnobnb.dto.request.AluguelCreateAdminRequest;
import com.noairnobnb.dto.request.AluguelCreateClienteRequest;
import com.noairnobnb.dto.request.AluguelFinalizarRequest;
import com.noairnobnb.dto.response.AluguelResponse;
import com.noairnobnb.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AluguelService {
  AluguelResponse criarParaClienteLogado(AluguelCreateClienteRequest request);

  AluguelResponse criarAdmin(AluguelCreateAdminRequest request);

  AluguelResponse finalizar(Long aluguelId, AluguelFinalizarRequest request);

  AluguelResponse cancelar(Long aluguelId);

  PageResponse<AluguelResponse> listar(Pageable pageable);

  AluguelResponse buscarPorId(Long id);

  PageResponse<AluguelResponse> listarPorCliente(Long clienteId, Pageable pageable);

  PageResponse<AluguelResponse> listarPorQuarto(Long quartoId, Pageable pageable);
}

package com.noairnobnb.service;

import com.noairnobnb.dto.request.ClienteUpdateRequest;
import com.noairnobnb.dto.response.ClienteResponse;
import com.noairnobnb.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ClienteService {
  PageResponse<ClienteResponse> listar(Pageable pageable);

  ClienteResponse buscarPorId(Long id);

  ClienteResponse perfilClienteAutenticado();

  ClienteResponse atualizar(Long id, ClienteUpdateRequest request);

  void excluir(Long id);
}

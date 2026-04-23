package com.noairnobnb.service;

import com.noairnobnb.dto.request.ResidenciaCreateRequest;
import com.noairnobnb.dto.request.ResidenciaUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ResidenciaResponse;
import org.springframework.data.domain.Pageable;

public interface ResidenciaService {
  ResidenciaResponse criar(ResidenciaCreateRequest request);

  PageResponse<ResidenciaResponse> listar(Pageable pageable);

  ResidenciaResponse buscarPorId(Long id);

  ResidenciaResponse atualizar(Long id, ResidenciaUpdateRequest request);

  void excluir(Long id);

  PageResponse<ResidenciaResponse> listarPorProprietario(Long proprietarioId, Pageable pageable);
}

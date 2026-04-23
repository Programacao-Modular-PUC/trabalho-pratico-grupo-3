package com.noairnobnb.service;

import com.noairnobnb.dto.request.QuartoCreateRequest;
import com.noairnobnb.dto.request.QuartoUpdateRequest;
import com.noairnobnb.dto.response.OcupacaoCalendarioResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.QuartoResponse;
import com.noairnobnb.model.enums.TipoQuarto;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;

public interface QuartoService {
  QuartoResponse criar(QuartoCreateRequest request);

  PageResponse<QuartoResponse> listar(
      Pageable pageable,
      Long residenciaId,
      TipoQuarto tipo,
      Boolean possuiArCondicionado,
      Boolean possuiHidromassagem,
      LocalDateTime disponivelDe,
      LocalDateTime disponivelAte);

  QuartoResponse buscarPorId(Long id);

  QuartoResponse atualizar(Long id, QuartoUpdateRequest request);

  void excluir(Long id);

  PageResponse<QuartoResponse> listarPorResidencia(Long residenciaId, Pageable pageable);

  OcupacaoCalendarioResponse ocupacaoCalendario(Long quartoId);
}

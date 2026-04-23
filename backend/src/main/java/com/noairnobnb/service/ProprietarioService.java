package com.noairnobnb.service;

import com.noairnobnb.dto.request.ProprietarioUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ProprietarioResponse;
import org.springframework.data.domain.Pageable;

public interface ProprietarioService {
  PageResponse<ProprietarioResponse> listarTodos(Pageable pageable);

  ProprietarioResponse perfilAutenticado();

  ProprietarioResponse atualizarAutenticado(ProprietarioUpdateRequest request);
}
